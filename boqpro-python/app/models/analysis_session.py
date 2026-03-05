"""Track analysis pipeline progress per project."""
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB
from app.models.base import Base, generate_uuid


class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"

    id = Column(String, primary_key=True, default=generate_uuid)
    project_id = Column(String, ForeignKey("projects.id"), nullable=False, index=True)
    created_by = Column(String, ForeignKey("users.id"), nullable=False)
    status = Column(String, default="queued", index=True)
    # Status values: queued → pdf_render → preprocessing → cv_detection →
    #   ocr → spatial_analysis → llm_analysis → quantities → pricing → completed / error
    current_layer = Column(Integer, default=0)  # 1-7
    current_layer_name = Column(String)
    progress_pct = Column(Float, default=0)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    layer_timings = Column(JSONB)  # {"layer_1": 3.2, "layer_2": 1.5, ...}
    error_message = Column(String)
    config = Column(JSONB)  # Pipeline configuration used
    result_summary = Column(JSONB)  # Summary after completion
    created_date = Column(DateTime(timezone=True), server_default=func.now())
