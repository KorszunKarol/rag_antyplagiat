import tarfile
import os
import logging
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterator, Dict, Optional, List, Tuple
from dataclasses import dataclass, field
from dotenv import load_dotenv
import json

from .types import Paper

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(module)s - %(funcName)s - %(message)s",
    filename="pdf_extractor_direct.log",
    filemode="w",
)

console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_formatter = logging.Formatter("%(levelname)s - %(message)s")
console_handler.setFormatter(console_formatter)
logging.getLogger().addHandler(console_handler)

load_dotenv()

DEFAULT_SUPPORTED_EXTENSIONS = [".pdf"]
ARXIV_DATA_PATH = os.getenv("ARXIV_DATA_PATH")


@dataclass
class ExtractionConfig:
    """Configuration for the PDF extraction process from PDF tarballs."""

    supported_extensions: List[str] = field(
        default_factory=lambda: DEFAULT_SUPPORTED_EXTENSIONS
    )


def _extract_paper_id_from_filename(pdf_filename: str) -> Optional[str]:
    """Extracts paper ID from the PDF filename.

    Assumes a format like 'YYYY.NNNNN.pdf' or 'YYYY.NNNNNvV.pdf'.
    The paper ID is 'YYYY.NNNNN' or 'YYYY.NNNNNvV'.
    The regex pattern captures the ID part: (\d{4}\.\d{5,}(?:v\d+)?)
    followed by a lookahead for .pdf at the end of the string.

    Args:
        pdf_filename: The name of the PDF file (e.g., '2301.00001.pdf').

    Returns:
        The extracted paper_id string or None if the format doesn't match.
    """
    logging.debug(
        f"Attempting to extract paper ID from filename: '{pdf_filename}' (Length: {len(pdf_filename)})"
    )
    regex_pattern = r"(\d{4}\.\d{5,}(?:v\d+)?)(?=\.pdf$)"
    logging.debug(f"Using regex pattern: {regex_pattern}")
    match = re.search(regex_pattern, pdf_filename, re.IGNORECASE)
    logging.debug(f"Regex match object for '{pdf_filename}': {match}")

    if match:
        paper_id = match.group(1)
        logging.debug(
            f"  Successfully extracted ID: {paper_id} from PDF filename: '{pdf_filename}'"
        )
        return paper_id
    else:
        logging.warning(
            f"  Could not extract paper ID from PDF filename format: '{pdf_filename}' using regex."
        )
        return None


def iter_extracted_content(
    input_dir: Path, config: Optional[ExtractionConfig] = None
) -> Iterator[Paper]:
    """Iterates through .tar archives (expected to be arXiv PDF tarballs)
    and directly extracts PDF files found within them.

    Args:
        input_dir: The pathlib.Path object representing the directory
                   containing the PDF .tar archives (e.g., arXiv_pdf_YYMM_NNN.tar).
        config: An optional ExtractionConfig object. Defaults (for .pdf) will be used if None.

    Yields:
        A `Paper` object for each processed .pdf file found within the .tar archives.

    Raises:
        FileNotFoundError: If the input directory does not exist.
        NotADirectoryError: If the input path is not a directory.
    """
    assert isinstance(input_dir, Path), "Input directory must be a Path object"
    if not input_dir.exists():
        logging.error(f"Input directory not found: {input_dir}")
        raise FileNotFoundError(f"Input directory not found: {input_dir}")
    if not input_dir.is_dir():
        logging.error(f"Input path is not a directory: {input_dir}")
        raise NotADirectoryError(f"Input path is not a directory: {input_dir}")

    effective_config = config if config is not None else ExtractionConfig()
    assert isinstance(
        effective_config, ExtractionConfig
    ), "Effective config must be an ExtractionConfig object"
    assert (
        len(effective_config.supported_extensions) > 0
    ), "Supported extensions list in config must not be empty"
    assert all(
        ext.startswith(".") for ext in effective_config.supported_extensions
    ), "Config extensions should start with '.'"

    logging.info(f"Starting direct PDF extraction from PDF tarballs in: {input_dir}")
    logging.info(
        f"Supported file extensions for extraction: {effective_config.supported_extensions}"
    )

    processed_pdf_files_count = 0
    yielded_papers_count = 0
    processed_tar_archives = 0

    try:
        tar_files = list(input_dir.glob("*.tar"))
    except Exception as e:
        logging.error(f"Error listing .tar files in {input_dir}: {e}", exc_info=True)
        return

    logging.info(f"Found {len(tar_files)} .tar archives to process.")

    for tar_path in tar_files:
        assert tar_path.is_file(), f"Archive path {tar_path} should be a file"
        processed_tar_archives += 1
        logging.info(f"Processing PDF tarball: {tar_path.name}")

        try:
            with tarfile.open(tar_path, "r:") as archive:
                members = archive.getmembers()
                logging.debug(f"Found {len(members)} members in {tar_path.name}")

                for member in members:
                    logging.debug(
                        f"  Inspecting member: '{member.name}' (IsFile: {member.isfile()}, IsDir: {member.isdir()}) "
                    )
                    if not member.isfile() or not member.name.lower().endswith(
                        tuple(effective_config.supported_extensions)
                    ):
                        if member.isfile():
                            logging.debug(
                                f"    -> Member '{member.name}' is a file, but does not have a supported PDF extension. Skipping."
                            )
                        elif member.isdir():
                            logging.debug(
                                f"    -> Member '{member.name}' is a directory. Skipping."
                            )
                        else:
                            logging.debug(
                                f"    -> Member '{member.name}' is not a regular file or directory. Skipping."
                            )
                        continue

                    pdf_filename = Path(member.name).name
                    paper_id = _extract_paper_id_from_filename(pdf_filename)

                    if not paper_id:
                        logging.warning(
                            f"  Could not derive paper ID for PDF member: {member.name} in {tar_path.name}. Skipping."
                        )
                        continue

                    logging.info(
                        f"  Found PDF: '{member.name}' (Paper ID: {paper_id}, Size: {member.size} bytes)"
                    )
                    processed_pdf_files_count += 1
                    paper = Paper(paper_id=paper_id, source_gz_member_name=member.name)

                    # Set the source tar filename for the V2 metadata schema
                    paper.source_tar_filename = tar_path.name

                    try:
                        pdf_file_obj = archive.extractfile(member)
                        if not pdf_file_obj:
                            logging.warning(
                                f"    Could not extract PDF member stream: {member.name}"
                            )
                            paper.extraction_error = (
                                "Could not extract PDF member stream"
                            )
                        else:
                            paper.pdf_content = pdf_file_obj.read()
                            pdf_file_obj.close()
                            assert isinstance(
                                paper.pdf_content, bytes
                            ), "PDF content should be bytes"
                            logging.debug(
                                f"    Successfully read {len(paper.pdf_content)} bytes for {paper_id}"
                            )
                    except Exception as e:
                        logging.error(
                            f"    Error reading content of PDF member {member.name}: {e}",
                            exc_info=True,
                        )
                        paper.extraction_error = f"Error reading PDF content: {e}"

                    yielded_papers_count += 1
                    yield paper

        except tarfile.ReadError as e:
            logging.error(
                f"Could not read PDF tarball {tar_path.name}: {e} (Skipping this tar)"
            )
        except Exception as e:
            logging.error(
                f"An unexpected error occurred processing PDF tarball {tar_path.name}: {e} (Skipping this tar)",
                exc_info=True,
            )

    logging.info(f"Finished direct PDF extraction from: {input_dir}.")
    logging.info(f"Processed {processed_tar_archives} .tar archives.")
    logging.info(
        f"Found and attempted processing for {processed_pdf_files_count} PDF files."
    )
    logging.info(
        f"Yielded {yielded_papers_count} Paper objects (some may have errors)."
    )


def main_test_extraction():
    """
    Main function to run a sample extraction process when the script is executed directly.
    It processes a configurable number of papers from PDF tarballs, logs results,
    saves metadata to a JSONL file, and saves successfully extracted PDF files.
    Output locations and target count can be set via environment variables:
    - ARXIV_DATA_PATH: Path to the directory containing arXiv_pdf_*.tar files (mandatory).
    - EXTRACTOR_TARGET_COUNT: Number of papers to attempt to process (default: 20, aims for 1000 if default is hit).
    - EXTRACTOR_OUTPUT_PDF_DIR: Directory to save extracted PDF files (default: sample_direct_extracted_pdfs).
    - EXTRACTOR_OUTPUT_METADATA_FILE: Path for the JSONL metadata file (default: extracted_direct_pdfs_sample.jsonl).
    """
    folder_path_str = ARXIV_DATA_PATH
    if not folder_path_str:
        logging.error(
            "ARXIV_DATA_PATH environment variable not set. Please set it to the path "
            "of the data folder containing arXiv_pdf_*.tar files."
        )
        exit(1)

    folder_path = Path(folder_path_str)
    if not folder_path.is_dir():
        logging.error(
            f"Provided ARXIV_DATA_PATH ('{folder_path_str}') is not a directory: "
            f"{folder_path.resolve()}"
        )
        logging.error(
            "Please ensure ARXIV_DATA_PATH is set correctly and points to the directory "
            "containing the arXiv_pdf_*.tar files."
        )
        exit(1)

    extracted_papers_with_pdf = 0
    total_pdf_bytes_extracted = 0
    error_count = 0
    papers_processed_sample = 0

    # Configuration from environment variables with defaults
    try:
        default_target_count = 20
        target_count_str = os.getenv("EXTRACTOR_TARGET_COUNT")
        if target_count_str:
            max_papers_to_process = int(target_count_str)
            logging.info(
                f"EXTRACTOR_TARGET_COUNT set: Aiming for {max_papers_to_process} papers."
            )
        else:
            max_papers_to_process = (
                1000  # User wants 1000, use this if env var is not set.
            )
            logging.info(
                f"EXTRACTOR_TARGET_COUNT not set. Defaulting to aim for {max_papers_to_process} papers "
                f"(override with EXTRACTOR_TARGET_COUNT env var for the old {default_target_count} behavior)."
            )
    except ValueError:
        logging.warning(
            f"Invalid value for EXTRACTOR_TARGET_COUNT: '{target_count_str}'. "
            f"Using default aim of 1000 papers."
        )
        max_papers_to_process = 1000

    output_pdf_dir_str = os.getenv(
        "EXTRACTOR_OUTPUT_PDF_DIR", "sample_direct_extracted_pdfs"
    )
    output_metadata_file_str = os.getenv(
        "EXTRACTOR_OUTPUT_METADATA_FILE", "extracted_direct_pdfs_sample.jsonl"
    )

    output_jsonl_file = Path(output_metadata_file_str)
    pdfs_output_dir = Path(output_pdf_dir_str)

    try:
        pdfs_output_dir.mkdir(parents=True, exist_ok=True)
        logging.info(f"Extracted PDFs will be saved to: {pdfs_output_dir.resolve()}")
    except OSError as e:
        logging.error(
            f"Could not create PDF output directory {pdfs_output_dir}: {e}. PDFs may not be saved."
        )
        # Allow to continue to at least try to save metadata.

    logging.info(
        f"Starting direct PDF extraction run (aiming for {max_papers_to_process} "
        f"papers with PDFs or errors) from PDF tarballs in: {folder_path}"
    )
    logging.info(f"Saving PDF metadata to: {output_jsonl_file.resolve()}")

    try:
        with open(output_jsonl_file, "w", encoding="utf-8") as f_out:
            for paper in iter_extracted_content(folder_path):
                assert isinstance(paper, Paper), "Iterator should yield Paper objects"

                papers_processed_sample += 1
                print("-" * 80)

                # Get the current timestamp in ISO 8601 format with UTC timezone
                extraction_timestamp = datetime.now(timezone.utc).isoformat()

                # Extract the tar filename from paper.source_gz_member_name
                # This assumes the source_gz_member_name is populated during extraction
                # and contains the path within the tar file
                source_tar_filename = ""
                if hasattr(paper, "source_tar_filename") and paper.source_tar_filename:
                    source_tar_filename = paper.source_tar_filename

                # Initialize the V2 metadata dictionary
                paper_dict_to_save = {
                    "paper_id": paper.paper_id,
                    "source_tar_filename": source_tar_filename,
                    "source_member_path": paper.source_gz_member_name,
                    "status": "unknown",  # Will be set based on conditions below
                    "error_details": paper.extraction_error,
                    "extracted_pdf_filename": None,
                    "extracted_pdf_size_bytes": 0,
                    "extraction_timestamp_utc": extraction_timestamp,
                    "arxiv_abstract_url": f"https://arxiv.org/abs/{paper.paper_id}",
                    "arxiv_pdf_url": f"https://arxiv.org/pdf/{paper.paper_id}.pdf",
                }

                # Determine status and handle PDF extraction/saving
                if paper.has_errors() or not paper.pdf_content:
                    error_count += 1
                    paper_dict_to_save["status"] = "extraction_failed_content"
                    if not paper.extraction_error:
                        paper.extraction_error = (
                            "PDF content is missing without specific error"
                        )
                    logging.warning(
                        f"Paper ID {paper.paper_id} - Problem: {paper.extraction_error}"
                    )
                    paper_dict_to_save["error_details"] = paper.extraction_error
                elif paper.pdf_content:
                    # PDF content was successfully extracted
                    extracted_papers_with_pdf += 1
                    current_pdf_size = len(paper.pdf_content)
                    total_pdf_bytes_extracted += current_pdf_size
                    logging.info(
                        f"Paper ID {paper.paper_id} - PDF Extracted: {current_pdf_size} bytes from '{paper.source_gz_member_name}'."
                    )

                    paper_dict_to_save["extracted_pdf_size_bytes"] = current_pdf_size

                    # Prepare to save the PDF file
                    sanitized_paper_id = paper.paper_id.replace("/", "_")
                    pdf_filename = f"{sanitized_paper_id}.pdf"
                    pdf_save_path = pdfs_output_dir / pdf_filename

                    try:
                        if pdfs_output_dir.exists():
                            with open(pdf_save_path, "wb") as pdf_file:
                                pdf_file.write(paper.pdf_content)
                            logging.info(
                                f"  -> Saved extracted PDF to: {pdf_save_path}"
                            )

                            # Update metadata for successful save
                            paper_dict_to_save["status"] = "extracted_and_saved"
                            paper_dict_to_save["extracted_pdf_filename"] = pdf_filename
                        else:
                            logging.warning(
                                f"  -> PDF output directory {pdfs_output_dir} not available. Skipping PDF save for {paper.paper_id}."
                            )
                            paper_dict_to_save["status"] = "save_failed"
                            paper_dict_to_save["error_details"] = (
                                "PDF output directory unavailable"
                            )
                    except IOError as e:
                        logging.error(f"  -> IOError saving PDF {pdf_save_path}: {e}")
                        paper_dict_to_save["status"] = "save_failed"
                        error_msg = f"PDF save error: {e}"
                        paper_dict_to_save["error_details"] = (
                            error_msg
                            if not paper_dict_to_save["error_details"]
                            else f"{paper_dict_to_save['error_details']}; {error_msg}"
                        )
                        error_count += 1

                # Write the metadata to the JSONL file
                json.dump(paper_dict_to_save, f_out)
                f_out.write("\n")
                print(f"Sample Processed Paper {papers_processed_sample}: {paper!r}")

                if papers_processed_sample >= max_papers_to_process:
                    logging.info(
                        f"Reached processing target of {max_papers_to_process} paper(s)."
                    )
                    break

        print("-" * 80)
        logging.info("Direct PDF Sample run summary:")
        logging.info(
            f"Total papers processed in sample iteration: {papers_processed_sample}"
        )
        logging.info(
            f"Papers with successfully extracted and saved PDF content: {extracted_papers_with_pdf}"
        )
        logging.info(f"Papers with errors (extraction or saving): {error_count}")
        logging.info(
            f"Total PDF bytes extracted (from successful extractions): {total_pdf_bytes_extracted} bytes"
        )
        logging.info(
            f"Direct PDF metadata (JSONL) saved to: {output_jsonl_file.resolve()}"
        )
        if pdfs_output_dir.exists() and extracted_papers_with_pdf > 0:
            logging.info(f"Extracted PDF files saved in: {pdfs_output_dir.resolve()}")

        if papers_processed_sample == 0:
            logging.warning(
                f"No .tar files found or no processable PDF files yielded any Paper objects in {folder_path.resolve()}"
            )

    except FileNotFoundError as e:
        logging.error(f"Sample run failed (FileNotFoundError): {e}")
    except NotADirectoryError as e:
        logging.error(f"Sample run failed (NotADirectoryError): {e}")
    except Exception as e:
        logging.error(
            f"An unexpected error occurred during the direct PDF sample run: {e}",
            exc_info=True,
        )


if __name__ == "__main__":
    main_test_extraction()
