"""Generic CRUD factory — mirrors the Express _entityFactory.js pattern.

The frontend apiClient.js expects:
  GET    /            → list (array), supports ?sort, ?project_id=X, etc.
  GET    /:id         → single object
  POST   /            → create, returns created object
  POST   /bulk        → bulk create, returns array
  PATCH  /:id         → partial update, returns updated object
  DELETE /:id         → delete, returns {"success": true}
"""
import json
from typing import Type, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.dialects.postgresql import JSONB

from app.dependencies import get_db, get_current_user
from app.models.base import Base, generate_uuid


# Columns that store JSON but might arrive as strings
JSONB_COLUMNS = {
    "work_categories", "floors", "quantities_data", "title_info",
    "elements", "legend", "sections_cuts", "reinforcement_details",
    "tables", "text_annotations", "unclear_items", "user_corrections",
    "common_patterns", "correction_history", "layer_timings",
    "config", "result_summary", "calculated_dimensions",
}


def _serialize_row(row, model: Type[Base]) -> dict:
    """Convert SQLAlchemy model instance to dict, auto-handling JSONB."""
    d = {}
    for col in model.__table__.columns:
        val = getattr(row, col.name)
        # Ensure JSONB fields are returned as objects, not strings
        if col.name in JSONB_COLUMNS and isinstance(val, str):
            try:
                val = json.loads(val)
            except (json.JSONDecodeError, TypeError):
                pass
        # Convert datetime to ISO string for JSON compat
        if hasattr(val, "isoformat"):
            val = val.isoformat()
        d[col.name] = val
    return d


def _parse_value(key: str, value):
    """Parse incoming values — ensure JSON strings become dicts/lists for JSONB columns."""
    if key in JSONB_COLUMNS and isinstance(value, str):
        try:
            return json.loads(value)
        except (json.JSONDecodeError, TypeError):
            return value
    return value


def create_entity_router(
    model: Type[Base],
    owner_field: str = "created_by",
    allowed_filters: Optional[List[str]] = None,
) -> APIRouter:
    """Create a full CRUD router for any SQLAlchemy model.

    This replicates the Express _entityFactory.js behavior:
    - Auto-scopes all queries to the current user via owner_field
    - Supports query param filters (?project_id=X)
    - Supports ?sort=-created_date (prefix - for DESC)
    - JSON fields are auto-parsed/serialized
    """
    router = APIRouter()
    columns = {col.name for col in model.__table__.columns}

    @router.get("/")
    async def list_entities(
        request: Request,
        db: AsyncSession = Depends(get_db),
        current_user: dict = Depends(get_current_user),
    ):
        query = select(model)

        # Scope to owner
        if owner_field and owner_field in columns:
            query = query.where(getattr(model, owner_field) == current_user["id"])

        # Apply query param filters
        for key, value in request.query_params.items():
            if key == "sort":
                continue
            if key in columns:
                query = query.where(getattr(model, key) == value)

        # Sort
        sort_param = request.query_params.get("sort")
        if sort_param:
            if sort_param.startswith("-"):
                query = query.order_by(desc(getattr(model, sort_param[1:], None) or model.created_date))
            else:
                query = query.order_by(asc(getattr(model, sort_param, None) or model.created_date))
        else:
            if "created_date" in columns:
                query = query.order_by(desc(model.created_date))

        result = await db.execute(query)
        rows = result.scalars().all()
        return [_serialize_row(r, model) for r in rows]

    @router.get("/{entity_id}")
    async def get_entity(
        entity_id: str,
        db: AsyncSession = Depends(get_db),
        current_user: dict = Depends(get_current_user),
    ):
        result = await db.execute(select(model).where(model.id == entity_id))
        row = result.scalar_one_or_none()
        if not row:
            raise HTTPException(status_code=404, detail="Not found")
        return _serialize_row(row, model)

    @router.post("/")
    async def create_entity(
        request: Request,
        db: AsyncSession = Depends(get_db),
        current_user: dict = Depends(get_current_user),
    ):
        body = await request.json()
        entity = model(id=generate_uuid())

        # Set owner
        if owner_field and owner_field in columns:
            setattr(entity, owner_field, current_user["id"])

        # Set fields from body
        for key, value in body.items():
            if key in columns and key not in ("id", owner_field, "created_date"):
                setattr(entity, key, _parse_value(key, value))

        db.add(entity)
        await db.flush()
        await db.refresh(entity)
        return _serialize_row(entity, model)

    @router.post("/bulk")
    async def bulk_create(
        request: Request,
        db: AsyncSession = Depends(get_db),
        current_user: dict = Depends(get_current_user),
    ):
        items = await request.json()
        if not isinstance(items, list):
            raise HTTPException(status_code=400, detail="Expected array")

        results = []
        for item_data in items:
            entity = model(id=generate_uuid())
            if owner_field and owner_field in columns:
                setattr(entity, owner_field, current_user["id"])
            for key, value in item_data.items():
                if key in columns and key not in ("id", owner_field, "created_date"):
                    setattr(entity, key, _parse_value(key, value))
            db.add(entity)
            results.append(entity)

        await db.flush()
        for e in results:
            await db.refresh(e)
        return [_serialize_row(e, model) for e in results]

    @router.patch("/{entity_id}")
    async def update_entity(
        entity_id: str,
        request: Request,
        db: AsyncSession = Depends(get_db),
        current_user: dict = Depends(get_current_user),
    ):
        result = await db.execute(select(model).where(model.id == entity_id))
        entity = result.scalar_one_or_none()
        if not entity:
            raise HTTPException(status_code=404, detail="Not found")

        body = await request.json()
        for key, value in body.items():
            if key in columns and key not in ("id", owner_field, "created_date"):
                setattr(entity, key, _parse_value(key, value))

        await db.flush()
        await db.refresh(entity)
        return _serialize_row(entity, model)

    @router.delete("/{entity_id}")
    async def delete_entity(
        entity_id: str,
        db: AsyncSession = Depends(get_db),
        current_user: dict = Depends(get_current_user),
    ):
        result = await db.execute(select(model).where(model.id == entity_id))
        entity = result.scalar_one_or_none()
        if not entity:
            raise HTTPException(status_code=404, detail="Not found")
        await db.delete(entity)
        return {"success": True}

    return router
