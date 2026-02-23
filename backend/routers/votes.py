from fastapi import APIRouter, Depends, HTTPException
import logging
from sqlalchemy.orm import Session
from database import get_db
from auth import get_current_user
import models, schemas, services

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/{report_id}", response_model=schemas.VoteOut, status_code=201)
def vote(report_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if not report: raise HTTPException(status_code=404, detail="Not found")
    if db.query(models.Vote).filter(models.Vote.user_id == current_user.id, models.Vote.report_id == report_id).first():
        raise HTTPException(status_code=400, detail="Already voted")
    try:
        vote = models.Vote(user_id=current_user.id, report_id=report_id)
        db.add(vote)
        # increment upvote_count and recalculate priority
        report.upvote_count = (report.upvote_count or 0) + 1
        report.priority_score = services.compute_priority_score(report.upvote_count, report.created_at)
        report.priority = services.score_to_label(report.priority_score)
        db.commit()
        db.refresh(vote)
        db.refresh(report)
        return vote
    except Exception as e:
        db.rollback()
        logger.exception("Error while casting vote for report %s by user %s", report_id, current_user.id)
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=500, content={"detail": str(e), "type": type(e).__name__})

@router.delete("/{report_id}", status_code=204)
def unvote(report_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    vote = db.query(models.Vote).filter(models.Vote.user_id == current_user.id, models.Vote.report_id == report_id).first()
    if not vote: raise HTTPException(status_code=404, detail="Vote not found")
    report = db.query(models.Report).filter(models.Report.id == report_id).first()
    if report and report.upvote_count > 0:
        report.upvote_count -= 1
        report.priority_score = services.compute_priority_score(report.upvote_count, report.created_at)
        report.priority = services.score_to_label(report.priority_score)
    db.delete(vote); db.commit()