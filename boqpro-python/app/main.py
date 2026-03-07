"""BOQ Pro — FastAPI Application."""
import os
import asyncio
import logging
import traceback
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import get_settings
from app.models.base import get_engine, Base
from app.api import auth, projects, plan_readings, quantity_items
from app.api import standards, prices, formulas, profiles
from app.api import upload, analysis, health

logger = logging.getLogger("boqpro")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create tables on startup with retry logic for Railway cold starts."""
    engine = get_engine()
    max_retries = 5
    for attempt in range(max_retries):
        try:
            async with engine.begin() as conn:
                await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables ready")
            break
        except Exception as e:
            if attempt < max_retries - 1:
                wait = 2 ** attempt
                logger.warning(f"DB connection attempt {attempt + 1}/{max_retries} failed: {e}. Retrying in {wait}s...")
                await asyncio.sleep(wait)
            else:
                logger.error(f"Could not connect to database after {max_retries} attempts: {e}")
                logger.error("App will start but database operations will fail.")
    yield
    await engine.dispose()


app = FastAPI(
    title="BOQ Pro API",
    description="AI-powered Bill of Quantities for Israeli construction",
    version="2.0.0",
    lifespan=lifespan,
)

# Global exception handler for debugging
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "detail": str(exc),
            "type": type(exc).__name__,
            "path": str(request.url.path),
        },
    )

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Routes
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(plan_readings.router, prefix="/api/plan-readings", tags=["plan-readings"])
app.include_router(quantity_items.router, prefix="/api/quantity-items", tags=["quantity-items"])
app.include_router(standards.router, prefix="/api/standards", tags=["standards"])
app.include_router(prices.router, prefix="/api/prices", tags=["prices"])
app.include_router(formulas.router, prefix="/api/formulas", tags=["formulas"])
app.include_router(profiles.router, prefix="/api/profiles", tags=["profiles"])
app.include_router(upload.router, prefix="/api/upload", tags=["upload"])
app.include_router(analysis.router, prefix="/api", tags=["analysis"])

# Serve uploaded files
settings = get_settings()
os.makedirs(settings.storage_path, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.storage_path), name="uploads")

# Serve frontend static files in production (after Vite build)
# In Docker: __file__ = /app/app/main.py → dist at /app/dist (one level up)
dist_path = os.path.join(os.path.dirname(__file__), "..", "dist")
if os.path.isdir(dist_path):
    # Mount Vite's hashed asset bundles (JS/CSS)
    assets_dir = os.path.join(dist_path, "assets")
    if os.path.isdir(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    # SPA catch-all: serve index.html for any non-API route
    # This enables client-side routing (/Login, /Projects, etc.)
    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str):
        # Try serving an exact file from dist/ (favicon.ico, robots.txt, etc.)
        file_path = os.path.join(os.path.abspath(dist_path), full_path)
        if full_path and os.path.isfile(file_path):
            return FileResponse(file_path)
        # SPA fallback — React Router handles the rest
        return FileResponse(
            os.path.join(dist_path, "index.html"),
            media_type="text/html",
        )
