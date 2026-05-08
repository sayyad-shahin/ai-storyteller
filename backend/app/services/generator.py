import os
import logging
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)
_client = None

def get_client():
    global _client
    if _client is None:
        api_key = os.getenv("GROQ_API_KEY", "")
        if not api_key:
            raise ValueError("GROQ_API_KEY not set in .env file")
        _client = Groq(api_key=api_key)
        logger.info("Groq client ready.")
    return _client


def generate_story(theme: str, tone: str, length: int, genre: str = "General") -> str:
    word_target = max(100, int(length * 0.75))

    system_prompt = (
        "You are a professional creative fiction writer. "
        "Write ONLY the story — no title, no headings, no commentary. "
        "Start immediately with the narrative. "
        "Every story has a clear beginning, middle, and ending. "
        "Stay strictly on theme throughout."
    )

    user_prompt = (
        f"Write a {tone.lower()} {genre.lower()} story about: {theme}.\n"
        f"Approximately {word_target} words. No title. Start directly with the story."
    )

    client = get_client()

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user",   "content": user_prompt},
        ],
        max_tokens=1024,
        temperature=0.85,
    )

    return response.choices[0].message.content.strip()