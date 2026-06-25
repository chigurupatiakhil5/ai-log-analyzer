from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.query import router as query_router
from api.upload import router as upload_router

app = FastAPI(title="AI Log Analyzer", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite dev server port
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload_router)
app.include_router(query_router)


@app.get("/health")
def health_check():
    return {"status": "ok"}
