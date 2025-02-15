from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# 如果环境变量中未设置 DATABASE_URL，则默认使用 SQLite 数据库
DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./chat_history.db")

engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()