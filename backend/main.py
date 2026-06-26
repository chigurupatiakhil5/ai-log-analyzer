from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.query import router as query_router
from api.upload import router as upload_router
from core.embedder import _get_model


@asynccontextmanager
async def lifespan(app: FastAPI):
    _get_model()
    yield


app = FastAPI(title="AI Log Analyzer", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(query_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
