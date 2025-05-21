import logging
from typing import Optional
from pathlib import Path
from pylatexenc.latex2text import LatexNodes2Text
from dotenv import load_dotenv
from .types import Paper


import os

logger = logging.getLogger(__name__)
load_dotenv()


def add_plain_text_to_paper(paper: Paper) -> None:
    """Converts raw LaTeX text in a Paper object to plain text.

    Modifies the Paper object in-place by setting either:
    - plain_text (successful conversion)
    - conversion_error (failed conversion)

    Args:
        paper: The Paper object containing raw LaTeX text to convert.

    Returns:
        None: Modifies the Paper object in-place.
    """
    assert isinstance(paper, Paper), "Input must be a Paper object"

    if paper.has_errors():
        logger.debug(
            f"[CONVERTER][{paper.paper_id}] Skipping conversion: Pre-existing errors found."
        )
        return

    if not paper.raw_latex_text or not paper.raw_latex_text.strip():
        paper.conversion_error = "No raw LaTeX text available for conversion"
        logger.warning(
            f"[CONVERTER][{paper.paper_id}] Skipping conversion: No raw LaTeX text available."
        )
        return

    logger.info(f"[CONVERTER][{paper.paper_id}] Attempting LaTeX conversion.")
    raw_text_len = len(paper.raw_latex_text)

    raw_head = paper.raw_latex_text[:200].replace("\\n", "\\\\n")
    raw_tail = paper.raw_latex_text[-200:].replace("\\n", "\\\\n")
    logger.debug(f"[CONVERTER][{paper.paper_id}] Input Length: {raw_text_len}")
    logger.debug(f"[CONVERTER][{paper.paper_id}] Input Head: '{raw_head}...'")
    logger.debug(f"[CONVERTER][{paper.paper_id}] Input Tail: '...{raw_tail}'")

    try:

        converter = LatexNodes2Text(
            keep_comments=False,
            keep_braced_groups=False,
            strict_latex_spaces=False,
            math_mode="verbatim",
        )

        raw_converted_text = converter.latex_to_text(paper.raw_latex_text)
        assert isinstance(
            raw_converted_text, str
        ), f"pylatexenc should return str, got {type(raw_converted_text)}"

        raw_converted_len = len(raw_converted_text)
        raw_converted_head = raw_converted_text[:300].replace("\\n", "\\\\n")
        raw_converted_tail = raw_converted_text[-300:].replace("\\n", "\\\\n")
        logger.debug(
            f"[CONVERTER][{paper.paper_id}] Raw Conversion Output Length: {raw_converted_len}"
        )
        logger.debug(
            f"[CONVERTER][{paper.paper_id}] Raw Conversion Output Head: '{raw_converted_head}...'"
        )
        logger.debug(
            f"[CONVERTER][{paper.paper_id}] Raw Conversion Output Tail: '...{raw_converted_tail}'"
        )

        final_plain_text = raw_converted_text.strip()

        if not final_plain_text:
            paper.conversion_error = "Conversion resulted in empty text"
            paper.plain_text = None
            logger.warning(
                f"[CONVERTER][{paper.paper_id}] Conversion resulted in empty text after stripping."
            )
        else:
            paper.plain_text = final_plain_text
            paper.conversion_error = None
            final_len = len(paper.plain_text)
            logger.info(
                f"[CONVERTER][{paper.paper_id}] Successfully converted. Final plain text length: {final_len}"
            )

    except Exception as e:

        error_msg = f"Conversion failed: {type(e).__name__}: {str(e)}"
        paper.conversion_error = error_msg
        paper.plain_text = None

        logger.error(f"[CONVERTER][{paper.paper_id}] {error_msg}", exc_info=True)


if __name__ == "__main__":
    """Manual test block for the converter module.

    This tests the integration between the extractor and converter by processing
    sample .tar files and logging the results.
    """

    logging.basicConfig(
        level=logging.DEBUG,
        format="%(asctime)s - %(levelname)s - %(name)s - %(message)s",
        filename="./converter_test_output/manual_test.log",
        filemode="w",
    )

    logger.info("Running converter+extractor module in standalone test mode...")

    from .extractor import iter_extracted_content

    ARXIV_DATA_PATH = os.getenv("ARXIV_DATA_PATH")
    if not ARXIV_DATA_PATH:
        logger.error("ARXIV_DATA_PATH environment variable not set. Exiting test.")
        exit(1)
    input_dir = Path(ARXIV_DATA_PATH)
    if not input_dir.is_dir():
        logger.error(
            f"ARXIV_DATA_PATH '{input_dir}' is not a valid directory. Exiting test."
        )
        exit(1)

    output_dir = Path("./converter_test_output")
    output_dir.mkdir(exist_ok=True)
    logger.info(f"Saving plain text test outputs to: {output_dir.resolve()}")

    yielded_count = 0
    processed_ok_count = 0
    extraction_error_count = 0
    conversion_error_count = 0
    empty_conversion_count = 0
    save_error_count = 0

    logger.info(f"Starting processing from directory: {input_dir}")

    for paper in iter_extracted_content(input_dir):
        yielded_count += 1
        logger.info(
            f"--- Processing yielded paper {yielded_count}: {paper.paper_id} ---"
        )

        if paper.extraction_error:
            extraction_error_count += 1
            logger.warning(
                f"[TESTER][{paper.paper_id}] Skipping: Extraction error reported by extractor: {paper.extraction_error}"
            )
            continue
        if not paper.raw_latex_text:

            extraction_error_count += 1
            logger.warning(
                f"[TESTER][{paper.paper_id}] Skipping: Extractor yielded paper with no raw_latex_text and no error."
            )
            continue

        add_plain_text_to_paper(paper)

        if paper.conversion_error == "Conversion resulted in empty text":
            empty_conversion_count += 1
            logger.warning(
                f"[TESTER][{paper.paper_id}] Skipping save: Conversion resulted in empty text."
            )
            continue
        elif paper.conversion_error:
            conversion_error_count += 1
            logger.warning(
                f"[TESTER][{paper.paper_id}] Skipping save: Conversion error reported: {paper.conversion_error}"
            )
            continue
        elif not paper.plain_text:

            logger.error(
                f"[TESTER][{paper.paper_id}] Logic Error: No conversion error, but plain_text is missing. Skipping save."
            )
            conversion_error_count += 1
            continue

        output_file = output_dir / f"{paper.paper_id}_plain.txt"
        try:
            with open(output_file, "w", encoding="utf-8") as f:
                f.write(paper.plain_text)
            logger.info(
                f"[TESTER][{paper.paper_id}] Saved plain text to: {output_file.name}"
            )
            processed_ok_count += 1
        except IOError as e:
            logger.error(
                f"[TESTER][{paper.paper_id}] Failed to save plain text file: {e}"
            )
            save_error_count += 1

    logger.info(f"--- Standalone Test Summary ---")
    logger.info(f"Input Directory: {input_dir}")
    logger.info(f"Output Directory: {output_dir}")
    logger.info(f"Total Papers Yielded by Extractor: {yielded_count}")
    logger.info(f"  Extraction Errors (skipped): {extraction_error_count}")
    logger.info(f"  Conversion Errors (skipped): {conversion_error_count}")
    logger.info(f"  Empty Conversions (skipped): {empty_conversion_count}")
    logger.info(f"  File Save Errors: {save_error_count}")
    logger.info(f"Successfully Processed & Saved: {processed_ok_count}")
    logger.info(f"-----------------------------------")
