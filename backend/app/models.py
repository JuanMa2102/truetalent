from sqlalchemy import Column, Integer, Float, String, Text, UniqueConstraint
from .database import Base 

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    amount = Column(Float, nullable=False)
    tipo = Column(String, nullable=False)
    status = Column(String, default="pending")
    idempotency_key = Column(String, unique=True, nullable=True, index=True)

class AIQuery(Base):
    __tablename__ = "ai_queries"
    id = Column(Integer, primary_key=True, index=True)
    input_text = Column(Text)
    summary = Column(Text)