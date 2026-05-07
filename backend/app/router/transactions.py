from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from redis import Redis
from rq import Queue


from ..database import SessionLocal
from ..models import Transaction
from ..schemas import TransactionCreate, TransactionResponse
from ..tasks import process_transactions
from ..manager import manager
from ..config import REDIS_URL

router = APIRouter(
    prefix="/transactions",
    tags=["transactions"]
)
redis_conn = Redis.from_url(REDIS_URL)
queue = Queue(connection=redis_conn)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
@router.get("/")
def read_transactions(db: Session = Depends(get_db)):
    transactions = db.query(Transaction).order_by(Transaction.id.desc()).all()
    return transactions

@router.post("/create")
async def create_transaction(transaction: TransactionCreate, db: Session = Depends(get_db)):
    # --- Idempotency check ---
    if transaction.idempotency_key:
        existing = db.query(Transaction).filter(
            Transaction.idempotency_key == transaction.idempotency_key
        ).first()
        if existing:
            return {
                "message": "Transaction already processed (idempotent)",
                "transaction": TransactionResponse(**existing.__dict__)
            }

    new_transaction = Transaction(
        user_id=transaction.user_id,
        amount=transaction.amount,
        tipo=transaction.tipo,
        idempotency_key=transaction.idempotency_key
    )
    
    try:
        db.add(new_transaction)
        db.commit()
        db.refresh(new_transaction)
        return {
            "message": "Transaction created successfully",
            "transaction": TransactionResponse(**new_transaction.__dict__)
        }
    except Exception as e:
        db.rollback()  
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/async-process")
def async_process():
    db = SessionLocal()
    transactions = db.query(Transaction).filter(Transaction.status == "pending").all()
    for transaction in transactions:
        queue.enqueue(process_transactions, transaction.id)

    return {
        "message": f"Transactions is being processed asynchronously.",
        "transaction": transactions
    }

#web socket
@router.websocket("/stream")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Mantiene la conexión abierta escuchando (aunque el worker es quien enviará)
            data = await websocket.receive_text() 
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.post("/internal/notify", include_in_schema=False)
async def internal_notify(data: dict):
    # Este endpoint recibe el aviso del worker y lo manda al WebSocket
    await manager.broadcast(data)
    return {"status": "ok"}