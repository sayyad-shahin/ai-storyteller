from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router
from dotenv import load_dotenv
import os

# Load .env file automatically on startup
load_dotenv()

app = FastAPI(title="StoryForge API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")

@app.get("/")
def home():
    key_set = bool(os.getenv("GROQ_API_KEY"))
    return {
        "message": "StoryForge API v2.0",
        "status": "running",
        "groq_key_loaded": key_set
    }

@app.get("/health")
def health():
    return {"status": "ok"}