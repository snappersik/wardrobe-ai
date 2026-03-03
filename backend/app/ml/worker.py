# =============================================================================
# ML WORKER — Phase 2: ResNet-50 Training Worker
# =============================================================================
# Polls for PENDING MLTrainingJob rows in PostgreSQL, runs ResNet-50 training
# with per-epoch progress updates and structured logging to MongoDB.
# =============================================================================

import os
import sys
# Fix for Windows console encoding (emojis)
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8')

import time
import json
import traceback
from datetime import datetime

# Database
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session, sessionmaker
from pymongo import MongoClient

# Project
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app.models.ml import MLTrainingJob
from app.db.database import Base
from app.ml.ml_logger import log_info_sync, log_error_sync, log_ml_sync

# Load environment variables
from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"))


# =============================================================================
# CONFIG
# =============================================================================
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://wardrobe:wardrobe@localhost:5432/wardrobe_db")
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
ML_SHARED_PATH = os.getenv("ML_SHARED_PATH", "/ml_shared")
POLL_INTERVAL = int(os.getenv("WORKER_POLL_INTERVAL", "5"))

# =============================================================================
# DATABASE SETUP
# =============================================================================
engine = create_engine(
    DATABASE_URL.replace("+asyncpg", ""),
    connect_args={"client_encoding": "utf8"}
)
SessionLocal = sessionmaker(bind=engine)

mongo_client = MongoClient(MONGO_URL)
mongo_db = mongo_client["wardrobe"]
audit_logs = mongo_db["audit_logs"]


def train_resnet50(job_id: str, epochs: int, batch_size: int, db: Session):
    """
    Запускает обучение MultiHeadResNet50 с пошаговым логированием.
    Обновляет progress/current_epoch/metrics/status в PostgreSQL.
    """
    job = db.get(MLTrainingJob, job_id)
    if not job:
        print(f"[WORKER] Job {job_id} not found!")
        return
    
    job.status = "TRAINING"
    db.commit()
    
    log_ml_sync(audit_logs, "ml_training_begin", 
                f"Начало обучения ResNet-50 (epochs={epochs}, bs={batch_size})",
                job_id=str(job_id))
    
    try:
        # Импорт torch в runtime (может быть не установлен)
        import torch
        import torch.nn as nn
        import torch.optim as optim
        from torch.utils.data import DataLoader
        from app.ml.fashion_classifier import MultiHeadResNet50
        
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        log_ml_sync(audit_logs, "ml_device", f"Устройство: {device}", job_id=str(job_id))
        
        # Инициализация модели
        model = MultiHeadResNet50(num_categories=46, num_styles=7).to(device)
        
        # Проверяем наличие датасета
        dataset_path = os.path.join(ML_SHARED_PATH, "datasets", "deepfashion")
        if not os.path.exists(dataset_path):
            raise FileNotFoundError(f"Датасет не найден: {dataset_path}")
        
        # Используем train_deepfashion.py логику
        from app.ml.train_deepfashion import get_dataloaders, train_one_epoch, validate
        
        train_loader, val_loader, dataset_info = get_dataloaders(
            dataset_path, batch_size=batch_size
        )
        
        job.dataset_info = dataset_info
        db.commit()
        
        log_ml_sync(audit_logs, "ml_dataset_loaded",
                    f"Датасет загружен: {json.dumps(dataset_info, ensure_ascii=False)}",
                    job_id=str(job_id))
        
        # Оптимизатор и планировщик
        optimizer = optim.AdamW([
            {'params': model.backbone.parameters(), 'lr': 1e-5},
            {'params': model.category_head.parameters(), 'lr': 1e-3},
            {'params': model.style_head.parameters(), 'lr': 1e-3},
        ], weight_decay=0.01)
        
        scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=epochs)
        category_criterion = nn.CrossEntropyLoss(ignore_index=-1)
        style_criterion = nn.CrossEntropyLoss(ignore_index=-1)
        
        best_accuracy = 0.0
        model_save_path = os.path.join(ML_SHARED_PATH, "models", "resnet50_multihead.pth")
        os.makedirs(os.path.dirname(model_save_path), exist_ok=True)
        
        for epoch in range(1, epochs + 1):
            # Проверяем, не отменено ли обучение
            db.refresh(job)
            if job.status == "CANCELLED":
                log_ml_sync(audit_logs, "ml_training_cancelled",
                           "Обучение отменено пользователем", job_id=str(job_id))
                return
            
            # Train
            train_loss, train_cat_acc, train_style_acc = train_one_epoch(
                model, train_loader, optimizer, category_criterion, style_criterion, device
            )
            
            # Validate
            val_loss, val_cat_acc, val_style_acc = validate(
                model, val_loader, category_criterion, style_criterion, device
            )
            
            scheduler.step()
            
            # Обновляем прогресс
            progress = (epoch / epochs) * 100.0
            metrics = {
                "train_loss": round(train_loss, 4),
                "val_loss": round(val_loss, 4),
                "cat_accuracy": round(val_cat_acc, 4),
                "style_accuracy": round(val_style_acc, 4),
                "accuracy": round(val_cat_acc, 4),
                "lr": round(optimizer.param_groups[0]['lr'], 6),
            }
            
            job.current_epoch = epoch
            job.progress = progress
            job.metrics = metrics
            db.commit()
            
            log_ml_sync(audit_logs, "ml_epoch_complete",
                       f"Эпоха {epoch}/{epochs}: loss={val_loss:.4f}, cat_acc={val_cat_acc:.4f}, style_acc={val_style_acc:.4f}",
                       job_id=str(job_id),
                       extra={"epoch": epoch, "metrics": metrics})
            
            # Сохраняем лучшую модель
            if val_cat_acc > best_accuracy:
                best_accuracy = val_cat_acc
                torch.save(model.state_dict(), model_save_path)
                log_ml_sync(audit_logs, "ml_model_saved",
                           f"Лучшая модель сохранена: accuracy={best_accuracy:.4f}",
                           job_id=str(job_id))
        
        # Обучение завершено
        job.status = "COMPLETED"
        job.progress = 100.0
        job.end_time = datetime.utcnow()
        job.result_model_path = model_save_path
        db.commit()
        
        log_ml_sync(audit_logs, "ml_training_complete",
                   f"Обучение завершено! Лучшая accuracy: {best_accuracy:.4f}",
                   job_id=str(job_id))
    
    except FileNotFoundError as e:
        job.status = "FAILED"
        job.error_message = str(e)
        job.end_time = datetime.utcnow()
        db.commit()
        log_error_sync(audit_logs, "ml_training_error", str(e),
                      extra={"job_id": str(job_id)})
    
    except ImportError as e:
        job.status = "FAILED"
        job.error_message = f"Зависимость не установлена: {e}"
        job.end_time = datetime.utcnow()
        db.commit()
        log_error_sync(audit_logs, "ml_training_error", f"Import error: {e}",
                      extra={"job_id": str(job_id)})
    
    except Exception as e:
        job.status = "FAILED"
        job.error_message = str(e)
        job.end_time = datetime.utcnow()
        db.commit()
        log_error_sync(audit_logs, "ml_training_error",
                      f"Ошибка обучения: {traceback.format_exc()}",
                      extra={"job_id": str(job_id)})


def main():
    """Основной цикл воркера — опрашивает БД на PENDING задачи."""
    print(f"🤖 [ML Worker] Запущен. Poll interval: {POLL_INTERVAL}s")
    print(f"📂 ML Shared Path: {ML_SHARED_PATH}")
    print(f"🗄️ DB: {DATABASE_URL[:50]}...")
    
    log_info_sync(audit_logs, "ml_worker_started", "ML Worker запущен")
    
    while True:
        try:
            db = SessionLocal()
            result = db.execute(
                select(MLTrainingJob)
                .where(MLTrainingJob.status == "PENDING")
                .order_by(MLTrainingJob.start_time)
                .limit(1)
            )
            job = result.scalars().first()
            
            if job:
                print(f"\n🎯 [ML Worker] Найдена задача: {job.id}")
                train_resnet50(
                    job_id=job.id,
                    epochs=job.epochs or 15,
                    batch_size=job.batch_size or 32,
                    db=db
                )
            
            db.close()
        except Exception as e:
            print(f"❌ [ML Worker] Ошибка: {e}")
            traceback.print_exc()
        
        time.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    main()
