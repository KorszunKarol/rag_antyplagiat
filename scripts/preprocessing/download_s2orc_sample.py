import json
import os
import re
import requests
import subprocess
import math
from tqdm import tqdm

# --- User Configuration ---
# NOTE: These should be set by the user before running the script.
API_KEY = "YOUR_SEMANTIC_SCHOLAR_API_KEY"
TARGET_SIZE_GB = 5
LOCAL_PATH = "/path/to/download/s2orc_sample"
# --- End User Configuration ---

TARGET_SIZE_BYTES = TARGET_SIZE_GB * (1024**3)  # Convert GB to Bytes


def get_remote_file_size(url: str) -> int | None:
    """Gets the size of a remote file using an HTTP HEAD request.

    Args:
        url (str): The URL of the remote file.

    Returns:
        int | None: The size of the file in bytes if successful, None otherwise.
    """
    try:
        response = requests.head(url, timeout=10)
        response.raise_for_status()  # Raise HTTPError for bad responses (4xx or 5xx)
        size = int(response.headers.get("content-length", 0))
        return size if size > 0 else None
    except requests.exceptions.RequestException as e:
        print(f"Warning: Could not get size for {url}. Error: {e}")
        return None


def download_file(url: str, output_path: str) -> bool:
    """Downloads a file using the external 'wget' command-line tool.

    Supports resuming interrupted downloads. Cleans up partial files on error.

    Args:
        url (str): The URL of the file to download.
        output_path (str): The local path where the file should be saved.

    Returns:
        bool: True if the download was successful, False otherwise.
    """
    command = [
        "wget",
        "-c",
        "-O",
        output_path,
        url,
    ]  # -c for continue, -O for output file
    try:
        print(f"\nDownloading {os.path.basename(output_path)}...")
        process = subprocess.run(command, check=True, capture_output=True, text=True)
        print(f"Finished downloading {os.path.basename(output_path)}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error downloading {url}: {e}")
        print(f"Stderr: {e.stderr}")
        # Clean up partially downloaded file on error if it exists
        if os.path.exists(output_path):
            try:
                os.remove(output_path)
                print(f"Removed incomplete file: {output_path}")
            except OSError as remove_error:
                print(
                    f"Warning: Could not remove incomplete file {output_path}. Error: {remove_error}"
                )
        return False
    except FileNotFoundError:
        print(
            "Error: 'wget' command not found. Please ensure wget is installed and in your PATH."
        )
        return False


def main():
    """Main execution function.

    Handles configuration checks, API calls to get download links,
    and iteratively downloads shards using wget until the target
    download size is reached or all shards are processed.
    """
    if API_KEY == "YOUR_SEMANTIC_SCHOLAR_API_KEY":
        print(
            "Error: Please replace 'YOUR_SEMANTIC_SCHOLAR_API_KEY' with your actual API key."
        )
        return
    if LOCAL_PATH == "/path/to/download/s2orc_sample":
        print(
            "Error: Please replace '/path/to/download/s2orc_sample' with your desired download directory."
        )
        return

    os.makedirs(LOCAL_PATH, exist_ok=True)
    print(f"Downloading S2ORC sample to: {LOCAL_PATH}")
    print(f"Target size: ~{TARGET_SIZE_GB} GB")

    # --- Get latest release ID ---
    try:
        print("Getting latest release information...")
        response = requests.get(
            "https://api.semanticscholar.org/datasets/v1/release/latest", timeout=20
        )
        response.raise_for_status()
        release_info = response.json()
        release_id = release_info.get("release_id")
        if not release_id:
            print("Error: Could not get release_id from API response.")
            return
        print(f"Latest release ID: {release_id}")
    except requests.exceptions.RequestException as e:
        print(f"Error getting release ID: {e}")
        return

    # --- Get dataset download links ---
    try:
        print("Getting download links for S2ORC dataset...")
        dataset_name = "s2orc"
        headers = {"x-api-key": API_KEY}
        response = requests.get(
            f"https://api.semanticscholar.org/datasets/v1/release/{release_id}/dataset/{dataset_name}",
            headers=headers,
            timeout=30,
        )
        response.raise_for_status()
        download_info = response.json()
        file_urls = download_info.get("files")
        if not file_urls:
            print("Error: Could not get file URLs from API response.")
            return
        print(f"Found {len(file_urls)} shards.")

    except requests.exceptions.RequestException as e:
        print(f"Error getting download links: {e}")
        return

    # --- Download shards sequentially until target size is met ---
    total_downloaded_bytes = 0
    files_downloaded_count = 0

    print("Starting download process...")
    for url in file_urls:
        # Extract a meaningful filename
        match = re.search(r"s2orc/(.*\.gz)", url)
        if not match:
            print(f"Warning: Could not extract filename from URL: {url}. Skipping.")
            continue
        shard_filename = match.group(1)
        local_filepath = os.path.join(LOCAL_PATH, shard_filename)

        # Check if file already exists (e.g., from previous run)
        if os.path.exists(local_filepath):
            existing_size = os.path.getsize(local_filepath)
            print(
                f"Shard {shard_filename} already exists locally (Size: {existing_size / (1024**3):.2f} GB). Skipping download, adding size."
            )
            total_downloaded_bytes += existing_size
        else:
            # Attempt to download the file
            if download_file(url, local_filepath):
                # If download successful, add its size
                downloaded_size = os.path.getsize(local_filepath)
                total_downloaded_bytes += downloaded_size
                files_downloaded_count += 1
            else:
                # Optional: Decide whether to stop on failure or continue
                print(f"Failed to download {shard_filename}. Stopping.")
                break  # Stop if a download fails

        print(
            f"Total downloaded so far: {total_downloaded_bytes / (1024**3):.2f} / {TARGET_SIZE_GB:.2f} GB"
        )

        # Check if we've reached the target size
        if total_downloaded_bytes >= TARGET_SIZE_BYTES:
            print(f"\nTarget download size of ~{TARGET_SIZE_GB} GB reached.")
            break

    print(f"\nDownload process finished.")
    print(f"Downloaded {files_downloaded_count} new shards.")
    print(
        f"Total size on disk (including previously downloaded): {total_downloaded_bytes / (1024**3):.2f} GB"
    )
    print(f"Data saved in: {LOCAL_PATH}")


if __name__ == "__main__":
    main()
