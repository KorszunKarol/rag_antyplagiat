"""Main script for RAG knowledge base preprocessing."""

import os
import sys
import json
import argparse
import logging
from typing import List  # Import List for type hint
from dotenv import load_dotenv
from modules.loader import load_jsonl_data, load_json_data, load_data_generator
from modules.chunker import (
    create_text_chunks,
    chunk_text_fixed_size,
    CHUNK_SIZE,
    CHUNK_OVERLAP,
)
from modules.embedder import (
    generate_dummy_embeddings,
    load_openai_key,
    generate_embeddings,
)

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

load_dotenv()


FORCE_USE_SAMPLE_DATA = True
BATCH_SIZE = 100


SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DEFAULT_SAMPLE_PATH = os.path.join(SCRIPT_DIR, "data", "sample_arxiv_record.json")

DATA_SOURCE_PATH = os.getenv("DATA_SOURCE_PATH", "./data/sample_arxiv_record.jsonl")
FORCE_USE_SAMPLE_DATA = True
SAMPLE_DATA_PATH = "./data/sample_arxiv_record.jsonl"

OUTPUT_EMBEDDINGS_FILE = "processed_embeddings.jsonl"

EMBEDDING_BATCH_SIZE = 50

if FORCE_USE_SAMPLE_DATA:
    effective_data_path = DEFAULT_SAMPLE_PATH
    print(
        f"Info: FORCE_USE_SAMPLE_DATA is True. Using sample data: {effective_data_path}"
    )
else:
    env_data_path = os.getenv("DATA_SOURCE_PATH")
    if env_data_path:
        effective_data_path = env_data_path
    else:
        effective_data_path = DEFAULT_SAMPLE_PATH
        print(
            "Warning: DATA_SOURCE_PATH environment variable not set and FORCE_USE_SAMPLE_DATA is False.",
            file=sys.stderr,
        )
        print(
            f"Falling back to default sample data: {effective_data_path}",
            file=sys.stderr,
        )


def save_batch_local(batch: List[dict], output_path: str):
    """Appends a batch of processed chunk data dictionaries to a JSON Lines file.

    Each dictionary in the batch is converted to a JSON string and written
    as a new line in the specified output file.

    Args:
        batch (List[dict]): A list of dictionaries, where each dictionary represents a
               processed chunk (including paper_id, chunk_index, chunk_text,
               and embedding).
        output_path (str): The path to the JSON Lines file to append to.

    Raises:
        IOError: If there is an error writing to the file.
        Exception: For other unexpected errors during file writing.
    """
    try:
        with open(output_path, "a", encoding="utf-8") as f:
            for item in batch:
                json.dump(item, f)
                f.write("\n")
        logging.info(f"Successfully appended {len(batch)} records to {output_path}")
    except IOError as e:
        logging.error(f"Error writing batch to {output_path}: {e}")
        raise
    except Exception as e:
        logging.error(f"An unexpected error occurred during file writing: {e}")
        raise


def main():
    """Main execution function for the preprocessing script.

    Orchestrates the entire workflow:
    1. Loads configuration (API key, data paths).
    2. Determines the data source to use.
    3. Clears any previous output file.
    4. Loads records from the source file using a generator.
    5. Processes each record: combines text, chunks it, and structures chunk data.
    6. Accumulates all structured chunks.
    7. Generates embeddings for the chunks in batches using the OpenAI API.
    8. Saves the batches (including embeddings) to a local JSON Lines file.
    """
    logging.info("Starting preprocessing script...")

    api_key = load_openai_key()
    if not api_key:
        logging.error("Failed to load OpenAI API key. Exiting.")
        return
    logging.info("OpenAI API key loaded successfully.")

    data_path = SAMPLE_DATA_PATH if FORCE_USE_SAMPLE_DATA else DATA_SOURCE_PATH
    logging.info(f"Using data source: {data_path}")

    try:
        with open(OUTPUT_EMBEDDINGS_FILE, "w") as f:
            pass
        logging.info(f"Cleared existing output file: {OUTPUT_EMBEDDINGS_FILE}")
    except IOError as e:
        logging.error(f"Error clearing output file {OUTPUT_EMBEDDINGS_FILE}: {e}")
        return

    data_generator = load_data_generator(data_path)

    all_processed_chunks = []
    record_count = 0

    logging.info("Processing records...")
    for record in data_generator:
        record_count += 1
        if record is None:
            logging.warning(f"Skipping invalid record number {record_count}")
            continue

        try:
            title = record.get("title", "No Title").strip()
            abstract = record.get("abstract", "No Abstract").strip()
            paper_id = record.get("id")

            if not paper_id:
                logging.warning(f"Record {record_count} missing 'id'. Skipping.")
                continue

            text_to_chunk = f"Title: {title}\n\n{abstract}"
            if (
                not text_to_chunk.strip()
                or text_to_chunk == "Title: No Title\n\nNo Abstract"
            ):
                logging.warning(
                    f"Record {paper_id} has no text content to chunk. Skipping."
                )
                continue

            text_chunks = chunk_text_fixed_size(
                text_to_chunk, CHUNK_SIZE, CHUNK_OVERLAP
            )
            logging.debug(f"Record {paper_id}: Created {len(text_chunks)} chunks.")

            for index, chunk_text in enumerate(text_chunks):
                chunk_data = {
                    "paper_id": paper_id,
                    "chunk_index": index,
                    "chunk_text": chunk_text,
                    "embedding": None,
                }
                all_processed_chunks.append(chunk_data)

        except Exception as e:
            logging.error(
                f"Error processing record {record_count} (ID: {record.get('id', 'N/A')}): {e}"
            )
            continue

        if record_count % 100 == 0:
            logging.info(f"Processed {record_count} records...")

    logging.info(f"Finished reading records. Total records processed: {record_count}")
    logging.info(f"Total chunks created: {len(all_processed_chunks)}")

    logging.info("Starting embedding generation and saving...")
    num_chunks = len(all_processed_chunks)
    for i in range(0, num_chunks, EMBEDDING_BATCH_SIZE):
        batch = all_processed_chunks[i : i + EMBEDDING_BATCH_SIZE]
        batch_texts = [item["chunk_text"] for item in batch]

        logging.info(
            f"Generating embeddings for batch {i // EMBEDDING_BATCH_SIZE + 1} ({len(batch)} chunks)..."
        )
        embeddings = generate_embeddings(batch_texts, api_key)

        if embeddings is not None and len(embeddings) == len(batch):
            for j, embedding in enumerate(embeddings):
                batch[j]["embedding"] = embedding

            try:
                save_batch_local(batch, OUTPUT_EMBEDDINGS_FILE)
            except Exception as e:
                logging.error(
                    f"Failed to save batch starting at index {i} due to error: {e}. Continuing..."
                )
                continue
        else:
            logging.error(
                f"Failed to generate embeddings for batch starting at index {i}. Skipping save for this batch."
            )

    logging.info("Preprocessing script finished.")


if __name__ == "__main__":
    main()
