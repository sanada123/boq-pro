"""File upload route — mirrors Express /api/upload."""
import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File
from app.config import get_settings
from app.dependencies import get_current_user

router = APIRouter()


@router.post("/")
async def upload_file(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
):
    settings = get_settings()
    os.makedirs(settings.storage_path, exist_ok=True)

    # Generate unique filename
    ext = os.path.splitext(file.filename or "")[1] or ".bin"
    filename = f"{uuid.uuid4()}{ext}"
    filepath = os.path.join(settings.storage_path, filename)

    # Save file
    content = await file.read()
    with open(filepath, "wb") as f:
        f.write(content)

    return {
        "file_url": f"/uploads/{filename}",
        "original_name": file.filename,
        "size": len(content),
    }
