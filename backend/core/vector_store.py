import os

from dotenv import load_dotenv
from supabase import create_client, Client

from core.parser import LogChunk

load_dotenv()


def _get_client() -> Client:
    url = os.environ["SUPABASE_URL"]
    key = os.environ["SUPABASE_KEY"]
    return create_client(url, key)


def store_chunks(chunks: list[LogChunk], embeddings: list[list[float]], session_id: str) -> None:
    client = _get_client()
    rows = [
        {
            "session_id": session_id,
            "chunk_index": chunk.index,
            "start_line": chunk.start_line,
            "end_line": chunk.end_line,
            "content": chunk.text,
            "embedding": embedding,
        }
        for chunk, embedding in zip(chunks, embeddings)
    ]
    client.table("log_chunks").insert(rows).execute()


def search_chunks(query_embedding: list[float], session_id: str, top_k: int = 5) -> list[dict]:
    client = _get_client()
    result = client.rpc(
        "match_chunks",
        {
            "query_embedding": query_embedding,
            "session_id_filter": session_id,
            "match_count": top_k,
        },
    ).execute()
    return result.data
