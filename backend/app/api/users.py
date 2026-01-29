# =============================================================================
# API РОУТЕР: ПОЛЬЗОВАТЕЛИ (users.py)
# =============================================================================
# Этот модуль содержит эндпоинты для работы с пользователями:
# - Регистрация новых пользователей
# - Авторизация (вход в систему)
# - Выход из системы (logout)
# - Получение информации о текущем пользователе
# =============================================================================

# Импорт компонентов FastAPI
from fastapi import APIRouter, Depends, HTTPException, Response, status

# Асинхронная сессия SQLAlchemy
from sqlalchemy.ext.asyncio import AsyncSession

# SQL операции: SELECT и OR
from sqlalchemy import select, or_

# Работа с временными интервалами
from datetime import timedelta

# Импорт зависимости для получения сессии БД
from app.db.database import get_db

# Импорт моделей базы данных
from app.models import models

# Импорт Pydantic схем для валидации
from app.schemas import schemas

# Импорт сервисов авторизации (хеширование, JWT, cookies)
from app.services import services

# =============================================================================
# СОЗДАНИЕ РОУТЕРА
# =============================================================================
# APIRouter группирует связанные эндпоинты.
# prefix="/users" - все маршруты начинаются с /api/users
# tags=["Users"] - группировка в Swagger документации
router = APIRouter(prefix="/users", tags=["Users"])


# =============================================================================
# ЭНДПОИНТ: РЕГИСТРАЦИЯ НОВОГО ПОЛЬЗОВАТЕЛЯ
# =============================================================================
@router.post("/register", response_model=schemas.UserResponse)
async def register(
    user: schemas.UserCreate,       # Данные для регистрации (из тела запроса)
    response: Response,             # Объект ответа (для установки cookie)
    db: AsyncSession = Depends(get_db)  # Сессия базы данных
):
    """
    Регистрация нового пользователя с автоматической авторизацией.
    
    Алгоритм:
    1. Проверяем что username и email не заняты
    2. Хешируем пароль с помощью Argon2
    3. Создаём пользователя в базе данных
    4. Записываем в лог аудита
    5. Создаём JWT токен и устанавливаем cookie
    6. Возвращаем данные пользователя
    
    Args:
        user: Данные для регистрации (username, email, password, full_name, city)
        response: HTTP Response для установки cookie
        db: Сессия базы данных
    
    Returns:
        UserResponse: Данные созданного пользователя
    
    Raises:
        HTTPException 400: Если username или email уже заняты
    
    Пример запроса:
        POST /api/users/register
        {
            "username": "john_doe",
            "email": "john@example.com",
            "password": "secure_password_123",
            "full_name": "John Doe",
            "city": "Moscow"
        }
    """
    
    # Шаг 1: Проверяем не занят ли username или email
    result = await db.execute(
        select(models.User).filter(
            or_(models.User.username == user.username, models.User.email == user.email)
        )
    )
    
    # Если пользователь с таким username/email уже есть - ошибка
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=400, 
            detail="Username or email already registered"
        )
    
    # Шаг 2: Хешируем пароль (НИКОГДА не храним пароли в открытом виде!)
    hashed_password = services.get_password_hash(user.password)
    
    # Шаг 3: Создаём нового пользователя
    new_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        city=user.city
    )
    
    # Добавляем пользователя в базу данных
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)  # Обновляем объект чтобы получить id и created_at
    
    # Шаг 4: Записываем в лог аудита (журнал действий)
    log = models.AuditLog(
        user_id=new_user.id, 
        action="register",  # Тип действия: регистрация
        details=f"New user: {user.username}"
    )
    db.add(log)
    await db.commit()
    
    # Шаг 5: Автоматически авторизуем пользователя (устанавливаем JWT cookie)
    access_token = services.create_access_token(
        data={"sub": new_user.username},  # sub = subject (идентификатор)
        expires_delta=timedelta(minutes=services.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    services.set_auth_cookie(response, access_token)
    
    # Шаг 6: Возвращаем данные пользователя
    return new_user


# =============================================================================
# ЭНДПОИНТ: АВТОРИЗАЦИЯ (ВХОД В СИСТЕМУ)
# =============================================================================
@router.post("/login", response_model=schemas.UserResponse)
async def login(
    credentials: schemas.UserLogin,  # Данные для входа (username/email + password)
    response: Response,              # Объект ответа (для cookie)
    db: AsyncSession = Depends(get_db)
):
    """
    Вход в систему по username или email.
    
    Алгоритм:
    1. Проверяем учётные данные (ищем пользователя, сверяем пароль)
    2. Записываем вход в лог аудита
    3. Создаём JWT токен и устанавливаем cookie
    4. Возвращаем данные пользователя
    
    Args:
        credentials: Логин/email и пароль
        response: HTTP Response для установки cookie
        db: Сессия базы данных
    
    Returns:
        UserResponse: Данные пользователя
    
    Raises:
        HTTPException 401: Неверный логин/email или пароль
    
    Пример запроса:
        POST /api/users/login
        {
            "username_or_email": "john@example.com",
            "password": "secure_password_123"
        }
    """
    
    # Шаг 1: Проверяем учётные данные
    user = await services.authenticate_user(
        db, 
        credentials.username_or_email, 
        credentials.password
    )
    
    # Если пользователь не найден или пароль неверный
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username/email or password"
        )
    
    # Шаг 2: Записываем вход в лог аудита
    log = models.AuditLog(
        user_id=user.id, 
        action="login",  # Тип действия: вход
        details=f"Login: {user.username}"
    )
    db.add(log)
    await db.commit()
    
    # Шаг 3: Создаём JWT токен и устанавливаем cookie
    access_token = services.create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=services.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    services.set_auth_cookie(response, access_token)
    
    # Шаг 4: Возвращаем данные пользователя
    return user


# =============================================================================
# ЭНДПОИНТ: ВЫХОД ИЗ СИСТЕМЫ (LOGOUT)
# =============================================================================
@router.post("/logout")
async def logout(response: Response):
    """
    Выход из системы (удаление cookie авторизации).
    
    Удаляет JWT cookie из браузера пользователя.
    После этого пользователю нужно войти заново.
    
    Args:
        response: HTTP Response для удаления cookie
    
    Returns:
        dict: Сообщение об успешном выходе
    
    Пример запроса:
        POST /api/users/logout
    """
    # Удаляем cookie с JWT токеном
    services.remove_auth_cookie(response)
    return {"message": "Successfully logged out"}


# =============================================================================
# ЭНДПОИНТ: ИНФОРМАЦИЯ О ТЕКУЩЕМ ПОЛЬЗОВАТЕЛЕ
# =============================================================================
@router.get("/me", response_model=schemas.UserResponse)
async def get_me(current_user: models.User = Depends(services.get_current_user)):
    """
    Получение информации о текущем авторизованном пользователе.
    
    Этот эндпоинт защищён - требует авторизации.
    Зависимость get_current_user извлекает пользователя из JWT cookie.
    
    Args:
        current_user: Текущий пользователь (из зависимости)
    
    Returns:
        UserResponse: Данные текущего пользователя
    
    Raises:
        HTTPException 401: Если пользователь не авторизован
    
    Пример запроса:
        GET /api/users/me
        Cookie: wardrobe_access_token=...
    """
    return current_user
