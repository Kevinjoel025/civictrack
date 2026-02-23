from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.DepartmentOut])
def list_departments(db: Session = Depends(get_db)):
    return db.query(models.Department).all()

@router.get("/{dept_id}/reports", response_model=List[schemas.ReportOut])
def dept_reports(dept_id: int, db: Session = Depends(get_db)):
    return db.query(models.Report).filter(models.Report.department_id == dept_id).order_by(models.Report.priority_score.desc()).all()