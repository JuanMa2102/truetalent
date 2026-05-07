# exceptions.py
class DatabaseConnectionError(Exception):
    """Excepción lanzada cuando hay un fallo crítico en la base de datos."""
    def __init__(self, message: str):
        self.message = message