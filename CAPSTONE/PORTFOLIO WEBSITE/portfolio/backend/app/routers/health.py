from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.core.rate_limiter import limiter
from app.database import get_db

router = APIRouter(tags=["Health"])


@router.get("/health")
@limiter.limit("120/minute")
def health_check(request: Request, db: Session = Depends(get_db)) -> JSONResponse:
    """Health probe — checks database connectivity."""
    try:
        db.execute(text("SELECT 1"))
        return JSONResponse(status_code=200, content={"status": "ok"})
    except Exception:
        return JSONResponse(status_code=503, content={"status": "unavailable", "error": "Database unreachable"})
