from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, func
from app.models.base import Base, generate_uuid


class EngineerStandard(Base):
    __tablename__ = "engineer_standards"

    id = Column(String, primary_key=True, default=generate_uuid)
    created_by = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    section = Column(String)
    sub_section = Column(String)
    section_name_he = Column(String)
    standard_name = Column(String)
    standard_reference = Column(String)
    description = Column(String)
    waste_factor = Column(Float, default=0)
    custom_notes = Column(String)
    is_active = Column(Boolean, default=True)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
