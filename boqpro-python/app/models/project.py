from sqlalchemy import Column, String, Float, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB
from app.models.base import Base, generate_uuid


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=generate_uuid)
    created_by = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    status = Column(String, default="new", index=True)  # new → analyzing → review_pending → completed → error
    work_type = Column(String)
    work_categories = Column(JSONB)  # JSON array
    floors = Column(JSONB)  # JSON array
    file_url = Column(String)
    file_type = Column(String)
    quantities_data = Column(JSONB)  # JSON object
    total_estimated_cost = Column(Float, default=0)
    analysis_notes = Column(String)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
