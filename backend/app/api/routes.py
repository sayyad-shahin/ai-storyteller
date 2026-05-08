from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.generator import generate_story
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

class StoryRequest(BaseModel):
    theme:  str = Field(..., min_length=2, max_length=150)
    tone:   str = Field(..., min_length=2, max_length=50)
    length: int = Field(default=200, ge=50, le=600)
    genre:  str = Field(default="General")

class StoryResponse(BaseModel):
    story:      str
    theme:      str
    tone:       str
    genre:      str
    word_count: int
    status:     str = "success"

@router.post("/generate-story", response_model=StoryResponse)
async def create_story(req: StoryRequest):
    try:
        story = generate_story(req.theme, req.tone, req.length, req.genre)
        return StoryResponse(
            story=story, theme=req.theme, tone=req.tone,
            genre=req.genre, word_count=len(story.split())
        )
    except Exception as e:
        logger.error(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/genres")
def genres():
    return {"genres": ["Fantasy","Sci-Fi","Mystery","Romance","Horror","Adventure","Thriller","Historical","General"]}

@router.get("/tones")
def tones():
    return {"tones": ["Dark","Whimsical","Serious","Humorous","Romantic","Suspenseful","Inspiring","Melancholic"]}