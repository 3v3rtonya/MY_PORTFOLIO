from typing import Optional
from sqlalchemy.orm import Session
from app.models.orm import Project
from app.schemas.schemas import ProjectCreate


def list_projects(db: Session) -> list[Project]:
    return db.query(Project).order_by(Project.created_at.desc()).all()


def get_project(db: Session, project_id: int) -> Optional[Project]:
    return db.query(Project).filter(Project.id == project_id).first()


def create_project(db: Session, data: ProjectCreate) -> Project:
    project = Project(**data.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


def update_project(db: Session, project_id: int, data: ProjectCreate) -> Optional[Project]:
    project = get_project(db, project_id)
    if project is None:
        return None
    for field, value in data.model_dump().items():
        setattr(project, field, value)
    db.commit()
    db.refresh(project)
    return project


def delete_project(db: Session, project_id: int) -> bool:
    project = get_project(db, project_id)
    if project is None:
        return False
    db.delete(project)
    db.commit()
    return True
