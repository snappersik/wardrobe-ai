# =============================================================================
# СЕРВИСЫ (БИЗНЕС-ЛОГИКА) - services.py
# =============================================================================
# Этот модуль содержит бизнес-логику приложения:
# - Хеширование паролей (Argon2)
# - Создание и проверка JWT токенов
# - Аутентификация пользователей
# - Работа с cookies для авторизации
# =============================================================================

# Работа с датами и временем
from datetime import datetime, timedelta

# Типизация для опциональных значений
from typing import Optional

# Библиотека для работы с JWT токенами
from jose import JWTError, jwt

# Argon2 - современный алгоритм хеширования паролей
# Победитель конкурса Password Hashing Competition (2015)
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError

# FastAPI зависимости и исключения
from fastapi import Depends, HTTPException, status, Request, Response

# Асинхронная сессия SQLAlchemy
from sqlalchemy.ext.asyncio import AsyncSession

# SQL операции для поиска пользователей
from sqlalchemy import select, or_

# Импорт модели пользователя
from ..models.models import User

# Импорт функции получения сессии БД и настроек
from ..db.database import get_db, settings


# =============================================================================
# НАСТРОЙКИ JWT ТОКЕНОВ
# =============================================================================
# JWT (JSON Web Token) - механизм авторизации пользователей.
# Токен содержит зашифрованную информацию о пользователе.

# Секретный ключ для подписи токенов (из .env)
SECRET_KEY = settings.SECRET_KEY

# Алгоритм шифрования (HS256 = HMAC + SHA-256)
ALGORITHM = settings.ALGORITHM

# Время жизни токена в минутах
ACCESS_TOKEN_EXPIRE_MINUTES = settings.ACCESS_TOKEN_EXPIRE_MINUTES

# Имя cookie в которой хранится токен
COOKIE_NAME = "wardrobe_access_token"


# =============================================================================
# ХЕШИРОВАНИЕ ПАРОЛЕЙ (Argon2)
# =============================================================================
# Argon2 - самый безопасный алгоритм хеширования паролей.
# Защищает от атак перебора (brute-force) и радужных таблиц.

# Создаём экземпляр хешера с настройками по умолчанию
ph = PasswordHasher()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Проверяет совпадение пароля с хешем.
    
    Используется при авторизации: сравниваем введённый пароль
    с хешем из базы данных.
    
    Args:
        plain_password: Пароль в открытом виде (введённый пользователем)
        hashed_password: Хеш пароля из базы данных
    
    Returns:
        bool: True если пароль верный, False если нет
    
    Пример:
        if verify_password("my_password", user.hashed_password):
            print("Пароль верный!")
    """
    try:
        # Argon2 сам проверяет соответствие
        ph.verify(hashed_password, plain_password)
        return True
    except VerifyMismatchError:
        # Пароль не совпадает
        return False


def get_password_hash(password: str) -> str:
    """
    Хеширует пароль с помощью Argon2.
    
    Используется при регистрации: хешируем пароль перед сохранением в БД.
    НИКОГДА не храните пароли в открытом виде!
    
    Args:
        password: Пароль в открытом виде
    
    Returns:
        str: Захешированный пароль (строка вида $argon2id$v=19$...)
    
    Пример:
        hashed = get_password_hash("my_secure_password")
        user.hashed_password = hashed
    """
    return ph.hash(password)


# =============================================================================
# СОЗДАНИЕ JWT ТОКЕНОВ
# =============================================================================

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Создаёт JWT токен доступа.
    
    JWT токен содержит:
    - sub (subject): идентификатор пользователя (username или email)
    - exp (expiration): время истечения токена
    
    Args:
        data: Словарь с данными для кодирования (обычно {"sub": username})
        expires_delta: Время жизни токена (опционально)
    
    Returns:
        str: Закодированный JWT токен
    
    Пример:
        token = create_access_token(
            data={"sub": user.username},
            expires_delta=timedelta(minutes=60)
        )
    """
    # Копируем данные чтобы не изменять оригинал
    to_encode = data.copy()
    
    # Устанавливаем время истечения токена
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    # Добавляем время истечения в данные токена
    to_encode.update({"exp": expire})
    
    # Кодируем токен с подписью
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# =============================================================================
# РАБОТА С COOKIES
# =============================================================================
# Cookies используются для хранения JWT токена на стороне клиента.
# Это безопаснее чем хранение в localStorage (защита от XSS).

def set_auth_cookie(response: Response, token: str):
    """
    Устанавливает cookie с JWT токеном авторизации.
    
    Параметры безопасности:
    - httponly: cookie недоступна из JavaScript (защита от XSS)
    - samesite: ограничивает отправку cookie (защита от CSRF)
    - secure: только через HTTPS (включите в продакшене!)
    
    Args:
        response: Объект ответа FastAPI
        token: JWT токен для сохранения
    
    Пример:
        set_auth_cookie(response, access_token)
    """
    response.set_cookie(
        key=COOKIE_NAME,                                    # Имя cookie
        value=token,                                        # JWT токен
        httponly=True,                                      # Защита от XSS атак
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,          # Время жизни в секундах
        samesite="lax",                                     # Защита от CSRF атак
        secure=False  # TODO: Установите True в production (HTTPS)
    )


def remove_auth_cookie(response: Response):
    """
    Удаляет cookie авторизации (выход из системы).
    
    Args:
        response: Объект ответа FastAPI
    
    Пример:
        remove_auth_cookie(response)
        return {"message": "Logged out"}
    """
    response.delete_cookie(key=COOKIE_NAME)


# =============================================================================
# ПОЛУЧЕНИЕ ТЕКУЩЕГО ПОЛЬЗОВАТЕЛЯ 
# =============================================================================

async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Извлекает текущего авторизованного пользователя из cookie.
    
    Эта функция используется как зависимость (Dependency) в защищённых эндпоинтах.
    Если пользователь не авторизован - выбрасывает HTTP 401.
    
    Алгоритм:
    1. Читаем JWT токен из cookie
    2. Декодируем и проверяем токен
    3. Достаём username/email из токена
    4. Находим пользователя в базе данных
    
    Args:
        request: HTTP запрос (для чтения cookies)
        db: Сессия базы данных
    
    Returns:
        User: Объект текущего пользователя
    
    Raises:
        HTTPException: 401 если не авторизован
    
    Пример:
        @router.get("/profile")
        async def profile(user: User = Depends(get_current_user)):
            return {"username": user.username}
    """
    # Исключение для неавторизованных запросов
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Not authenticated",
    )
    
    # Шаг 1: Читаем токен из cookie
    token = request.cookies.get(COOKIE_NAME)
    if not token:
        raise credentials_exception
    
    try:
        # Шаг 2: Декодируем JWT токен
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Шаг 3: Извлекаем идентификатор пользователя (username или email)
        user_identifier: str = payload.get("sub")
        if user_identifier is None:
            raise credentials_exception
    except JWTError:
        # Токен невалидный или истёк
        raise credentials_exception
    
    # Шаг 4: Ищем пользователя в базе данных по username ИЛИ email
    result = await db.execute(
        select(User).filter(
            or_(User.username == user_identifier, User.email == user_identifier)
        )
    )
    user = result.scalar_one_or_none()
    
    if user is None:
        raise credentials_exception
    
    return user


# =============================================================================
# АУТЕНТИФИКАЦИЯ ПОЛЬЗОВАТЕЛЯ
# =============================================================================

async def authenticate_user(db: AsyncSession, username_or_email: str, password: str) -> Optional[User]:
    """
    Проверяет учётные данные пользователя (логин/email + пароль).
    
    Используется при входе в систему.
    
    Алгоритм:
    1. Ищем пользователя по username ИЛИ email
    2. Проверяем пароль через Argon2
    3. Возвращаем пользователя или None
    
    Args:
        db: Сессия базы данных
        username_or_email: Логин или email
        password: Пароль в открытом виде
    
    Returns:
        User: Объект пользователя если авторизация успешна
        None: Если пользователь не найден или пароль неверный
    
    Пример:
        user = await authenticate_user(db, "john@example.com", "password123")
        if user:
            print("Авторизация успешна!")
    """
    # Ищем пользователя по username ИЛИ email
    result = await db.execute(
        select(User).filter(
            or_(User.username == username_or_email, User.email == username_or_email)
        )
    )
    user = result.scalar_one_or_none()
    
    # Проверяем найден ли пользователь и верный ли пароль
    if not user or not verify_password(password, user.hashed_password):
        return None
    
    return user
