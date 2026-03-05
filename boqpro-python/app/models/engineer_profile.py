from sqlalchemy import Column, String, Float, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import JSONB
from app.models.base import Base, generate_uuid


class EngineerProfile(Base):
    __tablename__ = "engineer_profiles"

    id = Column(String, primary_key=True, default=generate_uuid)
    created_by = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    designer_name = Column(String)
    company_name = Column(String)
    preferred_concrete_grade = Column(String)
    preferred_steel_grade = Column(String)
    typical_slab_thickness = Column(Float)
    common_patterns = Column(JSONB)
    correction_history = Column(JSONB)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
