from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
import models

SLA_HOURS = {
    "pothole": 72, "garbage": 24, "streetlight": 48, "drainage": 48, "other": 96,
}

ISSUE_DEPARTMENT_MAP = {
    "pothole": "Road Maintenance", "garbage": "Sanitation",
    "streetlight": "Electrical",   "drainage": "Water & Sewer", "other": "General Services",
}

def assign_department(issue_type: str, db: Session):
    dept_name = ISSUE_DEPARTMENT_MAP.get(issue_type, "General Services")
    return db.query(models.Department).filter(models.Department.name == dept_name).first()

def get_sla_deadline(issue_type: str) -> datetime:
    return datetime.now(timezone.utc) + timedelta(hours=SLA_HOURS.get(issue_type, 96))

def compute_priority_score(upvotes: int, created_at: datetime) -> float:
    # created_at may be None in some edge cases; fall back to now to avoid errors
    if not created_at:
        created_at = datetime.now(timezone.utc)
    # ensure both datetimes are timezone-aware (UTC) for subtraction
    now = datetime.now(timezone.utc)
    if created_at.tzinfo is None:
        created_at = created_at.replace(tzinfo=timezone.utc)
    age_hours = max((now - created_at).total_seconds() / 3600, 0.5)
    return round((upvotes * 10) / age_hours, 2)

def score_to_label(score: float) -> str:
    if score >= 20: return "high"
    elif score >= 5: return "medium"
    return "low"

def seed_departments(db: Session):
    defaults = [
        {"name": "Road Maintenance",  "contact_email": "roads@letsfix.gov",     "supported_issue_types": "pothole"},
        {"name": "Sanitation",        "contact_email": "sanitation@letsfix.gov","supported_issue_types": "garbage"},
        {"name": "Electrical",        "contact_email": "electrical@letsfix.gov","supported_issue_types": "streetlight"},
        {"name": "Water & Sewer",     "contact_email": "water@letsfix.gov",     "supported_issue_types": "drainage"},
        {"name": "General Services",  "contact_email": "general@letsfix.gov",   "supported_issue_types": "other"},
    ]
    for d in defaults:
        if not db.query(models.Department).filter(models.Department.name == d["name"]).first():
            db.add(models.Department(**d))
    db.commit()