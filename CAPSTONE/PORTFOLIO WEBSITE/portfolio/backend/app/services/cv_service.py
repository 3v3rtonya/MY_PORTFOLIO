from sqlalchemy.orm import Session
from app.models.orm import CVDownloadLog
from app.services import settings_service

def log_download(db: Session, ip: str, user_agent: str) -> CVDownloadLog:
    log = CVDownloadLog(ip_address=ip, user_agent=user_agent)
    db.add(log)
    db.commit()
    db.refresh(log)
    settings_service.create_notification(
        db, type_="cv_download",
        title="CV Downloaded",
        body=f"From IP: {ip}"
    )
    return log

def list_logs(db: Session) -> list[CVDownloadLog]:
    return db.query(CVDownloadLog).order_by(CVDownloadLog.downloaded_at.desc()).all()
