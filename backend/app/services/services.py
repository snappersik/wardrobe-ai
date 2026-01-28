from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import Depends, HTTPException, status, Request, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_

from ..models.models import User
from ..db.database import get_db, settings

# Настройки для JWT
SECRET_KEY = settings.SECRET_KEY
ALGORITHM = settings.ALGORITHM
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES
COOKIE_NAME = "wardrobe_access_token"

# Хеширование паролей
ph = PasswordHasher()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Проверяет совпадение пароля c хешем"""
    try:
        ph.verify(hashed_password, plain_password)
        return True
    except VerifyMismatchError:
        return False


def get_password_hash(password: str) -> str:
    """Хеширует пароль"""
    return ph.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Создает JWT токен"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def set_auth_cookie(response: Response, token: str):
    """Устанавливает cookie c JWT токеном"""
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        httponly=True,  # Защита от XSS
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,  # В секундах
        samesite="lax",  # Защита от CSRF
        secure=False  # True в production (HTTPS)
    )


def remove_auth_cookie(response: Response):
    """Удаляет cookie (logout)"""
    response.delete_cookie(key=COOKIE_NAME)


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> User:
    """Извлекает текущего пользователя из cookie"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
    )
    
    # Читаем токен из cookie
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise credentials_exception
    
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_identifier: str = payload.get("sub")  # username или email
        if user_identifier is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    
    # Ищем пользователя по username или email
    result = await db.execute(
        select(User).filter(
            or_(User.username == user_identifier, User.email == user_identifier)
        )
    )
    user = result.scalar_one_or_none()
    if user is None:
        raise credentials_exception
    return user


async def authenticate_user(db: AsyncSession, username_or_email: str, password: str) -> Optional[User]:
    """Проверяет учетные данные (username или email)"""
    result = await db.execute(
        select(User).filter(
            or_(User.username == username_or_email, User.email == username_or_email)
        )
    )
    user = result.scalar_one_or_none()
    
    if not user or not verify_password(password, user.hashed_password):
        return None
    return user
