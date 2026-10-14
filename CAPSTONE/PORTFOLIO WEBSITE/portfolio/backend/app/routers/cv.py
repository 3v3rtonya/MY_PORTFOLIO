import logging
import os
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.rate_limiter import limiter
from app.database import get_db
from app.services import cv_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1", tags=["CV"])
settings = get_settings()
CV_FILENAME = "Everton_Anyiro_CV.pdf"


@router.get("/cv/download")
@limiter.limit("20/minute")
def download_cv(request: Request, db: Session = Depends(get_db)) -> FileResponse:
    """Download the CV PDF. Rate limited to 20 requests per minute per IP."""
    cv_path = settings.cv_file_path
    if not os.path.isfile(cv_path):
        raise HTTPException(status_code=404, detail={"error": "CV file not available"})
    ip = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")
    try:
        cv_service.log_download(db, ip=ip, user_agent=user_agent)
    except Exception as exc:
        logger.error("CV log write failed: %s", exc, exc_info=True)
        raise HTTPException(status_code=503, detail={"error": "Download could not be recorded"})
    return FileResponse(
        path=cv_path, media_type="application/pdf", filename=CV_FILENAME,
        headers={"Content-Disposition": f'attachment; filename="{CV_FILENAME}"'},
    )
