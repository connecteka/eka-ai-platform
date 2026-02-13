"""
Voice transcription router for EKA-AI Backend.
Handles audio file uploads and transcription using OpenAI Whisper.
"""
import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, File, UploadFile, Form
from pydantic import BaseModel

router = APIRouter(prefix="/api/voice", tags=["Voice"])

# Emergent LLM Key for Whisper
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")

# Supported audio formats
ALLOWED_AUDIO_FORMATS = ['mp3', 'mp4', 'mpeg', 'mpga', 'm4a', 'wav', 'webm', 'ogg']
MAX_AUDIO_SIZE = 25 * 1024 * 1024  # 25MB limit for Whisper

# Temp directory for audio files
AUDIO_TEMP_DIR = Path("/tmp/audio_uploads")
AUDIO_TEMP_DIR.mkdir(exist_ok=True)


class TranscriptionResponse(BaseModel):
    success: bool
    text: str
    language: Optional[str] = None
    duration: Optional[float] = None
    error: Optional[str] = None


class TranscriptionRequest(BaseModel):
    language: Optional[str] = None  # ISO-639-1 code (en, es, hi, etc.)
    prompt: Optional[str] = None  # Context hint for better transcription


@router.post("/transcribe", response_model=TranscriptionResponse)
async def transcribe_audio(
    audio: UploadFile = File(...),
    language: Optional[str] = Form(None),
    prompt: Optional[str] = Form(None)
):
    """
    Transcribe audio file to text using OpenAI Whisper.
    
    Supported formats: mp3, mp4, mpeg, mpga, m4a, wav, webm, ogg
    Max file size: 25MB
    
    Optional parameters:
    - language: ISO-639-1 language code (e.g., 'en', 'hi', 'es')
    - prompt: Context hint to improve transcription accuracy
    """
    if not EMERGENT_LLM_KEY:
        raise HTTPException(
            status_code=503,
            detail="Voice transcription service not configured. EMERGENT_LLM_KEY is required."
        )
    
    # Validate file
    if not audio.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    # Check extension
    ext = audio.filename.rsplit('.', 1)[-1].lower() if '.' in audio.filename else ''
    if ext not in ALLOWED_AUDIO_FORMATS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported audio format. Allowed: {', '.join(ALLOWED_AUDIO_FORMATS)}"
        )
    
    # Read file content
    content = await audio.read()
    
    # Check file size
    if len(content) > MAX_AUDIO_SIZE:
        raise HTTPException(
            status_code=400,
            detail=f"Audio file too large. Maximum size: {MAX_AUDIO_SIZE // (1024*1024)}MB"
        )
    
    # Save to temp file (Whisper API requires file path)
    temp_filename = f"{uuid.uuid4().hex}.{ext}"
    temp_path = AUDIO_TEMP_DIR / temp_filename
    
    try:
        with open(temp_path, "wb") as f:
            f.write(content)
        
        # Transcribe using emergentintegrations
        from emergentintegrations.llm.openai import OpenAISpeechToText
        
        stt = OpenAISpeechToText(api_key=EMERGENT_LLM_KEY)
        
        with open(temp_path, "rb") as audio_file:
            # Build transcription parameters
            transcribe_kwargs = {
                "file": audio_file,
                "model": "whisper-1",
                "response_format": "verbose_json"
            }
            
            if language:
                transcribe_kwargs["language"] = language
            
            if prompt:
                transcribe_kwargs["prompt"] = prompt
            
            response = await stt.transcribe(**transcribe_kwargs)
        
        # Extract response data
        text = response.text if hasattr(response, 'text') else str(response)
        detected_language = getattr(response, 'language', language)
        duration = getattr(response, 'duration', None)
        
        return TranscriptionResponse(
            success=True,
            text=text,
            language=detected_language,
            duration=duration
        )
        
    except Exception as e:
        print(f"Transcription error: {str(e)}")
        return TranscriptionResponse(
            success=False,
            text="",
            error=str(e)
        )
    finally:
        # Clean up temp file
        if temp_path.exists():
            temp_path.unlink()


@router.post("/transcribe-for-chat")
async def transcribe_for_chat(
    audio: UploadFile = File(...),
    session_id: Optional[str] = Form(None)
):
    """
    Transcribe audio and return formatted for chat input.
    Includes auto-detected language and formatted response.
    """
    # Use the main transcribe function
    result = await transcribe_audio(
        audio=audio,
        language=None,  # Auto-detect
        prompt="This is a voice message about automobile service, vehicle repairs, or workshop queries."
    )
    
    if not result.success:
        return {
            "success": False,
            "error": result.error,
            "chat_input": None
        }
    
    return {
        "success": True,
        "transcription": result.text,
        "language": result.language,
        "duration": result.duration,
        "chat_input": {
            "text": result.text,
            "source": "voice",
            "session_id": session_id
        }
    }


@router.get("/status")
def get_voice_service_status():
    """Check voice transcription service status."""
    return {
        "enabled": bool(EMERGENT_LLM_KEY),
        "model": "whisper-1",
        "provider": "openai",
        "max_file_size_mb": MAX_AUDIO_SIZE // (1024 * 1024),
        "supported_formats": ALLOWED_AUDIO_FORMATS,
        "message": "Voice transcription is ready" if EMERGENT_LLM_KEY else "EMERGENT_LLM_KEY not configured"
    }


@router.get("/supported-languages")
def get_supported_languages():
    """Get list of supported languages for transcription."""
    return {
        "languages": [
            {"code": "en", "name": "English"},
            {"code": "hi", "name": "Hindi"},
            {"code": "es", "name": "Spanish"},
            {"code": "fr", "name": "French"},
            {"code": "de", "name": "German"},
            {"code": "it", "name": "Italian"},
            {"code": "pt", "name": "Portuguese"},
            {"code": "ru", "name": "Russian"},
            {"code": "ja", "name": "Japanese"},
            {"code": "ko", "name": "Korean"},
            {"code": "zh", "name": "Chinese"},
            {"code": "ar", "name": "Arabic"},
            {"code": "ta", "name": "Tamil"},
            {"code": "te", "name": "Telugu"},
            {"code": "mr", "name": "Marathi"},
            {"code": "bn", "name": "Bengali"},
            {"code": "gu", "name": "Gujarati"},
            {"code": "kn", "name": "Kannada"},
            {"code": "ml", "name": "Malayalam"},
            {"code": "pa", "name": "Punjabi"},
        ],
        "note": "Whisper supports 90+ languages. Common Indian languages included above."
    }
