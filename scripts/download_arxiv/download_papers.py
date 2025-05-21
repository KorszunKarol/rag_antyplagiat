"""Script to download papers from arXiv using the official API."""

import arxiv
import time
import logging
import os
from typing import List
from dataclasses import dataclass


@dataclass
class DownloadConfig:
    """Configuration settings for the arXiv download script."""

    search_query: str = ""
    categories: List[str] = ("cs.AI", "cs.CL", "cs.LG")
    max_results: int = 1000
    download_dir: str = "./data/arxiv_downloads"
    download_format: str = "pdf"
    api_pause_seconds: float = 3.1


CONFIG = DownloadConfig(
    search_query="",
    categories=["cs.AI", "cs.CL", "cs.LG"],
    max_results=3,
    download_dir="./data/arxiv_downloads",
    download_format="pdf",
    api_pause_seconds=3.1,
)

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def download_papers(config: DownloadConfig):
    """Handles the searching and downloading of papers using a config object."""
    os.makedirs(config.download_dir, exist_ok=True)
    logging.info(f"Download directory: {config.download_dir}")
    logging.info(f"Download format: {config.download_format}")

    query_parts = []
    if config.categories:
        cat_query = " OR ".join([f"cat:{cat}" for cat in config.categories])
        query_parts.append(f"({cat_query})")
    if config.search_query:
        query_parts.append(f"({config.search_query})")

    search_query = " AND ".join(query_parts)
    if not search_query:
        logging.error(
            "No search criteria defined in config (categories or search_query). Exiting."
        )
        return

    logging.info(f"Constructed arXiv query: {search_query}")

    client = arxiv.Client(
        page_size=100, delay_seconds=config.api_pause_seconds, num_retries=3
    )

    search = arxiv.Search(
        query=search_query,
        max_results=config.max_results,
        sort_by=arxiv.SortCriterion.SubmittedDate,
        sort_order=arxiv.SortOrder.Descending,
    )

    logging.info(f"Starting search for max {config.max_results} results...")
    results_generator = client.results(search)

    download_count = 0
    errors = 0

    for result in results_generator:
        if download_count >= config.max_results:
            logging.info(f"Reached max results limit ({config.max_results}). Stopping.")
            break

        paper_id_safe = result.entry_id.split("/")[-1].replace(".", "_")
        filename_base = (
            f"{paper_id_safe}_{result.title.replace(' ', '_').replace('/', '_')[:50]}"
        )

        try:
            if config.download_format == "pdf":
                pdf_filename = f"{filename_base}.pdf"
                logging.info(
                    f"Attempting to download PDF for {result.entry_id} ({result.title[:60]}...)"
                )
                result.download_pdf(dirpath=config.download_dir, filename=pdf_filename)
                logging.info(f"Successfully downloaded PDF: {pdf_filename}")
            elif config.download_format == "source":
                source_filename = f"{filename_base}.tar.gz"
                logging.info(
                    f"Attempting to download source for {result.entry_id} ({result.title[:60]}...)"
                )
                result.download_source(
                    dirpath=config.download_dir, filename=source_filename
                )
                logging.info(f"Successfully downloaded source: {source_filename}")

            download_count += 1

        except FileNotFoundError:
            logging.warning(f"Source file not found for {result.entry_id}. Skipping.")
            errors += 1
        except ConnectionResetError as e:
            logging.error(
                f"Connection reset error downloading {result.entry_id}: {e}. Consider reducing page_size or increasing delay."
            )
            errors += 1
            time.sleep(config.api_pause_seconds * 2)
        except Exception as e:
            logging.error(f"Failed to download {result.entry_id}: {e}")
            errors += 1

        logging.debug(
            f"Waiting {config.api_pause_seconds} seconds before next download/check..."
        )
        time.sleep(config.api_pause_seconds)

    logging.info(f"Download process finished.")
    logging.info(f"Total papers downloaded: {download_count}")
    logging.info(f"Total errors encountered: {errors}")


if __name__ == "__main__":
    download_papers(CONFIG)
