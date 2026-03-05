"""Store individual Computer Vision detections from YOLOv8."""
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB
from app.models.base import Base, generate_uuid


class CVDetection(Base):
    __tablename__ = "cv_detections"

    id = Column(String, primary_key=True, default=generate_uuid)
    analysis_session_id = Column(String, ForeignKey("analysis_sessions.id"), nullable=False, index=True)
    plan_reading_id = Column(String, ForeignKey("plan_readings.id"))
    page_number = Column(Integer)
    # Detection info
    element_class = Column(String, index=True)  # wall, door, window, column, beam, stairs
    bbox_x = Column(Float)
    bbox_y = Column(Float)
    bbox_w = Column(Float)
    bbox_h = Column(Float)
    confidence = Column(Float)
    # Matched data
    matched_ocr_text = Column(String)
    calculated_dimensions = Column(JSONB)  # {"length_m": 3.5, "width_m": 0.2, ...}
    # User confirmation
    is_confirmed = Column(Boolean, default=False)
    user_label = Column(String)  # User-corrected label
    created_date = Column(DateTime(timezone=True), server_default=func.now())
