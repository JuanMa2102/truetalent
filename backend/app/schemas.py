from pydantic import BaseModel
from typing import Optional

class TransactionCreate(BaseModel):
    user_id: int
    amount: float
    tipo: str
    idempotency_key: Optional[str] = None

class TransactionResponse(BaseModel):
    id: int
    user_id: int
    amount: float
    tipo: str
    status: str