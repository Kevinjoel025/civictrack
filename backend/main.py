from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
import logging
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, reports, departments, votes

Base.metadata.create_all(bind=engine)

app = FastAPI(title="CivicTrack API", version="1.0.0")

logger = logging.getLogger("uvicorn.error")


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    try:
        body = await request.body()
        logger.error("Validation error for request %s %s — body: %s — errors: %s", request.method, request.url, body.decode(errors='replace'), exc.errors())
    except Exception:
        logger.exception("Failed to log validation error body")
    return JSONResponse(status_code=422, content={"detail": exc.errors()})

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

app.include_router(auth.router,        prefix="/api/auth",        tags=["Auth"])
app.include_router(reports.router,     prefix="/api/reports",     tags=["Reports"])
app.include_router(departments.router, prefix="/api/departments", tags=["Departments"])
app.include_router(votes.router,       prefix="/api/votes",       tags=["Votes"])

@app.get("/")
def root(): return {"message": "CivicTrack API is running"}

@app.get("/health")
def health(): return {"status": "ok"}