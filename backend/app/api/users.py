from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from datetime import timedelta

from app.db.database import get_db
from app.models import models
from app.schemas import schemas
from app.services import services

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/register", response_model=schemas.UserResponse)
async def register(
    user: schemas.UserCreate, 
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """Регистрация нового пользователя с автоматической авторизацией"""
    
    # Проверка существующего username или email
    result = await db.execute(
        select(models.User).filter(
            or_(models.User.username == user.username, models.User.email == user.email)
        )
    )
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=400, 
            detail="Username or email already registered"
        )
    
    # Создаем пользователя
    hashed_password = services.get_password_hash(user.password)
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        city=user.city
    )
    
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Логируем регистрацию
    log = models.AuditLog(
        user_id=new_user.id, 
        action="register", 
        details=f"New user: {user.username}"
    )
    db.add(log)
    await db.commit()
    
    # ✅ Автоматически авторизуем (устанавливаем cookie)
    access_token = services.create_access_token(
        data={"sub": new_user.username},
        expires_delta=timedelta(minutes=services.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    services.set_auth_cookie(response, access_token)
    
    return new_user


@router.post("/login", response_model=schemas.UserResponse)
async def login(
    credentials: schemas.UserLogin,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """Вход по username или email"""
    
    user = await services.authenticate_user(
        db, 
        credentials.username_or_email, 
        credentials.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password"
        )
    
    # Логируем вход
    log = models.AuditLog(
        user_id=user.id, 
        action="login", 
        details=f"Login: {user.username}"
    )
    db.add(log)
    await db.commit()
    
    # ✅ Устанавливаем cookie
    access_token = services.create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=services.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    services.set_auth_cookie(response, access_token)
    
    return user


@router.post("/logout")
async def logout(response: Response):
    """Выход из системы (удаление cookie)"""
    services.remove_auth_cookie(response)
    return {"message": "Successfully logged out"}


@router.get("/me", response_model=schemas.UserResponse)
async def get_me(current_user: models.User = Depends(services.get_current_user)):
    """Информация о текущем пользователе"""
    return current_user
