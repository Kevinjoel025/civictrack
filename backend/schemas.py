from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from models import RoleEnum, StatusEnum, PriorityEnum, IssueTypeEnum

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    ward: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: RoleEnum
    ward: Optional[str]
    created_at: datetime
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

class DepartmentOut(BaseModel):
    id: int
    name: str
    contact_email: Optional[str]
    ward: Optional[str]
    supported_issue_types: Optional[str]
    class Config:
        from_attributes = True

class ReportCreate(BaseModel):
    title: str
    description: str
    issue_type: IssueTypeEnum
    latitude: float
    longitude: float
    address: Optional[str] = None
    image_url: Optional[str] = None

class ReportUpdate(BaseModel):
    status: Optional[StatusEnum] = None
    remark: Optional[str] = None

class StatusHistoryOut(BaseModel):
    id: int
    old_status: Optional[StatusEnum]
    new_status: StatusEnum
    remark: Optional[str]
    timestamp: datetime
    class Config:
        from_attributes = True

class ReportOut(BaseModel):
    id: int
    title: str
    description: str
    image_url: Optional[str]
    issue_type: IssueTypeEnum
    latitude: float
    longitude: float
    address: Optional[str]
    status: StatusEnum
    priority: PriorityEnum
    priority_score: float
    upvote_count: int
    is_duplicate: bool
    is_hotspot: bool
    sla_deadline: Optional[datetime]
    created_at: datetime
    user_id: int
    department_id: Optional[int]
    department: Optional[DepartmentOut]
    status_history: List[StatusHistoryOut] = []
    class Config:
        from_attributes = True

class VoteOut(BaseModel):
    id: int
    user_id: int
    report_id: int
    created_at: datetime
    class Config:
        from_attributes = True