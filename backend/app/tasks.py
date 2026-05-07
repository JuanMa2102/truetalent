import time
import requests

from .database import SessionLocal
from .models import Transaction

async def process_transactions(transaction_id: int):
    API_URL = "https://truetalent.onrender.com/transactions/internal/update-status"
    try:
        print(f"Procesando transacción {transaction_id}")
        payload = {"id": transaction_id, "status": "processing"}
        requests.post(API_URL, json=payload)
        
        time.sleep(5)
        payload = {"id": transaction_id, "status": "completed"}
        requests.post(API_URL, json=payload)
    except Exception as e:
        payload = {"id": transaction_id, "status": "failed"}
        requests.post(API_URL, json=payload)