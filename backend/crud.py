from sqlalchemy.orm import Session
from typing import Optional
from . import models

def create_chat_history(db: Session, conversation_id: str, user_message: str, assistant_reply: str) -> models.ChatHistory:
    chat_history = models.ChatHistory(
        conversation_id=conversation_id,
        user_message=user_message,
        assistant_reply=assistant_reply
    )
    db.add(chat_history)
    db.commit()
    db.refresh(chat_history)
    return chat_history

def get_chat_history(db: Session, conversation_id: Optional[str] = None):
    query = db.query(models.ChatHistory)
    if conversation_id:
        query = query.filter(models.ChatHistory.conversation_id == conversation_id)
    return query.order_by(models.ChatHistory.timestamp).all()