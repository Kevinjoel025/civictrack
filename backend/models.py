from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Enum, Text, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum

class RoleEnum(str, enum.Enum):
    citizen = "citizen"
    department = "department"
    admin = "admin"

class StatusEnum(str, enum.Enum):
    submitted = "submitted"
    assigned = "assigned"
    acknowledged = "acknowledged"
    in_progress = "in_progress"
    resolved = "resolved"
    rejected = "rejected"
    delayed = "delayed"

class PriorityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"

class IssueTypeEnum(str, enum.Enum):
    pothole = "pothole"
    garbage = "garbage"
    streetlight = "streetlight"
    drainage = "drainage"
    other = "other"

class User(Base):
    __tablename__ = "users"
    id              = Column(Integer, primary_key=True, index=True)
    name            = Column(String(100), nullable=False)
    email           = Column(String(200), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role            = Column(Enum(RoleEnum), default=RoleEnum.citizen)
    ward            = Column(String(100), nullable=True)
    created_at      = Column(DateTime(timezone=True), server_default=func.now())
    is_active       = Column(Boolean, default=True)
    reports         = relationship("Report", back_populates="user")
    votes           = relationship("Vote", back_populates="user")

class Department(Base):
    __tablename__ = "departments"
    id                    = Column(Integer, primary_key=True, index=True)
    name                  = Column(String(200), nullable=False)
    contact_email         = Column(String(200), nullable=True)
    ward                  = Column(String(100), nullable=True)
    supported_issue_types = Column(String(500), nullable=True)
    reports               = relationship("Report", back_populates="department")

class Report(Base):
    __tablename__ = "reports"
    id             = Column(Integer, primary_key=True, index=True)
    title          = Column(String(200), nullable=False)
    description    = Column(Text, nullable=False)
    image_url      = Column(String(500), nullable=True)
    issue_type     = Column(Enum(IssueTypeEnum), nullable=False)
    latitude       = Column(Float, nullable=False)
    longitude      = Column(Float, nullable=False)
    address        = Column(String(500), nullable=True)
    status         = Column(Enum(StatusEnum), default=StatusEnum.submitted)
    priority       = Column(Enum(PriorityEnum), default=PriorityEnum.low)
    priority_score = Column(Float, default=0.0)
    upvote_count   = Column(Integer, default=0)
    is_duplicate   = Column(Boolean, default=False)
    is_hotspot     = Column(Boolean, default=False)
    sla_deadline   = Column(DateTime(timezone=True), nullable=True)
    created_at     = Column(DateTime(timezone=True), server_default=func.now())
    updated_at     = Column(DateTime(timezone=True), onupdate=func.now())
    user_id        = Column(Integer, ForeignKey("users.id"))
    department_id  = Column(Integer, ForeignKey("departments.id"), nullable=True)
    user           = relationship("User", back_populates="reports")
    department     = relationship("Department", back_populates="reports")
    votes          = relationship("Vote", back_populates="report")
    status_history = relationship("StatusHistory", back_populates="report")

class Vote(Base):
    __tablename__ = "votes"
    id         = Column(Integer, primary_key=True, index=True)
    user_id    = Column(Integer, ForeignKey("users.id"))
    report_id  = Column(Integer, ForeignKey("reports.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    user       = relationship("User", back_populates="votes")
    report     = relationship("Report", back_populates="votes")

class StatusHistory(Base):
    __tablename__ = "status_history"
    id         = Column(Integer, primary_key=True, index=True)
    report_id  = Column(Integer, ForeignKey("reports.id"))
    old_status = Column(Enum(StatusEnum), nullable=True)
    new_status = Column(Enum(StatusEnum), nullable=False)
    remark     = Column(Text, nullable=True)
    changed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    timestamp  = Column(DateTime(timezone=True), server_default=func.now())
    report     = relationship("Report", back_populates="status_history")