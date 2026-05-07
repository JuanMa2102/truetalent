import os
from pathlib import Path
from dotenv import load_dotenv

# Apunta al .env en la raíz del proyecto (backend/.env)
load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env")

REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", 6379))
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
