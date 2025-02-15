from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from .database import Base

class ChatHistory(Base):
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(String, index=True, nullable=False)
    user_message = Column(Text, nullable=False)
    assistant_reply = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)