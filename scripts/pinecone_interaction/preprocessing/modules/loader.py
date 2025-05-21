import json
from typing import Any, Dict, Generator


def load_json_data(file_path: str) -> Dict[str, Any]:
    """Loads a single JSON object from the specified file path.

    Args:
        file_path: The path to the JSON file.

    Returns:
        A dictionary representing the loaded JSON data.
    """
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        return data
    except FileNotFoundError:
        print(f"Error: File not found at {file_path}")
        raise
    except json.JSONDecodeError:
        print(f"Error: Could not decode JSON from file {file_path}")
        raise


def load_jsonl_data(file_path: str) -> Generator[Dict[str, Any], None, None]:
    """Loads JSON objects line by line from a JSON Lines (.jsonl) file.

    Args:
        file_path: The path to the JSON Lines file.

    Yields:
        A dictionary representing the loaded JSON object for each line.
    """
    line_num = 0
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            for line in f:
                line_num += 1
                if line.strip():
                    try:
                        yield json.loads(line)
                    except json.JSONDecodeError:
                        print(
                            f"Warning: Skipping invalid JSON on line {line_num}: {line.strip()}"
                        )
    except FileNotFoundError:
        print(f"Error: File not found at {file_path}")
        raise
    except Exception as e:
        print(f"Error reading file {file_path}: {e}")
        raise
