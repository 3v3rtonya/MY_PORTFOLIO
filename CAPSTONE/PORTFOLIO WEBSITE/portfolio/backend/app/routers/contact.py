import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.core.rate_limiter import limiter
from app.database import get_db
from app.schemas.schemas import ContactMessageCreate, ContactMessageResponse
from app.services import contact_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1", tags=["Contact"])


@router.post("/contact", response_model=ContactMessageResponse)
@limiter.limit("10/minute")
def submit_contact(request: Request, body: ContactMessageCreate, db: Session = Depends(get_db)) -> ContactMessageResponse:
    """Submit a contact message. Rate limited to 10 requests per minute per IP."""
    try:
        return contact_service.create_message(db, body)
    except Exception as exc:
        logger.error("Contact DB write failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=500, detail={"error": "Database error"})
