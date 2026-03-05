from sqlalchemy import Column, String, Float, Boolean, DateTime, ForeignKey, func
from app.models.base import Base, generate_uuid


class CalculationFormula(Base):
    __tablename__ = "calculation_formulas"

    id = Column(String, primary_key=True, default=generate_uuid)
    created_by = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    element_type = Column(String)
    element_name_he = Column(String)
    formula_name = Column(String)
    formula = Column(String)
    formula_description_he = Column(String)
    description = Column(String)
    default_values = Column(String)
    waste_factor = Column(Float, default=0)
    is_active = Column(Boolean, default=True)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
