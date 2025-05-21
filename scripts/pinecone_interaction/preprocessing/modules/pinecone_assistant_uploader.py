import os
import logging
import json

import time
from pathlib import Path
from typing import Dict, Any, Tuple, Optional

from dotenv import load_dotenv
from tenacity import (
    retry,
    wait_exponential,
    stop_after_attempt,
    retry_if_exception_type,
)


from pinecone import Pinecone
from pinecone.exceptions import PineconeException


LOG_FILENAME = "pinecone_assistant_uploader.log"
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(module)s - %(funcName)s - %(message)s",
    handlers=[logging.FileHandler(LOG_FILENAME, mode="w"), logging.StreamHandler()],
)
logger = logging.getLogger(__name__)

load_dotenv()


METADATA_FILE_PATH = "/mnt/c/Users/korsz/OneDrive/Pulpit/my_arxiv_output/metadata.jsonl"
PDFS_BASE_DIR_PATH = "/mnt/c/Users/korsz/OneDrive/Pulpit/my_arxiv_output/pdfs"


ENV_PINECONE_API_KEY = "PINECONE_API_KEY"
ENV_PINECONE_ENVIRONMENT = "PINECONE_ENVIRONMENT"
ENV_PINECONE_ASSISTANT_ID = "PINECONE_ASSISTANT_ID"


DEFAULT_RETRY_ATTEMPTS = 3
DEFAULT_RETRY_WAIT_MULTIPLIER = 1
DEFAULT_RETRY_MAX_WAIT = 60
MAX_FILES_TO_UPLOAD_FOR_TESTING = 3


def load_configuration() -> Tuple[str, str, str]:
    """Loads Pinecone API key, environment, and Assistant ID from environment variables.

    Returns:
        Tuple[str, str, str]: A tuple containing the API key, environment, and Assistant ID.

    Raises:
        ValueError: If any of the required Pinecone configuration environment
            variables (PINECONE_API_KEY, PINECONE_ENVIRONMENT, PINECONE_ASSISTANT_ID)
            are not set.
    """
    api_key = os.getenv("PINECONE_API_KEY")
    environment = os.getenv("PINECONE_ENVIRONMENT")
    assistant_id = os.getenv("PINECONE_ASSISTANT_ID")

    if not api_key:
        raise ValueError("Pinecone API key not found. Set PINECONE_API_KEY env var.")
    if not environment:
        raise ValueError(
            "Pinecone environment not found. Set PINECONE_ENVIRONMENT env var."
        )
    if not assistant_id:
        raise ValueError(
            "Pinecone Assistant ID not found. Set PINECONE_ASSISTANT_ID env var."
        )

    logger.info(
        f"Configuration loaded: Using Assistant ID: {assistant_id} in environment: {environment}"
    )
    return api_key, environment, assistant_id


retry_upload = retry(
    wait=wait_exponential(
        multiplier=DEFAULT_RETRY_WAIT_MULTIPLIER, max=DEFAULT_RETRY_MAX_WAIT
    ),
    stop=stop_after_attempt(DEFAULT_RETRY_ATTEMPTS),
    retry=retry_if_exception_type((PineconeException, ConnectionError, TimeoutError)),
    reraise=True,
)


@retry_upload
def _upload_to_pinecone_with_retry(
    assistant_obj: Any, pdf_path_str: str, metadata_dict: Dict[str, Any]
) -> Any:
    """Makes the actual API call to upload the file to Pinecone Assistant, wrapped in tenacity for retries.

    This function is intended to be decorated with `retry_upload` to handle
    transient network issues or API errors during the file upload process.

    Args:
        assistant_obj (Any): The initialized Pinecone Assistant object, which is
            expected to have an `upload_file` method.
        pdf_path_str (str): The absolute string path to the PDF file to be uploaded.
        metadata_dict (Dict[str, Any]): A dictionary containing metadata associated
            with the file. This metadata will be passed to the `upload_file` method.

    Returns:
        Any: The result of the `assistant_obj.upload_file()` call, typically a
            resource object representing the uploaded file in Pinecone.

    Raises:
        PineconeException: If the Pinecone API returns an error after all retries.
        ConnectionError: If a connection error occurs after all retries.
        TimeoutError: If the operation times out after all retries.
    """
    logger.debug(
        f"Calling assistant.upload_file for '{pdf_path_str}' (Attempt: {_upload_to_pinecone_with_retry.retry.statistics.get('attempt_number', 1)})"
    )

    file_resource = assistant_obj.upload_file(
        file_path=pdf_path_str, metadata=metadata_dict
    )
    return file_resource


def upload_single_pdf_to_assistant(
    pinecone_api_key: str,
    pinecone_environment: str,
    assistant_id: str,
    pdf_path: Path,
    metadata: Dict[str, Any],
) -> Tuple[bool, Optional[str], Optional[str]]:
    """Uploads a single PDF file to the specified Pinecone Assistant.

    This function handles the initialization of the Pinecone client,
    checks for the existence of the PDF file, and attempts to upload it
    using the `_upload_to_pinecone_with_retry` helper function. It
    captures various exceptions that might occur during the process.

    Args:
        pinecone_api_key (str): The API key for Pinecone.
        pinecone_environment (str): The Pinecone environment (e.g., 'gcp-starter').
        assistant_id (str): The ID or name of the Pinecone Assistant to which
            the file will be uploaded.
        pdf_path (Path): A Path object representing the PDF file to be uploaded.
        metadata (Dict[str, Any]): A dictionary of metadata to be associated
            with the uploaded PDF.

    Returns:
        Tuple[bool, Optional[str], Optional[str]]: A tuple containing:
            - success_status (bool): True if the upload was successful (or skipped
              due to a non-error condition like size limit if it were still active),
              False otherwise.
            - pinecone_file_id (Optional[str]): The ID assigned by Pinecone to
              the uploaded file if successful, None otherwise.
            - error_message (Optional[str]): A string containing an error message
              if the upload failed or was skipped, None if successful.
    """
    if not isinstance(pdf_path, Path):
        pdf_path = Path(pdf_path)

    if not pdf_path.exists() or not pdf_path.is_file():
        err_msg = f"PDF file not found or is not a file: {pdf_path}"
        logger.error(err_msg)
        return False, None, err_msg

    logger.info(
        f"Attempting to upload '{pdf_path.name}' to Assistant ID: {assistant_id}"
    )

    pc: Optional[Pinecone] = None
    try:
        logger.debug("Initializing Pinecone client...")
        pc = Pinecone(api_key=pinecone_api_key, environment=pinecone_environment)

        logger.debug(f"Getting handle for Assistant ID: {assistant_id}")

        target_assistant = pc.assistant.Assistant(assistant_name=assistant_id)

        logger.debug(
            f"Successfully got assistant object for ID/Name: {target_assistant.name if hasattr(target_assistant, 'name') else assistant_id}"
        )

        file_resource = _upload_to_pinecone_with_retry(
            assistant_obj=target_assistant,
            pdf_path_str=str(pdf_path.resolve()),
            metadata_dict=metadata,
        )

        file_id = getattr(file_resource, "id", None)
        if file_id:
            logger.info(
                f"Successfully uploaded '{pdf_path.name}'. Pinecone File ID: {file_id}"
            )
            return True, file_id, None
        else:

            err_msg = f"Upload API call succeeded for '{pdf_path.name}' but no file ID was found in response: {file_resource!r}"
            logger.error(err_msg)
            return False, None, err_msg

    except PineconeException as e:

        err_msg = f"Pinecone API error during upload of '{pdf_path.name}': {e}"
        logger.error(err_msg, exc_info=False)
        return False, None, err_msg
    except ConnectionError as e:
        err_msg = f"Connection error during upload of '{pdf_path.name}': {e}"
        logger.error(err_msg, exc_info=True)
        return False, None, err_msg
    except TimeoutError as e:
        err_msg = f"Timeout during upload of '{pdf_path.name}': {e}"
        logger.error(err_msg, exc_info=True)
        return False, None, err_msg
    except Exception as e:

        err_msg = f"Unexpected error during upload of '{pdf_path.name}': {e}"
        logger.error(err_msg, exc_info=True)
        return False, None, err_msg
    finally:
        if pc:
            try:

                pass
            except Exception as e:
                logger.warning(f"Error during Pinecone client cleanup (if any): {e}")


def process_pdfs_from_metadata_file(
    metadata_jsonl_path: Path,
    pdfs_base_dir: Path,
    assistant_id: str,
    pinecone_api_key: str,
    pinecone_environment: str,
    max_files_to_process: Optional[int] = None,
) -> None:
    """Reads a metadata JSONL file, finds corresponding PDF files, and uploads them to Pinecone Assistant.

    It iterates through each line in the metadata file, expecting each line
    to be a JSON object containing at least 'paper_id' and
    'extracted_pdf_filename'. For each entry, it constructs the full path
    to the PDF file and attempts to upload it using
    `upload_single_pdf_to_assistant`.

    Args:
        metadata_jsonl_path (Path): Path to the JSONL file. Each line should be
            a JSON string with 'paper_id' and 'extracted_pdf_filename' keys.
        pdfs_base_dir (Path): The base directory where the PDF files (referenced
            by 'extracted_pdf_filename' in the metadata) are stored.
        assistant_id (str): The ID or name of the Pinecone Assistant.
        pinecone_api_key (str): The Pinecone API key.
        pinecone_environment (str): The Pinecone environment.
        max_files_to_process (Optional[int]): If provided, limits the number
            of PDF files processed from the metadata file.
    """
    if not metadata_jsonl_path.exists() or not metadata_jsonl_path.is_file():
        logger.error(f"Metadata JSONL file not found: {metadata_jsonl_path}")
        return
    if not pdfs_base_dir.exists() or not pdfs_base_dir.is_dir():
        logger.error(f"PDFs base directory not found: {pdfs_base_dir}")
        return

    logger.info(f"Starting batch PDF upload from metadata file: {metadata_jsonl_path}")
    logger.info(f"Looking for PDFs in base directory: {pdfs_base_dir}")

    successful_uploads = 0

    failed_uploads = 0
    total_processed = 0

    try:
        with open(metadata_jsonl_path, "r", encoding="utf-8") as f_meta:
            for line_number, line in enumerate(f_meta, 1):
                if (
                    max_files_to_process is not None
                    and total_processed >= max_files_to_process
                ):
                    logger.info(
                        f"Reached processing limit of {max_files_to_process} files. Stopping."
                    )
                    break
                total_processed += 1
                logger.info(f"--- Processing metadata entry {line_number} ---")
                try:
                    metadata_dict = json.loads(line.strip())
                except json.JSONDecodeError as e:
                    logger.error(
                        f"Skipping line {line_number} due to JSON decode error: {e}. Line: '{line.strip()}'"
                    )
                    failed_uploads += 1
                    continue

                paper_id = metadata_dict.get("paper_id")
                extracted_pdf_filename = metadata_dict.get("extracted_pdf_filename")

                if not paper_id or not extracted_pdf_filename:
                    logger.error(
                        f"Skipping line {line_number} due to missing 'paper_id' or 'extracted_pdf_filename' "
                        f"in metadata: {metadata_dict}"
                    )
                    failed_uploads += 1
                    continue

                logger.info(
                    f"Processing Paper ID: {paper_id}, PDF Filename: {extracted_pdf_filename}"
                )

                current_pdf_path = pdfs_base_dir / extracted_pdf_filename

                success, file_id, error_message = upload_single_pdf_to_assistant(
                    pinecone_api_key=pinecone_api_key,
                    pinecone_environment=pinecone_environment,
                    assistant_id=assistant_id,
                    pdf_path=current_pdf_path,
                    metadata=metadata_dict,
                )

                if success:
                    if file_id:
                        successful_uploads += 1
                        logger.info(
                            f"Successfully uploaded {paper_id} ({extracted_pdf_filename}). Pinecone File ID: {file_id}"
                        )

                else:
                    failed_uploads += 1
                    logger.error(
                        f"Failed to upload {paper_id} ({extracted_pdf_filename}). Error: {error_message}"
                    )

    except Exception as e:
        logger.error(
            f"An unexpected error occurred during batch processing: {e}", exc_info=True
        )
    finally:
        logger.info("--- Batch Upload Summary ---")
        logger.info(f"Total metadata entries processed: {total_processed}")
        logger.info(f"Successfully uploaded: {successful_uploads}")

        logger.info(f"Failed uploads: {failed_uploads}")
        logger.info("----------------------------")


def main():
    """Main function to orchestrate the PDF upload process to Pinecone Assistant.

    This function initializes logging, loads necessary configurations (API keys,
    paths) using hardcoded constants and environment variables, and then calls
    `process_pdfs_from_metadata_file` to handle the batch upload of PDFs.
    It includes error handling for configuration issues and other unexpected
    exceptions.
    """

    logger.info(f"Pinecone Assistant Uploader started. Logging to {LOG_FILENAME}")
    logger.info(f"Using metadata file path: {METADATA_FILE_PATH}")
    logger.info(f"Using PDFs base directory: {PDFS_BASE_DIR_PATH}")
    if MAX_FILES_TO_UPLOAD_FOR_TESTING is not None:
        logger.info(
            f"TEST MODE: Will process at most {MAX_FILES_TO_UPLOAD_FOR_TESTING} files."
        )

    metadata_file_p = Path(METADATA_FILE_PATH)
    pdfs_dir_p = Path(PDFS_BASE_DIR_PATH)

    try:
        api_key, environment, assistant_id_from_env = load_configuration()

        process_pdfs_from_metadata_file(
            metadata_jsonl_path=metadata_file_p,
            pdfs_base_dir=pdfs_dir_p,
            assistant_id=assistant_id_from_env,
            pinecone_api_key=api_key,
            pinecone_environment=environment,
            max_files_to_process=10,
        )
    except ValueError as e:
        logger.critical(f"Configuration error: {e}")
        print(
            f"Error: {e}. Please check your environment variables ({ENV_PINECONE_API_KEY}, {ENV_PINECONE_ENVIRONMENT}, {ENV_PINECONE_ASSISTANT_ID})."
        )
    except FileNotFoundError:
        logger.critical(
            f"Error: Metadata file '{METADATA_FILE_PATH}' or PDF directory '{PDFS_BASE_DIR_PATH}' not found. Please check the paths in the script."
        )
        print(
            f"Error: One or more configured paths not found. Please check METADATA_FILE_PATH and PDFS_BASE_DIR_PATH constants in the script."
        )
    except Exception as e:
        logger.critical(
            f"An unexpected critical error occurred in main: {e}", exc_info=True
        )
        print(f"An unexpected error occurred: {e}")


if __name__ == "__main__":
    main()
