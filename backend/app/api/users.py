from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import User
from app.schemas.schemas import UserCreate, UserResponse
from passlib.context import CryptContext

router = APIRouter(prefix="/api/users", tags=["users"])


# Для хеширования паролей (позже добавим passlib)
# pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# ========== GET ENDPOINTS ==========

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(user_id: int, db: Session = Depends(get_db)):
    """Получить пользователя по ID"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/username/{username}", response_model=UserResponse)
async def get_user_by_username(username: str, db: Session = Depends(get_db)):
    """Получить пользователя по username"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


# ========== POST ENDPOINTS ==========

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(user_data: UserCreate, db: Session = Depends(get_db)):
    """Регистрация нового пользователя"""

    # Проверяем что username не занят
    existing_user = db.query(User).filter(User.username == user_data.username).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already registered")

    # Проверяем что email не занят
    existing_email = db.query(User).filter(User.email == user_data.email).first()
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Создаём нового пользователя
    # Пока без хеширования пароля (потом добавим)
    new_user = User(
        username=user_data.username,
        email=user_data.email,
        password_hash=user_data.password,  # TODO: хешировать пароль
        city=user_data.city
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


@router.post("/login")
async def login_user(username: str, password: str, db: Session = Depends(get_db)):
    """Логин пользователя"""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    # TODO: проверить пароль через хеш
    if user.password_hash != password:
        raise HTTPException(status_code=401, detail="Invalid username or password")

    return {
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "city": user.city,
        "message": "Login successful"
    }


# ========== PUT ENDPOINTS ==========

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
        user_id: int,
        username: str = None,
        email: str = None,
        city: str = None,
        db: Session = Depends(get_db)
):
    """Обновить профиль пользователя"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if username:
        user.username = username
    if email:
        user.email = email
    if city:
        user.city = city

    db.commit()
    db.refresh(user)
    return user


# ========== DELETE ENDPOINTS ==========

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(user_id: int, db: Session = Depends(get_db)):
    """Удалить пользователя"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()
