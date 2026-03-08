"""Analysis & LLM routes — mirrors Express /api/llm and /api/pdf, plus new pipeline endpoints."""
import os
import base64
import json
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.dependencies import get_db, get_current_user
from app.models.analysis_session import AnalysisSession
from app.models.base import generate_uuid

router = APIRouter()


# ─── LLM Invoke (mirrors /api/llm/invoke) ───────────────────────

class LLMInvokeRequest(BaseModel):
    prompt: str
    file_urls: Optional[List[str]] = None
    response_json_schema: Optional[dict] = None


@router.post("/llm/invoke")
async def invoke_llm(
    body: LLMInvokeRequest,
    current_user: dict = Depends(get_current_user),
):
    """Invoke Claude LLM — matches the Express route behavior."""
    import anthropic

    settings = get_settings()
    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    # Build message content
    content = []

    # Add images from file_urls
    if body.file_urls:
        for url in body.file_urls:
            if url.startswith("/uploads/"):
                filepath = os.path.join(settings.storage_path, os.path.basename(url))
                if os.path.exists(filepath):
                    with open(filepath, "rb") as f:
                        data = base64.b64encode(f.read()).decode("utf-8")
                    ext = os.path.splitext(filepath)[1].lower()
                    media_type = {
                        ".png": "image/png", ".jpg": "image/jpeg",
                        ".jpeg": "image/jpeg", ".gif": "image/gif",
                        ".webp": "image/webp",
                    }.get(ext, "image/png")
                    content.append({
                        "type": "image",
                        "source": {"type": "base64", "media_type": media_type, "data": data},
                    })

    # Add text prompt (include schema hint if provided)
    prompt_text = body.prompt
    if body.response_json_schema:
        prompt_text += f"\n\n[JSON Schema — your response MUST match this structure exactly]\n{json.dumps(body.response_json_schema, ensure_ascii=False)}"
    content.append({"type": "text", "text": prompt_text})

    # System message to enforce pure JSON output
    system_msg = (
        "You are an expert Israeli construction engineer. "
        "CRITICAL: You MUST respond with a single valid JSON object ONLY. "
        "No markdown fences, no explanations, no text before or after the JSON. "
        "All array fields MUST be actual JSON arrays (e.g. []), never strings. "
        "All numeric fields must be numbers, not strings."
    )

    # Call Claude with retry logic
    max_retries = 3
    for attempt in range(max_retries):
        try:
            response = client.messages.create(
                model=settings.llm_model,
                max_tokens=16384,
                system=system_msg,
                messages=[{"role": "user", "content": content}],
            )
            break
        except anthropic.RateLimitError:
            if attempt < max_retries - 1:
                import asyncio
                await asyncio.sleep(2 ** (attempt + 1))
            else:
                raise HTTPException(status_code=429, detail="Rate limited")
        except anthropic.APIError as e:
            raise HTTPException(status_code=500, detail=str(e))

    # Extract text response
    raw_text = response.content[0].text if response.content else ""

    # Parse JSON response — strip markdown fences if present
    try:
        cleaned = raw_text.strip()
        if cleaned.startswith("```"):
            # Remove opening fence (```json or ```)
            cleaned = cleaned.split("\n", 1)[1] if "\n" in cleaned else cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3].strip()
        result = json.loads(cleaned)

        # Post-process: ensure expected array fields are actual arrays
        if body.response_json_schema and isinstance(result, dict):
            props = body.response_json_schema.get("properties", {})
            for key, schema in props.items():
                if schema.get("type") == "array" and key in result:
                    val = result[key]
                    if val is None:
                        result[key] = []
                    elif isinstance(val, str):
                        # Try to parse stringified arrays
                        try:
                            parsed = json.loads(val)
                            result[key] = parsed if isinstance(parsed, list) else []
                        except (json.JSONDecodeError, TypeError):
                            result[key] = []
                    elif not isinstance(val, list):
                        result[key] = []

        return result
    except (json.JSONDecodeError, IndexError):
        return {"response": raw_text}


# ─── PDF Extract (mirrors /api/pdf/extract) ──────────────────────

class PDFExtractRequest(BaseModel):
    file_url: str


@router.post("/pdf/extract")
async def extract_pdf(
    body: PDFExtractRequest,
    current_user: dict = Depends(get_current_user),
):
    """Extract text from PDF — uses PyMuPDF instead of unpdf."""
    import fitz  # PyMuPDF

    if body.file_url.startswith("/uploads/"):
        filepath = os.path.join(get_settings().storage_path, os.path.basename(body.file_url))
    else:
        raise HTTPException(status_code=400, detail="Invalid file URL")

    if not os.path.exists(filepath):
        raise HTTPException(status_code=404, detail="File not found")

    doc = fitz.open(filepath)
    pages = []
    full_text = ""

    for i, page in enumerate(doc):
        text = page.get_text()
        pages.append({"page": i + 1, "text": text})
        full_text += text + "\n"

    doc.close()

    return {
        "full_text": full_text.strip(),
        "pages": pages,
        "total_pages": len(pages),
    }


# ─── NEW: Server-side analysis pipeline ──────────────────────────

class StartAnalysisRequest(BaseModel):
    project_id: str


@router.post("/analysis/start")
async def start_analysis(
    body: StartAnalysisRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Start a server-side analysis pipeline (Phase 2+)."""
    session = AnalysisSession(
        id=generate_uuid(),
        project_id=body.project_id,
        created_by=current_user["id"],
        status="queued",
    )
    db.add(session)
    await db.flush()

    # TODO Phase 2: Launch background task here
    # For now, return session ID for polling

    return {"session_id": session.id, "status": "queued"}


@router.get("/analysis/status/{session_id}")
async def get_analysis_status(
    session_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_user),
):
    """Poll analysis progress."""
    result = await db.execute(
        select(AnalysisSession).where(AnalysisSession.id == session_id)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "session_id": session.id,
        "status": session.status,
        "current_layer": session.current_layer,
        "current_layer_name": session.current_layer_name,
        "progress_pct": session.progress_pct,
        "error_message": session.error_message,
        "result_summary": session.result_summary,
    }
