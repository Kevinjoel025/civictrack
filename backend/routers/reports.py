from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from auth import get_current_user
import models, schemas, services

router = APIRouter()

@router.post("/", response_model=schemas.ReportOut, status_code=201)
def create_report(payload: schemas.ReportCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    dept = services.assign_department(payload.issue_type, db)
    report = models.Report(
        **payload.model_dump(), user_id=current_user.id,
        department_id=dept.id if dept else None,
        status=models.StatusEnum.assigned if dept else models.StatusEnum.submitted,
        sla_deadline=services.get_sla_deadline(payload.issue_type),
    )
    db.add(report); db.commit(); db.refresh(report)
    db.add(models.StatusHistory(report_id=report.id, old_status=None, new_status=report.status, remark="Auto-assigned", changed_by=current_user.id))
    db.commit(); db.refresh(report)
    return report

@router.get("/", response_model=List[schemas.ReportOut])
def list_reports(issue_type: Optional[str] = Query(None), status: Optional[str] = Query(None), skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    q = db.query(models.Report)
    if issue_type: q = q.filter(models.Report.issue_type == issue_type)
    if status:     q = q.filter(models.Report.status == status)
    return q.order_by(models.Report.created_at.desc()).offset(skip).limit(limit).all()

@router.get("/my", response_model=List[schemas.ReportOut])
def my_reports(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Report).filter(models.Report.user_id == current_user.id).order_by(models.Report.created_at.desc()).all()

@router.get("/{report_id}", response_model=schemas.ReportOut)
def get_report(report_id: int, db: Session = Depends(get_db)):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report: raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.patch("/{report_id}/status", response_model=schemas.ReportOut)
def update_status(report_id: int, payload: schemas.ReportUpdate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report: raise HTTPException(status_code=404, detail="Not found")
    if current_user.role not in [models.RoleEnum.department, models.RoleEnum.admin]:
        raise HTTPException(status_code=403, detail="Not authorized")
    old = report.status
    if payload.status: report.status = payload.status
    report.priority_score = services.compute_priority_score(report.upvote_count, report.created_at)
    report.priority = services.score_to_label(report.priority_score)
    db.add(models.StatusHistory(report_id=report.id, old_status=old, new_status=report.status, remark=payload.remark, changed_by=current_user.id))
    db.commit(); db.refresh(report)
    return report