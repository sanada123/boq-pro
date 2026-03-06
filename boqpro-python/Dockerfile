# ============================================================
# Multi-stage Dockerfile: Frontend (Vite) + Python (FastAPI)
# Stage 1 clones repo to build frontend (since Docker context
# is /boqpro-python, not repo root).
# ============================================================

# ── Stage 1: Build React frontend with Vite ─────────────────
FROM node:20-slim AS frontend-build

RUN apt-get update && apt-get install -y --no-install-recommends git ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /build

# Clone repo and build frontend
ARG REPO_URL=https://github.com/sanada123/boq-pro.git
ARG BRANCH=main
RUN git clone --depth 1 --branch ${BRANCH} ${REPO_URL} . \
    && npm ci \
    && npm run build \
    && ls -la dist/


# ── Stage 2: Python backend ─────────────────────────────────
FROM python:3.11-slim

# System deps for PyMuPDF (OpenCV deps added in Phase 4+)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libfontconfig1 libfreetype6 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install Python dependencies (cached layer)
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy Python application
COPY app/ app/
COPY alembic/ alembic/
COPY alembic.ini .

# Copy built frontend from stage 1
COPY --from=frontend-build /build/dist dist/

# Create runtime directories
RUN mkdir -p uploads models

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
