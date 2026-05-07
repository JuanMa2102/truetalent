from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from fastapi.exceptions import RequestValidationError
from .exceptions import DatabaseConnectionError

def setup_exception_handlers(app: FastAPI):
    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_exception_handler(request, exc):
        return JSONResponse(
            status_code=500,
            content={
                "message": "Error de configuracion en el servidor de datos ",
                "success": False,
                "details": str(exc)
            },
        )

    @app.exception_handler(DatabaseConnectionError)
    async def database_connection_exception_handler(request, exc):
        return JSONResponse(
            status_code=500,
            content={
                "message": "Error de conexión a la base de datos. Por favor, inténtelo de nuevo más tarde.",
                "success": False,
            },
        )