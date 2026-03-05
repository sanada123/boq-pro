from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB
from app.models.base import Base, generate_uuid


class PlanReading(Base):
    __tablename__ = "plan_readings"

    id = Column(String, primary_key=True, default=generate_uuid)
    created_by = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    project_id = Column(String, ForeignKey("projects.id"), index=True)
    plan_type = Column(String)
    plan_type_category = Column(String)
    file_url = Column(String)
    scale = Column(String)
    title_info = Column(JSONB)
    elements = Column(JSONB)  # JSON array of detected elements
    legend = Column(JSONB)  # JSON object
    sections_cuts = Column(JSONB)
    reinforcement_details = Column(JSONB)
    tables = Column(JSONB)
    text_annotations = Column(JSONB)
    unclear_items = Column(JSONB)
    user_corrections = Column(JSONB)
    confidence_notes = Column(String)
    is_verified = Column(Boolean, default=False)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
