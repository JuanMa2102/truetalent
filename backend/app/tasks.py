import time
import requests

from .database import SessionLocal
from .models import Transaction

async def process_transactions(transaction_id: int):
    db = SessionLocal()
    transaction = db.query(Transaction).filter(Transaction.id == transaction_id).first()
    if not transaction:
        print(f"Transaction with ID {transaction_id} not found.")
        return

    try:
        print(f"Procesando transacción {transaction.id}")
        transaction.status = "processing"
        payload = {"id": transaction_id, "status": "processing"}
        requests.post("http://localhost:8000/transactions/internal/notify", json=payload)
        db.commit()
        time.sleep(5)
        transaction.status = "completed"
        payload = {"id": transaction_id, "status": "completed"}
        requests.post("http://localhost:8000/transactions/internal/notify", json=payload)
        db.commit()
    except Exception as e:
        transaction.status = "failed"
        payload = {"id": transaction_id, "status": "failed"}
        requests.post("http://localhost:8000/transactions/internal/notify", json=payload)
        db.commit()

    finally:
        db.close()