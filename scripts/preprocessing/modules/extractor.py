import tarfile
import os
import logging
import gzip
import io
from pathlib import Path
from typing import Iterator, Dict, Optional, List, Set
from dataclasses import dataclass, field
from dotenv import load_dotenv
import json # Added for jsonl output

# Configure logging to file
logging.basicConfig(
    level=logging.INFO, # Set back to INFO for production/standard runs
    format='%(asctime)s - %(levelname)s - %(message)s',
    filename='extractor_debug.log', # Log file name
    filemode='w' # Overwrite log file each time
)

# Also add a handler to print INFO+ messages to console for progress indication
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
console_formatter = logging.Formatter('%(levelname)s - %(message)s') # Simpler format for console
console_handler.setFormatter(console_formatter)
logging.getLogger().addHandler(console_handler)

load_dotenv()

TEXT_SEPARATOR = "\n\n"
DEFAULT_SUPPORTED_EXTENSIONS = ['.tex']

@dataclass
class ExtractionConfig:
    """Configuration for the text extraction process.

    Attributes:
        supported_extensions: List of file extensions to attempt extraction from.
                              Defaults to ['.tex'].
    """
    supported_extensions: List[str] = field(default_factory=lambda: DEFAULT_SUPPORTED_EXTENSIONS)


def _extract_text_from_member(archive: tarfile.TarFile, member: tarfile.TarInfo, config: ExtractionConfig) -> Optional[str]:
    """Extracts text content from a supported file member within a tar archive.

    Handles nested .gz files which may contain either another tar archive
    (with .tex files inside) or a single compressed .tex file. Attempts to
    decode the content as UTF-8, ignoring errors.

    Args:
        archive: The open tarfile object (outer archive).
        member: The TarInfo object representing the file within the outer archive.
        config: The ExtractionConfig object specifying supported extensions.

    Returns:
        The extracted text content as a string, or None if the file type
        is not supported, extraction fails, or the member is not a file/relevant .gz.
    """
    assert isinstance(archive, tarfile.TarFile), "Archive must be a tarfile.TarFile object"
    assert isinstance(member, tarfile.TarInfo), "Member must be a tarfile.TarInfo object"
    assert isinstance(config, ExtractionConfig), "Config must be an ExtractionConfig object"
    assert len(config.supported_extensions) > 0, "Supported extensions list must not be empty"

    if not member.isfile():
        return None

    logging.debug(f"Checking member: {member.name}")
    file_path = Path(member.name)
    file_ext = file_path.suffix.lower()

    # Scenario 1: Member is a gzipped file (likely containing the source)
    if file_ext == '.gz':
        logging.debug(f"Member {member.name} is a .gz file. Attempting nested extraction.")
        extracted_gz_content: Optional[str] = None # Initialize extracted content for this .gz file

        try:
            # Extract the .gz file content into memory
            gz_file_obj = archive.extractfile(member)
            if not gz_file_obj:
                logging.warning(f"Could not extract .gz member stream: {member.name}")
                return None

            compressed_content = gz_file_obj.read()
            gz_file_obj.close()
            assert isinstance(compressed_content, bytes), ".gz content should be bytes"

            # Decompress the content using gzip library
            decompressed_content: bytes
            try:
                decompressed_content = gzip.decompress(compressed_content)
                assert isinstance(decompressed_content, bytes), "Decompressed content should be bytes"
            except gzip.BadGzipFile:
                 logging.warning(f"Member {member.name} is not a valid gzip file, skipping.")
                 return None
            except EOFError:
                 logging.warning(f"EOFError while decompressing {member.name}, possibly truncated/corrupt.")
                 return None

            # Now, try to open the decompressed content as an inner tar archive
            inner_tex_parts: List[str] = []
            try:
                with tarfile.open(fileobj=io.BytesIO(decompressed_content), mode='r:') as inner_archive:
                    logging.debug(f"Successfully opened decompressed {member.name} as inner tar.")
                    inner_members = inner_archive.getmembers()
                    if not inner_members:
                        logging.warning(f"  -> Inner tar {member.name} appears to be empty.")
                    else:
                        for inner_member in inner_members:
                             logging.debug(f"  -> Checking inner file: {inner_member.name}")
                             if inner_member.isfile():
                                inner_file_path = Path(inner_member.name)
                                inner_file_ext = inner_file_path.suffix.lower()
                                if inner_file_ext in config.supported_extensions:
                                    logging.info(f"  -> Found supported inner file: {inner_member.name} in {member.name}")
                                    try:
                                        inner_file_obj = inner_archive.extractfile(inner_member)
                                        if inner_file_obj:
                                            inner_content_bytes = inner_file_obj.read()
                                            inner_file_obj.close()
                                            # Decode using UTF-8, ignore errors
                                            inner_content_str = inner_content_bytes.decode('utf-8', errors='ignore')
                                            assert isinstance(inner_content_str, str), "Decoded inner content should be string"
                                            inner_tex_parts.append(inner_content_str)
                                            logging.debug(f"    -> Extracted and decoded {len(inner_content_bytes)} bytes from {inner_member.name}")
                                        else:
                                            logging.warning(f"    -> Could not extract stream for inner file: {inner_member.name}")
                                    except KeyError:
                                        logging.warning(f"    -> KeyError extracting inner file (might be symlink/unsupported): {inner_member.name}")
                                    except Exception as ie:
                                         logging.error(f"    -> Error extracting/decoding inner file {inner_member.name}: {ie}", exc_info=False) # Keep log concise
                        # Join text from all .tex files found in the inner archive
                        if inner_tex_parts:
                            extracted_gz_content = TEXT_SEPARATOR.join(inner_tex_parts)
                            assert isinstance(extracted_gz_content, str), "Joined inner text should be a string"
                            logging.info(f"  -> Successfully extracted text from {len(inner_tex_parts)} supported file(s) inside inner tar: {member.name}")

            except tarfile.ReadError:
                # If it's not a tar file, assume the decompressed content *is* the target file
                logging.info(f"Decompressed {member.name} is NOT a tar archive. Assuming it's the source file.")
                try:
                    # Decode the whole decompressed content
                    extracted_gz_content = decompressed_content.decode('utf-8', errors='ignore')
                    assert isinstance(extracted_gz_content, str), "Decoded direct content should be a string"
                    logging.info(f"  -> Successfully decoded directly decompressed content of {member.name}")
                except Exception as decode_err:
                    logging.error(f"  -> Error decoding directly decompressed content of {member.name}: {decode_err}", exc_info=False)

        except Exception as e:
            logging.error(f"Error during nested analysis/extraction of {member.name}: {e}", exc_info=True)

        # Return the extracted text from the .gz (either from inner tar or direct decode), or None if failed
        if extracted_gz_content and len(extracted_gz_content.strip()) > 0:
             return extracted_gz_content
        else:
            if extracted_gz_content is None: # Only log if we didn't attempt extraction
                 logging.warning(f"No text content extracted from .gz member: {member.name}")
            return None

    # Scenario 2: Member is a directly supported file type (e.g., .tex) - Less likely at outer level based on logs, but keep for robustness
    elif file_ext in config.supported_extensions:
        logging.info(f"Found direct file matching extension in outer tar: {member.name}")
        try:
            extracted_file = archive.extractfile(member)
            if extracted_file:
                content_bytes = extracted_file.read()
                extracted_file.close()
                # Decode using UTF-8, ignore errors
                content_str = content_bytes.decode('utf-8', errors='ignore')
                assert isinstance(content_str, str), "Decoded direct content should be string"
                if len(content_str.strip()) > 0:
                     logging.info(f"  -> Successfully extracted and decoded direct file: {member.name}")
                     return content_str
                else:
                    logging.warning(f"  -> Extracted direct file {member.name} was empty after decoding.")
                    return None
            else:
                logging.warning(f"Could not extract stream for direct file: {member.name}")
                return None
        except KeyError:
             logging.warning(f"KeyError extracting direct file (might be symlink/unsupported): {member.name}")
             return None
        except Exception as e:
            logging.error(f"Error extracting/decoding direct file {member.name}: {e}", exc_info=False)
            return None

    # Scenario 3: File extension is not supported
    else:
        # Logging this can be very verbose, keep it DEBUG or remove if not needed
        logging.debug(f"Skipping member {member.name} with unsupported extension {file_ext}")
        return None


def iter_extracted_content(input_dir: Path, config: Optional[ExtractionConfig] = None) -> Iterator[Dict[str, str]]:
    """Iterates through .tar.gz archives in a directory, extracts text content.

    This function scans the specified directory for files ending with '.tar.gz'.
    For each archive found, it attempts to extract text content from supported
    files contained within (using the provided or default ExtractionConfig).
    It yields a dictionary for each successfully processed paper containing its ID
    (derived from the archive filename) and the concatenated text content from all
    supported files found within that archive.

    It assumes archive filenames correspond to paper IDs (e.g., '2301.00001.tar.gz'
    becomes ID '2301.00001').

    Args:
        input_dir: The pathlib.Path object representing the directory
                   containing the .tar.gz archives.
        config: An optional ExtractionConfig object. Defaults will be used if None.

    Yields:
        A dictionary with keys 'id' (str) and 'text' (str) for each
        archive where extractable text was found.

    Raises:
        FileNotFoundError: If the input directory does not exist.
        NotADirectoryError: If the input path is not a directory.
        AssertionError: If input_dir is not a Path object.
    """
    assert isinstance(input_dir, Path), "Input directory must be a Path object"
    assert input_dir.exists(), f"Input directory not found: {input_dir}"
    assert input_dir.is_dir(), f"Input path is not a directory: {input_dir}"

    effective_config = config if config is not None else ExtractionConfig()
    assert isinstance(effective_config, ExtractionConfig), "Effective config must be an ExtractionConfig object"
    assert len(effective_config.supported_extensions) > 0, "Supported extensions list must not be empty"

    logging.info(f"Starting extraction process in directory: {input_dir}")
    logging.info(f"Supported file extensions for extraction: {effective_config.supported_extensions}")

    extraction_counter = 0
    processed_archives = 0

    tar_files = list(input_dir.glob('*.tar'))
    assert len(tar_files) >= 0, "Glob operation should always return a list, even if empty"

    for tar_path in tar_files:
        assert tar_path.exists(), f"Archive file {tar_path} should exist"
        assert tar_path.is_file(), f"Archive path {tar_path} should be a file"

        processed_archives += 1
        paper_id_base = tar_path.stem
        paper_id = paper_id_base.removesuffix('.tar')
        assert paper_id, f"Derived paper ID is empty for file {tar_path.name}"

        paper_text_parts: List[str] = []
        processed_member_names: Set[str] = set()

        logging.debug(f"Processing archive: {tar_path.name} with derived ID: {paper_id}")

        try:
            with tarfile.open(tar_path, "r:") as archive:
                members = archive.getmembers()
                assert isinstance(members, list), "Archive members should be returned as a list"

                for member in members:
                    assert isinstance(member, tarfile.TarInfo), "Archive member should be a TarInfo object"

                    if member.name in processed_member_names:
                        continue

                    extracted_text = _extract_text_from_member(archive, member, effective_config)

                    if extracted_text:
                        assert isinstance(extracted_text, str), "Extracted text should be a string"
                        paper_text_parts.append(extracted_text)
                        logging.debug(f"Successfully extracted text from {member.name} in {tar_path.name}")

                    processed_member_names.add(member.name)

            if paper_text_parts:
                full_text = TEXT_SEPARATOR.join(paper_text_parts)
                assert isinstance(full_text, str), "Full joined text should be a string"
                # Ensure we don't yield effectively empty strings
                if len(full_text.strip()) == 0:
                     logging.warning(f"Extracted text for paper ID {paper_id} from {tar_path.name} is empty or whitespace only.")
                else:
                    logging.info(f"Successfully extracted {len(paper_text_parts)} text part(s) for paper ID {paper_id} from {tar_path.name}")
                    extraction_counter += 1

                    result = {"id": paper_id, "text": full_text}
                    assert "id" in result and "text" in result, "Result dictionary should contain 'id' and 'text' keys"
                    assert result["id"] == paper_id, "Result ID should match the derived paper ID"
                    assert result["text"] == full_text, "Result text should match the full joined text"

                    # Re-enable yielding the result
                    yield result
            else:
                # This logging is still relevant
                logging.warning(f"No extractable text found matching extensions {effective_config.supported_extensions} in archive: {tar_path.name} (ID: {paper_id})")

        except tarfile.ReadError as e:
            logging.error(f"Could not read archive {tar_path.name} (ID: {paper_id}): {e}")
        except FileNotFoundError:
             logging.error(f"Archive file not found during processing: {tar_path.name} (ID: {paper_id})")
        except Exception as e:
            logging.error(f"An unexpected error occurred processing {tar_path.name} (ID: {paper_id}): {e}", exc_info=True)

    logging.info(f"Finished extraction process in directory: {input_dir}. Processed {processed_archives} archives, yielded content from {extraction_counter} archives.")
    assert processed_archives >= 0, "Number of processed archives should be non-negative"
    assert extraction_counter >= 0, "Number of extracted papers should be non-negative"
    assert extraction_counter <= processed_archives, "Cannot extract from more archives than processed"

# Example usage guard
if __name__ == "__main__":
    # Determine the data directory path:
    # 1. Try to get it from the ARXIV_DATA_PATH environment variable.
    # 2. If not set, fall back to a default relative path (e.g., ../data/sample_arxiv_tars).
    folder_path_str = os.getenv('ARXIV_DATA_PATH')
    if not folder_path_str:
        logging.error("ARXIV_DATA_PATH environment variable not set. Please set it to the path of the data folder.")
        exit(1)

    folder_path = Path(folder_path_str)

    if folder_path.is_dir():
        extracted_count = 0
        total_length = 0
        max_papers_to_process = 1 # <<< Limit processing to only the first paper found
        sample_output_file = Path('extracted_single_paper_sample.txt') # <<< Save as .txt

        logging.info(f"Starting single paper sample extraction run (max {max_papers_to_process} paper) from: {folder_path}")
        logging.info(f"Saving full sample output to: {sample_output_file.resolve()}")

        try:
            # Open the sample output file in write mode
            with open(sample_output_file, 'w', encoding='utf-8') as f_out:
                for paper_data in iter_extracted_content(folder_path):
                    assert isinstance(paper_data, dict), "Paper data should be a dictionary"
                    assert "id" in paper_data and "text" in paper_data, "Paper data should contain 'id' and 'text' keys"
                    assert isinstance(paper_data["id"], str), "Paper ID should be a string"
                    assert isinstance(paper_data["text"], str), "Paper text should be a string"

                    extracted_count += 1
                    current_length = len(paper_data["text"])
                    total_length += current_length

                    # Print ID and head of text to console
                    print("-" * 80)
                    print(f"Extracted Paper {extracted_count}: ID = {paper_data['id']}")
                    print(f"Text Length: {current_length} characters")
                    print("Text Sample (first 2000 chars):")
                    print(paper_data['text'][:2000]) # Print sample to console
                    print("-" * 80)

                    # Write the full text for this paper to the sample txt file
                    f_out.write(f"Paper ID: {paper_data['id']}\n")
                    f_out.write(f"Extracted Text Length: {current_length}\n")
                    f_out.write("-" * 80 + "\n")
                    f_out.write(paper_data['text']) # Write the full text

                    # Stop after processing the desired number of papers for the sample
                    if extracted_count >= max_papers_to_process:
                        logging.info(f"Reached sample limit of {max_papers_to_process} paper(s).")
                        break

            logging.info(f"\nSample run summary:")
            logging.info(f"Papers processed for sample: {extracted_count}")
            logging.info(f"Total text length extracted in sample: {total_length} characters")
            logging.info(f"Full sample data saved to: {sample_output_file.resolve()}")

            if extracted_count == 0:
                logging.warning(f"No .tar files found or no text extracted in {folder_path.resolve()}")

        except FileNotFoundError as e:
             logging.error(f"Sample run failed: {e}")
        except NotADirectoryError as e:
             logging.error(f"Sample run failed: {e}")
        except Exception as e:
             logging.error(f"An unexpected error occurred during the sample run: {e}", exc_info=True)

    else:
         logging.warning(f"Example data directory not found: {folder_path.resolve()}")
         logging.warning("Please ensure ARXIV_DATA_PATH is set correctly and the directory exists.")
