from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, ForeignKey, func
from app.models.base import Base, generate_uuid


class PriceItem(Base):
    __tablename__ = "price_items"

    id = Column(String, primary_key=True, default=generate_uuid)
    created_by = Column(String, ForeignKey("users.id"), nullable=False, index=True)
    item_name_he = Column(String)
    item_name_en = Column(String)
    section = Column(String)
    unit = Column(String)
    unit_name_he = Column(String)
    price = Column(Float, default=0)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_date = Column(DateTime(timezone=True), server_default=func.now())
