# Shared Gemini (Google AI) client for narrative, translation, briefing, recommendations.
# Uses google-generativeai with GEMINI_API_KEY (standalone, no Emergent).
import os
import asyncio
from typing import Optional

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
MODEL_NAME = "gemini-2.0-flash"


def _generate_content_sync(system_instruction: str, user_content: str) -> str:
    """Sync call to Gemini. Run via asyncio.to_thread from async code."""
    import google.generativeai as genai
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel(
        MODEL_NAME,
        system_instruction=system_instruction,
    )
    response = model.generate_content(user_content)
    if not response or not response.text:
        raise ValueError("Empty response from Gemini")
    return response.text.strip()


async def generate_gemini(system_instruction: str, user_content: str) -> Optional[str]:
    """Async wrapper: call Gemini with system + user message. Returns response text or None."""
    if not GEMINI_API_KEY:
        return None
    try:
        return await asyncio.to_thread(_generate_content_sync, system_instruction, user_content)
    except Exception as e:
        print(f"Gemini generate_gemini error: {e}")
        return None
