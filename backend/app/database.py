"""Database configuration and session utilities."""
from __future__ import annotations

import os

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker


DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://fastapi:fastapi@db:3306/todos",
)

# Maintain a healthy connection pool when the DB restarts.
engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=3600)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    """Provide a SQLAlchemy session to request handlers."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
