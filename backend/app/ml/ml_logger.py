# =============================================================================
# ML LOGGER — Структурированное логирование в MongoDB
# =============================================================================
# Пишет логи с уровнями (info/warning/error/ml) в коллекцию audit_logs.
# Используется ML-воркером и API для отслеживания процесса обучения.
# =============================================================================

from datetime import datetime
from typing import Optional, Dict, Any


async def _write_log(
    db,
    level: str,
    action: str,
    details: str,
    source: str = "system",
    user_id: Optional[int] = None,
    username: Optional[str] = None,
    extra: Optional[Dict[str, Any]] = None
):
    """Базовая функция записи лога в MongoDB."""
    doc = {
        "level": level,
        "action": action,
        "details": details,
        "source": source,
        "timestamp": datetime.utcnow(),
    }
    if user_id is not None:
        doc["user_id"] = user_id
    if username:
        doc["username"] = username
    if extra:
        doc.update(extra)
    
    await db.audit_logs.insert_one(doc)


async def log_info(db, action: str, details: str, **kwargs):
    """Информационное сообщение."""
    await _write_log(db, "info", action, details, **kwargs)


async def log_warning(db, action: str, details: str, **kwargs):
    """Предупреждение."""
    await _write_log(db, "warning", action, details, **kwargs)


async def log_error(db, action: str, details: str, **kwargs):
    """Ошибка."""
    await _write_log(db, "error", action, details, **kwargs)


async def log_ml_event(db, action: str, details: str, job_id: str = None, **kwargs):
    """Событие ML-обучения."""
    extra = kwargs.pop("extra", {}) or {}
    if job_id:
        extra["job_id"] = str(job_id)
    await _write_log(db, "ml", action, details, source="ml_worker", extra=extra, **kwargs)


# Синхронные версии для использования в worker (без asyncio)
def _write_log_sync(collection, level, action, details, source="system", extra=None):
    """Синхронная запись лога (для worker.py)."""
    doc = {
        "level": level,
        "action": action,
        "details": details,
        "source": source,
        "timestamp": datetime.utcnow(),
    }
    if extra:
        doc.update(extra)
    collection.insert_one(doc)


def log_info_sync(collection, action, details, **kwargs):
    _write_log_sync(collection, "info", action, details, **kwargs)

def log_warning_sync(collection, action, details, **kwargs):
    _write_log_sync(collection, "warning", action, details, **kwargs)

def log_error_sync(collection, action, details, **kwargs):
    _write_log_sync(collection, "error", action, details, **kwargs)

def log_ml_sync(collection, action, details, job_id=None, **kwargs):
    extra = kwargs.pop("extra", {}) or {}
    if job_id:
        extra["job_id"] = str(job_id)
    _write_log_sync(collection, "ml", action, details, source="ml_worker", extra=extra, **kwargs)
