from datetime import datetime, timezone
from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_db

router = APIRouter()


@router.get("/health")
async def health_check():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}


@router.get("/health/db")
async def health_db(db: AsyncSession = Depends(get_db)):
    """Test database connectivity and table existence."""
    try:
        # Test basic connectivity
        result = await db.execute(text("SELECT 1"))
        result.scalar()

        # Check which tables exist
        tables_result = await db.execute(text(
            "SELECT table_name FROM information_schema.tables "
            "WHERE table_schema = 'public' ORDER BY table_name"
        ))
        tables = [row[0] for row in tables_result.fetchall()]

        return {
            "status": "ok",
            "database": "connected",
            "tables": tables,
            "table_count": len(tables),
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        return {
            "status": "error",
            "database": "disconnected",
            "error": str(e),
            "error_type": type(e).__name__,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
