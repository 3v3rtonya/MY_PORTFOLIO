from typing import List
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.rate_limiter import limiter
from app.database import get_db
from app.models.orm import SiteMedia
from app.schemas.schemas import SocialLinksResponse, SiteMediaResponse
from app.services import settings_service

router = APIRouter(prefix="/api/v1", tags=["Settings"])


@router.get("/settings/social", response_model=SocialLinksResponse)
@limiter.limit("60/minute")
def public_social_links(request: Request, db: Session = Depends(get_db)) -> SocialLinksResponse:
    """Public endpoint — returns social links and photo URL for the frontend."""
    return settings_service.get_social_links(db)


@router.get("/settings/media/{category}", response_model=List[SiteMediaResponse])
@limiter.limit("60/minute")
def public_media_by_category(request: Request, category: str, db: Session = Depends(get_db)) -> List[SiteMediaResponse]:
    """Public endpoint — returns site media items by category ordered by order_index."""
    return (
        db.query(SiteMedia)
        .filter(SiteMedia.category == category)
        .order_by(SiteMedia.order_index)
        .all()
    )
