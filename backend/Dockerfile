# =============================================================================
# DOCKERFILE ДЛЯ BACKEND (FastAPI + Python)
# =============================================================================
# Оптимизирован для быстрой пересборки:
# - CPU-only PyTorch (в 10 раз меньше)
# - Кэширование pip между сборками
# - Разделение requirements и кода
# =============================================================================

FROM python:3.10-slim

WORKDIR /app

# Установка системных зависимостей для rembg/OpenCV
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    libxcb1 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libglib2.0-0 \
    libgl1 \
    && rm -rf /var/lib/apt/lists/*

# Кэширование pip (requirements меняются редко)
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt

# Копирование кода (меняется часто, но кэш pip сохраняется)
COPY . .

EXPOSE 8000

# Запуск миграций и потом сервера
CMD alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000
