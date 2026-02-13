"""
Files routes for EKA-AI Backend.
Handles file uploads, downloads, and management.
"""
import os
import uuid
import shutil
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, HTTPException, Query, File, UploadFile, Form
from fastapi.responses import FileResponse

from utils.database import files_collection, serialize_doc, serialize_docs

router = APIRouter(prefix="/api/files", tags=["Files"])

# Create uploads directory
UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {
    'image': ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    'document': ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'csv'],
    'video': ['mp4', 'mov', 'avi', 'webm'],
}

MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB


def get_file_type(filename: str) -> str:
    """Determine file type from extension."""
    ext = filename.rsplit('.', 1)[-1].lower() if '.' in filename else ''
    for file_type, extensions in ALLOWED_EXTENSIONS.items():
        if ext in extensions:
            return file_type
    return 'other'


@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    job_card_id: Optional[str] = Form(None),
    category: Optional[str] = Form(None)
):
    """Upload a file (image, document, or video)."""
    
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided")
    
    ext = file.filename.rsplit('.', 1)[-1].lower() if '.' in file.filename else ''
    all_extensions = [e for exts in ALLOWED_EXTENSIONS.values() for e in exts]
    if ext not in all_extensions:
        raise HTTPException(status_code=400, detail=f"File type not allowed. Allowed: {', '.join(all_extensions)}")
    
    file_id = uuid.uuid4().hex
    safe_filename = f"{file_id}.{ext}"
    file_path = UPLOAD_DIR / safe_filename
    
    try:
        content = await file.read()
        
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=400, detail=f"File too large. Max size: {MAX_FILE_SIZE // (1024*1024)}MB")
        
        with open(file_path, "wb") as f:
            f.write(content)
        
        file_doc = {
            "file_id": file_id,
            "original_name": file.filename,
            "stored_name": safe_filename,
            "file_type": get_file_type(file.filename),
            "extension": ext,
            "size": len(content),
            "mime_type": file.content_type,
            "job_card_id": job_card_id,
            "category": category or "general",
            "uploaded_at": datetime.now(timezone.utc),
            "url": f"/api/files/{file_id}"
        }
        
        result = files_collection.insert_one(file_doc)
        file_doc["_id"] = result.inserted_id
        
        return {
            "success": True,
            "file": serialize_doc(file_doc),
            "url": f"/api/files/{file_id}",
            "file_id": file_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/{file_id}")
async def get_file(file_id: str):
    """Retrieve a file by ID."""
    file_doc = files_collection.find_one({"file_id": file_id})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_path = UPLOAD_DIR / file_doc["stored_name"]
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="File not found on disk")
    
    return FileResponse(
        path=file_path,
        filename=file_doc["original_name"],
        media_type=file_doc.get("mime_type", "application/octet-stream")
    )


@router.get("")
def list_files(
    job_card_id: Optional[str] = None,
    category: Optional[str] = None,
    file_type: Optional[str] = None,
    limit: int = Query(50, ge=1, le=100)
):
    """List uploaded files with optional filtering."""
    query = {}
    if job_card_id:
        query["job_card_id"] = job_card_id
    if category:
        query["category"] = category
    if file_type:
        query["file_type"] = file_type
    
    cursor = files_collection.find(query).sort("uploaded_at", -1).limit(limit)
    docs = list(cursor)
    
    return {"success": True, "files": serialize_docs(docs), "count": len(docs)}


@router.delete("/{file_id}")
def delete_file(file_id: str):
    """Delete a file."""
    file_doc = files_collection.find_one({"file_id": file_id})
    if not file_doc:
        raise HTTPException(status_code=404, detail="File not found")
    
    file_path = UPLOAD_DIR / file_doc["stored_name"]
    if file_path.exists():
        file_path.unlink()
    
    files_collection.delete_one({"file_id": file_id})
    
    return {"success": True, "message": "File deleted"}


@router.post("/upload-chunk")
async def upload_file_chunk(
    chunk: UploadFile = File(...),
    file_id: str = None,
    chunk_number: int = 0,
    total_chunks: int = 1,
    original_name: str = None
):
    """Upload file in chunks for large files."""
    
    chunks_dir = UPLOAD_DIR / "chunks" / file_id
    chunks_dir.mkdir(parents=True, exist_ok=True)
    
    chunk_path = chunks_dir / f"chunk_{chunk_number}"
    content = await chunk.read()
    
    with open(chunk_path, "wb") as f:
        f.write(content)
    
    existing_chunks = list(chunks_dir.glob("chunk_*"))
    
    if len(existing_chunks) == total_chunks:
        ext = original_name.rsplit('.', 1)[-1].lower() if original_name and '.' in original_name else 'bin'
        final_filename = f"{file_id}.{ext}"
        final_path = UPLOAD_DIR / final_filename
        
        with open(final_path, "wb") as outfile:
            for i in range(total_chunks):
                chunk_file = chunks_dir / f"chunk_{i}"
                with open(chunk_file, "rb") as infile:
                    outfile.write(infile.read())
        
        final_size = final_path.stat().st_size
        shutil.rmtree(chunks_dir)
        
        file_doc = {
            "file_id": file_id,
            "original_name": original_name or f"file.{ext}",
            "stored_name": final_filename,
            "file_type": get_file_type(original_name or ""),
            "extension": ext,
            "size": final_size,
            "uploaded_at": datetime.now(timezone.utc),
            "url": f"/api/files/{file_id}"
        }
        
        files_collection.insert_one(file_doc)
        
        return {
            "success": True,
            "complete": True,
            "file_id": file_id,
            "url": f"/api/files/{file_id}"
        }
    
    return {
        "success": True,
        "complete": False,
        "chunks_received": len(existing_chunks),
        "total_chunks": total_chunks
    }
