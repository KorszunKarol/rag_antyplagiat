import logging
from typing import List

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


CHUNK_SIZE = 512
CHUNK_OVERLAP = 50


def chunk_text_fixed_size(text: str, chunk_size: int, chunk_overlap: int) -> List[str]:
    """Chunks the text into fixed-size overlapping segments.

    Args:
        text (str): The input text to be chunked.
        chunk_size (int): The desired size of each chunk in characters.
        chunk_overlap (int): The number of overlapping characters between consecutive chunks.

    Returns:
        List[str]: A list of text chunks.

    Raises:
        AssertionError: If chunk_size is not positive, or if overlap is negative
                        or greater than or equal to chunk_size.
    """
    if not text:
        return []

    assert chunk_size > 0, "Chunk size must be positive."
    assert chunk_overlap >= 0, "Overlap cannot be negative."
    assert chunk_overlap < chunk_size, "Overlap must be less than chunk size."

    chunks = []
    start_index = 0
    text_len = len(text)
    step = chunk_size - chunk_overlap

    while start_index < text_len:
        end_index = start_index + chunk_size

        chunk = text[start_index:end_index]
        chunks.append(chunk)

        start_index += step

        if start_index >= text_len and len(chunks[-1]) < chunk_overlap:

            pass

    return chunks


def create_text_chunks(text: str) -> List[str]:
    """Creates text chunks using the default fixed-size strategy."""
    return chunk_text_fixed_size(text, CHUNK_SIZE, CHUNK_OVERLAP)
