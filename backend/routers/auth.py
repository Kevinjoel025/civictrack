from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from services import seed_departments
import models, schemas, auth as auth_utils

router = APIRouter()

@router.post("/signup", response_model=schemas.TokenResponse, status_code=201)
def signup(payload: schemas.UserCreate, db: Session = Depends(get_db)):
    seed_departments(db)
    if db.query(models.User).filter(models.User.email == payload.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")
    user = models.User(
        name=payload.name, email=payload.email,
        hashed_password=auth_utils.hash_password(payload.password),
        ward=payload.ward, role=models.RoleEnum.citizen,
    )
    db.add(user); db.commit(); db.refresh(user)
    token = auth_utils.create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "user": user}

@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == payload.email).first()
    if not user or not auth_utils.verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = auth_utils.create_access_token({"sub": str(user.id), "role": user.role})
    return {"access_token": token, "user": user}

@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(auth_utils.get_current_user)):
    return current_user