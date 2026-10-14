import logging
import os
from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import FileResponse, RedirectResponse
from sqlalchemy.orm import Session

from app.core.rate_limiter import limiter
from app.database import get_db
from app.services import cv_service, settings_service
from app.services import storage_service as storage

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1", tags=["CV"])

CV_KEY = "Everton_Anyiro_CV.pdf"
CV_FILENAME = "Everton_Anyiro_CV.pdf"

# Local fallback path (used when R2 is not configured)
_LOCAL_CV = os.path.join(os.path.dirname(__file__), "..", "..", "static", CV_KEY)


@router.get("/cv/download")
@limiter.limit("20/minute")
def download_cv(request: Request, db: Session = Depends(get_db)):
    """
    Download the CV PDF.

    • When Cloudflare R2 is configured, redirects the browser directly to the
      R2 public URL (no proxy traffic through Fly.io).
    • Falls back to streaming the local file when R2 is absent (dev mode).
    """
    ip         = request.client.host if request.client else "unknown"
    user_agent = request.headers.get("user-agent", "unknown")

    # Log the download (non-fatal if DB write fails)
    try:
        cv_service.log_download(db, ip=ip, user_agent=user_agent)
    except Exception as exc:
        logger.error("CV log write failed: %s", exc, exc_info=True)

    # Determine where the CV lives
    cv_url = settings_service.get_setting(db, "cv_path") or ""

    if cv_url and cv_url.startswith("http"):
        # R2 public URL — redirect browser directly
        return RedirectResponse(url=cv_url, status_code=302)

    # Local fallback
    local = _LOCAL_CV
    if not os.path.isfile(local):
        raise HTTPException(status_code=404, detail={"error": "CV file not available. Upload it via the admin dashboard."})

    return FileResponse(
        path=local,
        media_type="application/pdf",
        filename=CV_FILENAME,
        headers={"Content-Disposition": f'attachment; filename="{CV_FILENAME}"'},
    )
