"""Script to test and visualize the text chunking functionality."""

import os
import json
import logging
from typing import List, Dict, Any

from modules.chunker import chunk_text_fixed_size, CHUNK_SIZE, CHUNK_OVERLAP
from modules.loader import load_data_generator

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def test_chunking(input_path: str, output_path: str):
    """Tests the chunking functionality on real data and saves the results.

    Args:
        input_path (str): Path to the input data file.
        output_path (str): Path where the test results will be saved.
    """
    logging.info(f"Testing chunking with input: {input_path}")
    logging.info(f"Will save results to: {output_path}")

    data_generator = load_data_generator(input_path)
    record_count = 0
    chunks_info = []

    with open(output_path, "w", encoding="utf-8") as f:
        for record in data_generator:
            if record is None:
                continue

            record_count += 1
            logging.info(
                f"Processing record {record_count}: {record.get('id', 'unknown')}"
            )

            title = record.get("title", "No Title").strip()
            abstract = record.get("abstract", "No Abstract").strip()
            paper_id = record.get("id", f"unknown_{record_count}")

            combined_text = f"Title: {title}\n\n{abstract}"
            chunks = chunk_text_fixed_size(combined_text, CHUNK_SIZE, CHUNK_OVERLAP)

            record_info = {
                "paper_id": paper_id,
                "title": title[:100] + "..." if len(title) > 100 else title,
                "total_text_length": len(combined_text),
                "num_chunks": len(chunks),
                "chunks": [],
            }

            for i, chunk in enumerate(chunks):
                chunk_info = {
                    "chunk_id": i,
                    "length": len(chunk),
                    "preview": chunk[:50] + "..." if len(chunk) > 50 else chunk,
                }
                record_info["chunks"].append(chunk_info)

            chunks_info.append(record_info)
            f.write(json.dumps(record_info, indent=2))
            f.write("\n\n---\n\n")

    logging.info(f"Testing complete. Processed {record_count} records.")
    logging.info(f"Results saved to {output_path}")

    return chunks_info


def print_chunking_summary(chunks_info: List[Dict[str, Any]]):
    """Prints a summary of the chunking results to the console.

    Args:
        chunks_info (List[Dict[str, Any]]): List of chunking results per record.
    """
    if not chunks_info:
        logging.info("No records processed.")
        return

    total_records = len(chunks_info)
    total_chunks = sum(info["num_chunks"] for info in chunks_info)
    avg_chunks_per_record = total_chunks / total_records

    logging.info(f"\n----- CHUNKING SUMMARY -----")
    logging.info(f"Total records processed: {total_records}")
    logging.info(f"Total chunks created: {total_chunks}")
    logging.info(f"Average chunks per record: {avg_chunks_per_record:.2f}")
    logging.info(f"Chunk size: {CHUNK_SIZE}, Overlap: {CHUNK_OVERLAP}")

    record_details = []
    for i, info in enumerate(chunks_info):
        record_details.append(
            f"{i+1}. {info['paper_id']}: {info['num_chunks']} chunks from {info['total_text_length']} chars"
        )

    logging.info("\nRECORD DETAILS:")
    for detail in record_details:
        logging.info(detail)

    logging.info("--------------------------")


def main():
    """Runs the chunking test on sample data."""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    sample_data_path = os.path.join(script_dir, "data", "sample_arxiv_record.json")
    output_path = os.path.join(script_dir, "test_chunking_output.txt")

    chunks_info = test_chunking(sample_data_path, output_path)
    print_chunking_summary(chunks_info)

    logging.info(f"View full details in: {output_path}")


if __name__ == "__main__":
    main()
