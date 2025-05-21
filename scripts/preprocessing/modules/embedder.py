import os
import logging
from typing import List, Dict, Any, Optional

from dotenv import load_dotenv
from openai import OpenAI, APIError


logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)

DEFAULT_EMBEDDING_DIMENSION = 1536
EMBEDDING_MODEL = "text-embedding-3-small"


def load_openai_key() -> Optional[str]:
    """Loads the OpenAI API key from .env file."""
    load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        logging.error("OPENAI_API_KEY not found in environment variables.")
        return None
    return api_key


def generate_embeddings(texts: List[str], api_key: str) -> Optional[List[List[float]]]:
    """Generates embeddings for a list of texts using the OpenAI API."""
    if not texts:
        logging.warning("generate_embeddings called with an empty list of texts.")
        return []

    try:
        client = OpenAI(api_key=api_key)
        response = client.embeddings.create(input=texts, model=EMBEDDING_MODEL)
        embeddings = [item.embedding for item in response.data]
        logging.info(f"Successfully generated embeddings for {len(texts)} texts.")
        return embeddings
    except APIError as e:
        logging.error(f"OpenAI API error during embedding generation: {e}")
        return None
    except Exception as e:
        logging.error(f"An unexpected error occurred during embedding generation: {e}")
        return None


def generate_dummy_embeddings(
    chunks_data: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """Adds dummy zero vector embeddings to a list of chunk data dictionaries.

    Modifies the input list in-place by adding/updating the 'embedding' key.

    Args:
        chunks_data: A list of dictionaries, where each dictionary represents
                     a chunk and is expected to have keys like 'paper_id',
                     'chunk_index', 'chunk_text'. The 'embedding' key will
                     be added or overwritten.

    Returns:
        The same list of dictionaries, with the 'embedding' key populated
        with dummy zero vectors.
    """
    dummy_vector = [0.0] * DEFAULT_EMBEDDING_DIMENSION
    for chunk in chunks_data:
        chunk["embedding"] = dummy_vector
    return chunks_data
