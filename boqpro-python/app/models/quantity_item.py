from sqlalchemy import Column, String, Float, DateTime, ForeignKey, func
from app.models.base import Base, generate_uuid


class QuantityItem(Base):
    __tablename__ = "quantity_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    created_by = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    project_id = Column(String, ForeignKey("projects.id"), index=True)
    plan_reading_id = Column(String, ForeignKey("plan_readings.id"))
    section = Column(String, index=True)
    sub_section = Column(String)
    section_name_he = Column(String)
    item_number = Column(String)
    description = Column(String)
    unit = Column(String)
    unit_name_he = Column(String)
    quantity = Column(Float, default=0)
    unit_price = Column(Float, default=0)
    total_price = Column(Float, default=0)
    formula_used = Column(String)
    source_element = Column(String)
    standard_reference = Column(String)
    notes = Column(String)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
