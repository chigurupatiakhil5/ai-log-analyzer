from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from core.embedder import embed_texts
from core.groq_client import stream_answer
from core.vector_store import search_chunks

router = APIRouter()


class QueryRequest(BaseModel):
    session_id: str
    question: str


@router.post("/query")
def query_log(request: QueryRequest):
    if not request.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    query_embedding = embed_texts([request.question])[0]
    chunks = search_chunks(query_embedding, request.session_id)

    if not chunks:
        raise HTTPException(status_code=404, detail="No log data found for this session")

    return StreamingResponse(
        stream_answer(request.question, chunks),
        media_type="text/plain",
    )
