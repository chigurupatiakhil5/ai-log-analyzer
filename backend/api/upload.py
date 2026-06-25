import uuid

from fastapi import APIRouter, File, HTTPException, UploadFile

from core.embedder import embed_texts
from core.parser import parse_log
from core.spike_detector import detect_spikes
from core.vector_store import store_chunks

router = APIRouter()


@router.post("/upload")
async def upload_log(file: UploadFile = File(...)):
    if not file.filename.endswith((".log", ".txt")):
        raise HTTPException(status_code=400, detail="Only .log or .txt files are supported")

    content = await file.read()
    text = content.decode("utf-8", errors="ignore")

    if not text.strip():
        raise HTTPException(status_code=400, detail="File is empty")

    session_id = str(uuid.uuid4())
    chunks = parse_log(text)
    embeddings = embed_texts([chunk.text for chunk in chunks])
    store_chunks(chunks, embeddings, session_id)

    spike_report = detect_spikes(chunks)

    return {
        "session_id": session_id,
        "chunk_count": len(chunks),
        "spike_report": {
            "flagged": spike_report.flagged,
            "total_counts": spike_report.total_counts,
            "spikes": spike_report.spikes,
        },
    }
