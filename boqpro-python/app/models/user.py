from sqlalchemy import Column, String, DateTime, func
from app.models.base import Base, generate_uuid


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=generate_uuid)
    email = Column(String, unique=True, nullable=False, index=True)
    username = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="user")
    created_date = Column(DateTime(timezone=True), server_default=func.now())
