# PlagiarismGuard



Advanced AI-Driven Plagiarism Detection for Scientific Research

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://antyplagiat.vercel.app/)
[![Next.js](https://img.shields.io/badge/Next.js-13+-000000?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.io/)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector%20DB-4255ff?style=for-the-badge)](https://www.pinecone.io/)

## Development Status

**This project is currently under active development.** We're still implementing and refining core features. The frontend demo shows the direction we're taking with the UI/UX, but the backend systems are still evolving.

Check out our [live demo here](https://antyplagiat.vercel.app/).

## Project Overview

PlagiarismGuard is a plagiarism detection system built specifically for scientific research papers. We're using modern AI and vector embeddings to provide accurate detection by comparing submitted documents against a comprehensive corpus of scientific literature.

Our system goes beyond simple text matching by understanding semantic similarities. It's designed with academic and research papers in mind, so it understands scientific conventions and citation patterns. The interactive reports highlight potential plagiarized sections with clear source references.

We've built the system on a large knowledge base drawn from arXiv and other academic sources, and wrapped it all in a clean, responsive interface that works well on any device.

## Architecture

PlagiarismGuard uses a modern, serverless architecture:

```
┌────────────────┐      ┌────────────────┐      ┌────────────────┐
│                │      │                │      │                │
│  Next.js App   │─────▶│ Vercel Edge    │─────▶│   Supabase     │
│  (Frontend)    │      │ Functions      │      │  (PostgreSQL)  │
│                │◀─────│ (Serverless)   │◀─────│                │
└────────────────┘      └────────────────┘      └────────────────┘
                               │  ▲
                               │  │
                               ▼  │
                        ┌────────────────┐
                        │                │
                        │   Pinecone     │
                        │  Vector DB     │
                        │                │
                        └────────────────┘
```

### Technology Stack

On the frontend, we're using Next.js 13+ with App Router, React, TypeScript, and Tailwind CSS. The backend runs on Vercel Edge Functions for a completely serverless approach. For data storage, we use Supabase (PostgreSQL) for user data, document metadata, and report results, while Pinecone serves as our vector database for semantic search.

We generate embeddings using OpenAI's text-embedding-3-small model and handle data processing through custom Python scripts. Everything is deployed on the Vercel Platform.

## Project Structure

```
z04/
├── apps/
│   └── frontend/          # Next.js application (UI + serverless functions)
│       ├── public/        # Static assets
│       └── src/           # Source code
│           ├── app/       # Next.js App Router pages
│           ├── components/# UI components
│           ├── lib/       # Utility functions
│           └── types/     # TypeScript type definitions
│
├── packages/              # Shared code and utilities
│
├── scripts/               # Operational and data processing scripts
│   ├── download_arxiv/    # Scripts for downloading papers
│   └── preprocessing/     # Pipeline for processing documents
│       ├── modules/       # Processing modules (extraction, embedding, etc.)
│       └── tests/         # Test suite
│
└── images/                # Project images and assets
```

## Getting Started

### Prerequisites

Before you start, you'll need:
- Node.js 16.8+ and npm
- Python 3.9+ for the data processing scripts
- AWS CLI if you want to access the arXiv dataset
- Accounts for Supabase and Pinecone
- An OpenAI API key

### Installation & Setup

Start by cloning the repository:
```bash
git clone https://github.com/yourusername/plagiarism-guard.git
cd plagiarism-guard
```

Then install the frontend dependencies:
```bash
cd apps/frontend
npm install
```

You'll need to set up your environment variables:
```bash
cp .env.example .env.local
# Edit .env.local with your API keys and configuration
```

Now you can run the development server:
```bash
npm run dev
```

If you want to work with the data processing scripts:
```bash
cd ../../scripts/preprocessing
pip install -r requirements.txt
python main.py
```

## Features

Our system includes a secure login/registration system and supports uploading various academic paper formats like PDF and DOCX. Once you're logged in, you can use the analysis dashboard to track and manage your submitted documents.

The detailed reports provide comprehensive plagiarism analysis with similarity metrics, source identification with references to potential source materials, and visual text highlighting that makes it easy to spot potentially plagiarized sections.

## Technical Implementation

We've built PlagiarismGuard with a serverless architecture using Vercel Edge Functions for scalable, cost-effective backend processing. The system performs semantic similarity detection using Pinecone's vector database and employs a Retrieval-Augmented Generation (RAG) approach for accurate plagiarism detection.

We've also implemented streaming results so you get real-time progress updates during analysis, and we've optimized our data pipeline for efficient processing of scientific papers from arXiv and other sources.

## Contributors

- [Your Name](https://github.com/yourusername)
- [Contributor 1](https://github.com/contributor1)
- [Contributor 2](https://github.com/contributor2)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements

Thanks to arXiv for providing access to their paper repository and to Semantic Scholar Open Research Corpus (S2ORC) for additional research data. We also want to acknowledge all the open-source libraries and frameworks that made this project possible.

