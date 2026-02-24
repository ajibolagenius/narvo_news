# TTS Service for audio generation
import os
import base64
from typing import Optional

EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

async def generate_tts_audio(text: str, voice_id: str = "nova", speed: float = 1.0) -> Optional[str]:
    """Generate TTS audio using OpenAI TTS"""
    if not text or not EMERGENT_LLM_KEY:
        return None
    
    try:
        from emergentintegrations.llm.openai import OpenAITextToSpeech
        
        # Truncate text if too long
        tts_text = text[:4000] if len(text) > 4000 else text
        
        tts = OpenAITextToSpeech(api_key=EMERGENT_LLM_KEY)
        audio_bytes = await tts.generate_speech(
            text=tts_text,
            model="tts-1",
            voice=voice_id,
            response_format="mp3",
            speed=speed
        )
        
        audio_b64 = base64.b64encode(audio_bytes).decode()
        return f"data:audio/mpeg;base64,{audio_b64}"
    except Exception as e:
        print(f"TTS generation error: {e}")
        return None

def get_available_voices():
    """Get list of available TTS voices"""
    return [
        {"id": "nova", "name": "Nova", "accent": "Neutral", "language": "en-US", "gender": "Female"},
        {"id": "alloy", "name": "Alloy", "accent": "Neutral", "language": "en-US", "gender": "Neutral"},
        {"id": "echo", "name": "Echo", "accent": "Warm", "language": "en-US", "gender": "Male"},
        {"id": "fable", "name": "Fable", "accent": "British", "language": "en-GB", "gender": "Male"},
        {"id": "onyx", "name": "Onyx", "accent": "Deep", "language": "en-US", "gender": "Male"},
        {"id": "shimmer", "name": "Shimmer", "accent": "Soft", "language": "en-US", "gender": "Female"},
    ]
