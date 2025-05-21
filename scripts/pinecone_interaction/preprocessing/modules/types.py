import numpy as np  # Assuming numpy arrays for embeddings
from dataclasses import dataclass, field
from typing import List, Optional, Any


@dataclass
class Paper:
    """Represents a single paper and its data through the preprocessing pipeline."""

    paper_id: str  # Unique ID (e.g., '2301.00001')
    source_gz_member_name: str  # Path of the source .gz file within the outer .tar
    source_tar_filename: Optional[str] = (
        None  # Name of the source tar file (e.g., 'arXiv_pdf_2301_001.tar')
    )
    pdf_content: Optional[bytes] = None  # Raw extracted PDF binary content
    cleaned_prose_text: Optional[str] = (
        None  # Text after parsing/cleaning (potentially from PDF)
    )
    text_chunks: List[str] = field(
        default_factory=list
    )  # Text chunks (potentially from PDF)
    embeddings: List[Any] = field(
        default_factory=list
    )  # Embeddings for chunks (potentially from PDF)

    # --- Error Tracking ---
    extraction_error: Optional[str] = (
        None  # Error during extraction phase (now for PDF)
    )
    parsing_error: Optional[str] = None  # Error during parsing phase (e.g. PDF to text)
    chunking_error: Optional[str] = None  # Error during chunking phase
    embedding_error: Optional[str] = None  # Error during embedding phase

    def has_errors(self) -> bool:
        """Checks if any error field is set."""
        return any(
            [
                self.extraction_error,
                self.parsing_error,
                self.chunking_error,
                self.embedding_error,
            ]
        )

    def __repr__(self) -> str:
        """Provides a concise representation for logging."""
        status_parts = []
        if self.pdf_content is not None:
            status_parts.append(f"pdf_extracted ({len(self.pdf_content)} bytes)")
        if self.cleaned_prose_text is not None:
            status_parts.append("text_parsed")
        if self.text_chunks:
            status_parts.append("chunked")
        if self.embeddings:
            status_parts.append("embedded")
        if self.has_errors():
            error_types = []
            if self.extraction_error:
                error_types.append("extract_err")
            if self.parsing_error:
                error_types.append("parse_err")
            if self.chunking_error:
                error_types.append("chunk_err")
            if self.embedding_error:
                error_types.append("embed_err")
            status_parts.append(f"ERROR ({', '.join(error_types)})")

        status = ", ".join(status_parts) if status_parts else "initialized"
        tar_info = (
            f" tar='{self.source_tar_filename}'" if self.source_tar_filename else ""
        )
        return f"<Paper id='{self.paper_id}' source='{self.source_gz_member_name}'{tar_info} status='{status}'>"
