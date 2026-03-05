"""Store OCR text extractions from PaddleOCR."""
from sqlalchemy import Column, String, Float, Integer, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB
from app.models.base import Base, generate_uuid


class OCRResult(Base):
    __tablename__ = "ocr_results"

    id = Column(String, primary_key=True, default=generate_uuid)
    analysis_session_id = Column(String, ForeignKey("analysis_sessions.id"), nullable=False, index=True)
    page_number = Column(Integer)
    region_type = Column(String)  # drawing, title_block, legend, annotation
    text_content = Column(String)
    language = Column(String)  # he, en, num
    bbox_x = Column(Float)
    bbox_y = Column(Float)
    bbox_w = Column(Float)
    bbox_h = Column(Float)
    confidence = Column(Float)
    matched_detection_id = Column(String, ForeignKey("cv_detections.id"))
    created_date = Column(DateTime(timezone=True), server_default=func.now())
