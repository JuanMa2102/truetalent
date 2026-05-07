from fastapi import FastAPI
from .database import Base, engine, SessionLocal
from .errors import setup_exception_handlers
from .router import transactions
from .tasks import process_transactions
from redis import Redis
from rq import Queue
from fastapi.middleware.cors import CORSMiddleware
from . import models
from fastapi import Depends, HTTPException


Base.metadata.create_all(bind=engine)
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # En producción usa ["http://localhost:5173"]
    allow_methods=["*"],
    allow_headers=["*"],
)


reddis_conn = Redis(host='localhost', port=6379)
queue = Queue(connection=reddis_conn)
setup_exception_handlers(app)

#registro de rutas
app.include_router(transactions.router)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
@app.post("/assistant/summarize")
async def summarize(data: dict, db = Depends(get_db)):
    text = data.get("text", "")
    if not text:
        raise HTTPException(status_code=400, detail="Texto requerido")

    # Simulación de respuesta de OpenAI [cite: 32, 33]
    summary_text = f"Resumen generado por IA: {text[:100]}..." 

    # Registrar en BD [cite: 34]
    new_query = models.AIQuery(input_text=text, summary=summary_text)
    db.add(new_query)
    db.commit()

    return {"summary": summary_text}