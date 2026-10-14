from typing import List
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.core.rate_limiter import limiter
from app.database import get_db
from app.schemas.schemas import ProjectResponse
from app.services import project_service

router = APIRouter(prefix="/api/v1", tags=["Projects"])


@router.get("/projects", response_model=List[ProjectResponse])
@limiter.limit("60/minute")
def list_projects(request: Request, db: Session = Depends(get_db)) -> List[ProjectResponse]:
    """Return all projects ordered by creation date."""
    return project_service.list_projects(db)
