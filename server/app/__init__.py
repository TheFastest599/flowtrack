from fastapi import FastAPI
from sqlalchemy import create_engine  # Sync engine for DDL
from .models import Base
from .core.config import settings

# def create_app() -> FastAPI:
#     app = FastAPI(title=settings.APP_NAME, version=settings.VERSION)

#     # Create tables using a sync engine (DDL only)
#     sync_engine = create_engine(settings.DATABASE_URL.replace("asyncpg", "psycopg2"))
#     Base.metadata.create_all(bind=sync_engine)
#     sync_engine.dispose()

#     return app

# app = create_app()