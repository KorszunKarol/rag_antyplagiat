import logging
from typing import List

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

# Default configuration for chunking
CHUNK_SIZE = 512  # The target size of each text chunk in characters
CHUNK_OVERLAP = 50  # The number of characters to overlap between consecutive chunks


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

    # Validate inputs
    assert chunk_size > 0, "Chunk size must be positive."
    assert chunk_overlap >= 0, "Overlap cannot be negative."
    assert chunk_overlap < chunk_size, "Overlap must be less than chunk size."

    chunks = []
    start_index = 0
    text_len = len(text)
    step = chunk_size - chunk_overlap

    while start_index < text_len:
        end_index = start_index + chunk_size
        # Take the slice
        chunk = text[start_index:end_index]
        chunks.append(chunk)

        # Move to the next starting point
        start_index += step

        # Optimization: If the next start is past the text, break early
        if start_index >= text_len and len(chunks[-1]) < chunk_overlap:
            # Avoid adding a tiny final chunk that's smaller than the overlap
            # if the last full chunk already covers the end.
            # This specific check might need refinement based on desired edge case handling.
            # For now, the simple loop condition handles the basic case.
            pass  # Placeholder for potential more complex logic if needed

    return chunks


def create_text_chunks(text: str) -> List[str]:
    """Creates text chunks using the default fixed-size strategy."""
    return chunk_text_fixed_size(text, CHUNK_SIZE, CHUNK_OVERLAP)


# Note: The original code had a potentially confusing break condition.
# The `while start_index < text_len:` condition is sufficient
# for controlling the loop. The logic inside correctly calculates the next
# start_index. Let's stick to the simplified standard sliding window loop.
# The provided code block above implements the standard logic.
# Removing the potentially redundant break condition from the original code.
