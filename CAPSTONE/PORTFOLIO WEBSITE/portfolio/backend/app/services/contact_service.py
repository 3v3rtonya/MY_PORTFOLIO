from typing import Optional
from sqlalchemy.orm import Session
from app.models.orm import ContactMessage
from app.schemas.schemas import ContactMessageCreate
from app.services import settings_service

def create_message(db: Session, payload: ContactMessageCreate) -> ContactMessage:
    msg = ContactMessage(**payload.model_dump())
    db.add(msg)
    db.commit()
    db.refresh(msg)
    # Notify admin
    settings_service.create_notification(
        db, type_="message",
        title=f"New message from {msg.name}",
        body=f"Subject: {msg.subject}"
    )
    return msg

def list_messages(db: Session) -> list[ContactMessage]:
    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()

def get_message(db: Session, message_id: int) -> Optional[ContactMessage]:
    return db.query(ContactMessage).filter(ContactMessage.id == message_id).first()

def mark_read(db: Session, message_id: int, is_read: bool) -> Optional[ContactMessage]:
    msg = get_message(db, message_id)
    if msg is None:
        return None
    msg.is_read = is_read
    db.commit()
    db.refresh(msg)
    return msg
