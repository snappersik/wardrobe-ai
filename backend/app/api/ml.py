from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.database import get_db
from app.models.ml import MLTrainingJob
import uuid

router = APIRouter(prefix="/ml", tags=["Machine Learning"])

@router.post("/train")
async def start_training_job(db: AsyncSession = Depends(get_db)):
    """
    Start a new ML training job.
    """
    job = MLTrainingJob(status="PENDING")
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return {"job_id": job.id, "status": job.status}

@router.get("/jobs")
async def list_training_jobs(skip: int = 0, limit: int = 10, db: AsyncSession = Depends(get_db)):
    """
    List all ML training jobs.
    """
    result = await db.execute(select(MLTrainingJob).order_by(MLTrainingJob.start_time.desc()).offset(skip).limit(limit))
    jobs = result.scalars().all()
    return jobs

@router.get("/jobs/{job_id}")
async def get_training_job(job_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    """
    Get status of a specific training job.
    """
    result = await db.execute(select(MLTrainingJob).filter(MLTrainingJob.id == job_id))
    job = result.scalar_one_or_none()
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
