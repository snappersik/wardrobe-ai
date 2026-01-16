from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import Feedback, Outfit, User
from app.schemas.schemas import FeedbackCreate, FeedbackResponse
from typing import List

router = APIRouter(prefix="/api/feedback", tags=["feedback"])


@router.get("/outfit/{outfit_id}", response_model=List[FeedbackResponse])
async def get_outfit_feedback(outfit_id: int, db: Session = Depends(get_db)):
    """Получить все отзывы об образе"""
    feedbacks = db.query(Feedback).filter(Feedback.outfit_id == outfit_id).all()
    return feedbacks


@router.get("/user/{user_id}", response_model=List[FeedbackResponse])
async def get_user_feedback(user_id: int, db: Session = Depends(get_db)):
    """Получить все отзывы пользователя"""
    feedbacks = db.query(Feedback).filter(Feedback.user_id == user_id).all()
    return feedbacks


@router.post("/", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def create_feedback(
        user_id: int,
        feedback_data: FeedbackCreate,
        db: Session = Depends(get_db)
):
    """Создать отзыв (лайк/дизлайк)"""

    # Проверяем что пользователь существует
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Проверяем что образ существует
    outfit = db.query(Outfit).filter(Outfit.id == feedback_data.outfit_id).first()
    if not outfit:
        raise HTTPException(status_code=404, detail="Outfit not found")

    # Создаём отзыв
    feedback = Feedback(
        user_id=user_id,
        outfit_id=feedback_data.outfit_id,
        is_liked=feedback_data.is_liked,
        comment=feedback_data.comment
    )

    db.add(feedback)
    db.commit()
    db.refresh(feedback)

    return feedback


@router.delete("/{feedback_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_feedback(feedback_id: int, db: Session = Depends(get_db)):
    """Удалить отзыв"""
    feedback = db.query(Feedback).filter(Feedback.id == feedback_id).first()
    if not feedback:
        raise HTTPException(status_code=404, detail="Feedback not found")

    db.delete(feedback)
    db.commit()
