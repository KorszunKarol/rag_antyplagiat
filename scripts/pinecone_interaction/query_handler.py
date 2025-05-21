import os

import json
from dotenv import load_dotenv
from pinecone import Pinecone

from pinecone_plugins.assistant.models.chat import Message


def load_configuration():
    """Loads environment variables from a .env file.

    Ensures that necessary Pinecone credentials (API key, environment, assistant ID)
    are available.

    Returns:
        dict: A dictionary containing the loaded configuration values.
              Returns an empty dict if essential variables are missing.
    """

    script_dir = os.path.dirname(os.path.abspath(__file__))
    scripts_dir = os.path.dirname(script_dir)
    dotenv_path = os.path.join(scripts_dir, ".env")

    print(f"Attempting to load .env file from: {dotenv_path}")
    load_dotenv_result = load_dotenv(dotenv_path=dotenv_path)
    print(f"load_dotenv() result for {dotenv_path}: {load_dotenv_result}")

    print(f"PINECONE_API_KEY: {os.getenv('PINECONE_API_KEY')}")
    print(f"PINECONE_ENVIRONMENT: {os.getenv('PINECONE_ENVIRONMENT')}")
    print(f"PINECONE_ASSISTANT_ID: {os.getenv('PINECONE_ASSISTANT_ID')}")

    config = {
        "pinecone_api_key": os.getenv("PINECONE_API_KEY"),
        "pinecone_environment": os.getenv("PINECONE_ENVIRONMENT"),
        "pinecone_assistant_id": os.getenv("PINECONE_ASSISTANT_ID"),
    }
    if not all(
        [
            config["pinecone_api_key"],
            config["pinecone_environment"],
            config["pinecone_assistant_id"],
        ]
    ):
        print(
            "Error: Missing one or more Pinecone environment variables (PINECONE_API_KEY, PINECONE_ENVIRONMENT, PINECONE_ASSISTANT_ID)."
        )
        print("Please ensure they are set in your .env file or environment.")
        return {}
    return config


def initialize_pinecone_client(api_key: str, environment: str):
    """Initializes and returns a Pinecone client.

    Args:
        api_key (str): The Pinecone API key.
        environment (str): The Pinecone environment.

    Returns:
        Pinecone: An initialized Pinecone client instance, or None if initialization fails.
    """
    try:
        pc = Pinecone(api_key=api_key, environment=environment)
        print("Pinecone client initialized successfully.")
        return pc
    except Exception as e:
        print(f"Error initializing Pinecone client: {e}")
        return None


def get_pinecone_assistant(
    pc: Pinecone, assistant_identifier: str, by_name: bool = False
):
    """Retrieves a Pinecone Assistant instance by ID or name.

    Args:
        pc (Pinecone): The initialized Pinecone client.
        assistant_identifier (str): The ID or name of the Pinecone Assistant.
        by_name (bool): If True, treats assistant_identifier as a name, otherwise as an ID.
                        The user's snippet implies getting by name, but ID is more robust.
                        We will try by ID if available, otherwise by name as a fallback or if specified.

    Returns:
        An Assistant object that has a .chat() method, or None if not found/error.
    """
    if not pc or not hasattr(pc, "assistant"):
        print(
            "Error: Pinecone client not initialized properly or does not have 'assistant' capabilities (plugin might be missing or not registered)."
        )
        return None
    try:

        if by_name:
            print(f"Attempting to get assistant by NAME: {assistant_identifier}")
            assistant = pc.assistant.Assistant(assistant_name=assistant_identifier)
        else:

            print(
                f"Attempting to get assistant by NAME (treating ID as name for now due to snippet): {assistant_identifier}"
            )
            assistant = pc.assistant.Assistant(assistant_name=assistant_identifier)

        print(
            f"Successfully obtained an assistant reference for: {assistant_identifier}"
        )
        return assistant
    except AttributeError as ae:
        print(f"AttributeError: Problem with 'pc.assistant.Assistant'. Error: {ae}")
        print(
            "Ensure 'pinecone-plugin-assistant' is installed and `pc.assistant` is available."
        )
        return None
    except Exception as e:
        print(f"Error getting Pinecone Assistant '{assistant_identifier}': {e}")
        return None


def query_assistant_with_rag(assistant_object, query_text: str):
    """Queries the specified Pinecone Assistant.

    Args:
        assistant_object: The Pinecone Assistant object (obtained from get_pinecone_assistant).
        query_text (str): The text to query the assistant with.

    Returns:
        dict: The response from the Pinecone Assistant (expected to be a dictionary),
              or None if an error occurs.
    """
    if not assistant_object:
        print("Error: Assistant object is not provided.")
        return None

    print(f"Querying assistant with text: '{query_text[:100]}...'")
    try:

        message_to_send = Message(role="user", content=query_text)
        chat_response = assistant_object.chat(messages=[message_to_send])

        answer = "No answer found in response."
        if (
            isinstance(chat_response, dict)
            and "message" in chat_response
            and "content" in chat_response["message"]
        ):
            answer = chat_response["message"]["content"]
        elif isinstance(chat_response, dict) and "content" in chat_response:
            answer = chat_response["content"]

        api_contexts = []

        print("Successfully received response from assistant.")
        return {
            "answer": answer,
            "contexts": api_contexts,
            "raw_response_dict": chat_response,
        }

    except AttributeError as ae:
        print(f"AttributeError: Problem with 'assistant_object.chat()'. Error: {ae}")
        return None
    except Exception as e:
        print(f"Error querying Pinecone Assistant: {e}")
        return None


def extract_plagiarism_info(
    assistant_response_data: dict, similarity_threshold: float = 0.8
):
    """Extracts plagiarism-relevant information from the assistant's response.

    Args:
        assistant_response_data (dict): The dictionary response from `query_assistant_with_rag`.
        similarity_threshold (float): The minimum similarity score to consider a source as a strong match.

    Returns:
        dict: A dictionary containing the assistant's direct answer, a list of potential
              plagiarized sources (above threshold) with their scores and snippets,
              and the overall highest similarity score found.
    """
    if not assistant_response_data:
        return {
            "llm_answer": "No response from assistant.",
            "potential_sources": [],
            "max_similarity_score": 0.0,
        }

    llm_answer = assistant_response_data.get(
        "answer", "No specific answer provided by assistant."
    )

    contexts = assistant_response_data.get("contexts", [])

    potential_sources = []
    max_score = 0.0

    if not contexts:
        print(
            "Warning: No contexts found in the assistant response to analyze for plagiarism."
        )

    for context in contexts:
        score = context.get("similarity_score", 0.0)
        if score is None:
            score = 0.0

        if score > max_score:
            max_score = score
        if score >= similarity_threshold:
            potential_sources.append(
                {
                    "document_id": context.get("id"),
                    "similarity_score": score,
                    "snippet": context.get("snippet", "N/A"),
                    "title": context.get("title", "N/A"),
                }
            )

    return {
        "llm_answer": llm_answer,
        "potential_sources": sorted(
            potential_sources, key=lambda x: x["similarity_score"], reverse=True
        ),
        "max_similarity_score": max_score,
    }


def main():
    """Main function for local script execution and testing."""

    query_text_to_check = """Since experimental screening for directed evolution is largely costing, particularly
for high-order mutations, prediction of the fitness of protein variants in silico are highly
desirable. Recently, deep learning methods have been applied for predicting the fitness
landscape of the """
    plagiarism_similarity_threshold = 0.75

    print(
        f"Starting plagiarism check for query: '{query_text_to_check}' with threshold: {plagiarism_similarity_threshold}"
    )

    config = load_configuration()
    if not config:
        print("Exiting due to configuration loading failure.")
        return

    pc_client = initialize_pinecone_client(
        config["pinecone_api_key"], config["pinecone_environment"]
    )
    if not pc_client:
        print("Exiting due to Pinecone client initialization failure.")
        return

    assistant_name_or_id = config["pinecone_assistant_id"]
    print(f"Attempting to fetch assistant reference for: {assistant_name_or_id}")

    assistant_object = get_pinecone_assistant(
        pc_client, assistant_name_or_id, by_name=True
    )

    if not assistant_object:
        print(
            f"Exiting due to failure to retrieve Pinecone Assistant: {assistant_name_or_id}"
        )
        return

    print(f"Successfully got assistant object for: {assistant_name_or_id}")

    structured_response = query_assistant_with_rag(
        assistant_object, query_text_to_check
    )

    if structured_response:
        print("\n--- Inspecting Assistant Response Object ---")
        raw_response_object = structured_response.get("raw_response_dict")
        if raw_response_object:
            print(f"Type of raw_response_object: {type(raw_response_object)}")
            print(f"Attributes of raw_response_object: {dir(raw_response_object)}")

            if hasattr(raw_response_object, "message"):
                print(
                    f"Raw response message content: {getattr(raw_response_object.message, 'content', 'N/A')}"
                )
            elif hasattr(raw_response_object, "content"):
                print(f"Raw response content: {raw_response_object.content}")

            if hasattr(raw_response_object, "documents"):
                print(f"Raw response documents object: {raw_response_object.documents}")
                if raw_response_object.documents:
                    print(f"Number of documents: {len(raw_response_object.documents)}")
                    for i, doc in enumerate(raw_response_object.documents):
                        print(f"  Document {i} ID: {getattr(doc, 'id', 'N/A')}")
                        print(f"  Document {i} Score: {getattr(doc, 'score', 'N/A')}")
                        print(
                            f"  Document {i} Text: {getattr(doc, 'text', 'N/A')[:100]}..."
                        )
                        print(
                            f"  Document {i} Metadata: {getattr(doc, 'metadata', 'N/A')}"
                        )
            elif hasattr(raw_response_object, "sources"):
                print(f"Raw response sources object: {raw_response_object.sources}")

            elif hasattr(raw_response_object, "contexts"):
                print(f"Raw response contexts object: {raw_response_object.contexts}")

            if hasattr(raw_response_object, "to_dict") and callable(
                raw_response_object.to_dict
            ):
                try:
                    print("\n--- Raw Assistant Response (using to_dict()) ---")
                    print(json.dumps(raw_response_object.to_dict(), indent=2))
                except TypeError as te:
                    print(f"Could not json.dumps to_dict() output: {te}")
            elif isinstance(raw_response_object, dict):
                print("\n--- Raw Assistant Response Dictionary (already a dict) ---")
                print(json.dumps(raw_response_object, indent=2))

        print("--- End of Inspection ---")

        plagiarism_info = extract_plagiarism_info(
            structured_response, plagiarism_similarity_threshold
        )
        print("\n--- Plagiarism Analysis ---")
        print(json.dumps(plagiarism_info, indent=2))
        print("--- End of Analysis ---")

        if (
            plagiarism_info["max_similarity_score"] >= plagiarism_similarity_threshold
            and plagiarism_info["potential_sources"]
        ):
            print(
                f"\nPotential plagiarism DETECTED. Max similarity: {plagiarism_info['max_similarity_score']:.2f}"
            )
        elif plagiarism_info["max_similarity_score"] > 0:
            print(
                f"\nNo strong matches above threshold {plagiarism_similarity_threshold}. Max similarity found: {plagiarism_info['max_similarity_score']:.2f}"
            )
        else:
            print(
                "\nNo similar documents found or error in processing contexts (contexts might be empty - check raw response)."
            )
    else:
        print("Failed to get a response from the assistant.")


if __name__ == "__main__":
    main()
