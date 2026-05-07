# Prueba Técnica TrueTalent
## Tecnologías utilizadas

### Backend

* FastAPI
* SQLAlchemy
* Redis
* RQ
* WebSockets

### Frontend

* React
* Vite

### Automatización

* Playwright

---

# Arquitectura

La solución está dividida en:

* API transaccional
* procesamiento asíncrono mediante Redis + RQ
* worker independiente
* frontend React
* WebSockets para actualización en tiempo real
* automatización RPA
---

# Requisitos

* Python 3.10+
* Node.js 18+
* Redis
* Docker (opcional)

---

# Configuración Backend

## 1. Entrar a backend

```bash
cd backend
```

## 2. Crear entorno virtual

### Linux / Mac

```bash
python3 -m venv venv
source venv/bin/activate
```

### Windows

```powershell
python -m venv venv
venv\Scripts\activate
```

---

## 3. Instalar dependencias

```bash
pip install -r requirements.txt
```

---

## 4. Configurar variables de entorno

Crear archivo `.env`

```env
REDIS_URL=redis://localhost:6379
```

---

## 5. Levantar API

```bash
uvicorn app.main:app --reload
```

Backend disponible en:

```text
http://localhost:8000
```

Swagger:

```text
http://localhost:8000/docs
```

---

# Configuración Redis

## Docker

```bash
docker run -d -p 6379:6379 redis
```

---

# Configuración Worker

En otra terminal:

```bash
cd backend
python -m app.worker
```

---

# Configuración Frontend

## 1. Entrar a frontend

```bash
cd frontend
```

---

## 2. Instalar dependencias

```bash
npm install
```

---

## 3. Ejecutar frontend

```bash
npm run dev
```

Frontend disponible en:

```text
http://localhost:5173
```

---

# Ejecutar RPA

Entrar a carpeta RPA:

```bash
cd app
```

Instalar dependencias:

```bash
pip install playwright
playwright install
```

Ejecutar script:

```bash
python rpa_script.py
```

---

# Deploy

## Backend

* Render

## Frontend

* Vercel

## Redis

* Render
---

# Funcionalidades

* creación de transacciones
* procesamiento asíncrono
* WebSockets en tiempo real
* arquitectura desacoplada
