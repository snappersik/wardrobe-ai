import time
import os
import uuid
from sqlalchemy import create_engine, select, update
from sqlalchemy.orm import sessionmaker
from app.models.ml import MLTrainingJob
from app.db.database import settings

# Воркеру удобнее работать с синхронным соединением для долгих задач
# Преобразуем асинхронный URL в синхронный (asyncpg -> psycopg2)
SYNC_DB_URL = settings.DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
SYNC_DB_URL = SYNC_DB_URL.replace("@db:", "@localhost:") if "localhost" not in SYNC_DB_URL else SYNC_DB_URL # Adjust for local vs docker if needed

# Внутри Docker 'db' доступен по имени, но для локального теста может понадобиться localhost
# В Docker Compose мы передаем DATABASE_URL через env, так что возьмем его оттуда
DATABASE_URL = os.getenv("DATABASE_URL", SYNC_DB_URL).replace("postgresql+asyncpg://", "postgresql://")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from app.ml.exporter import export_dataset
from ultralytics import YOLO

def process_jobs():
    print("ML Worker started. Polling for jobs...")
    while True:
        db = SessionLocal()
        try:
            # Ищем задачу в очереди
            job = db.query(MLTrainingJob).filter(MLTrainingJob.status == "PENDING").first()
            
            if job:
                print(f"[*] Found job {job.id}. Preparing data...")
                
                # Обновляем статус на TRAINING
                job.status = "TRAINING"
                db.commit()
                
                # 1. Экспорт данных
                shared_path = os.getenv("ML_SHARED_PATH", "./ml_shared")
                job_dir = os.path.join(shared_path, "datasets", str(job.id))
                os.makedirs(job_dir, exist_ok=True)
                
                count, num_classes = export_dataset(db, job_dir)
                print(f"[+] Exported {count} items with {num_classes} classes.")
                
                if count == 0:
                    raise Exception("No data to train on.")

                # 2. Обучение YOLOv8
                print(f"[*] Starting YOLOv8 training for job {job.id}...")
                model = YOLO("yolov8n.pt") # Используем нано-модель для скорости
                
                results = model.train(
                    data=os.path.join(job_dir, "dataset.yaml"),
                    epochs=10, # Для теста 10 эпох
                    imgsz=640,
                    project=os.path.join(shared_path, "models"),
                    name=str(job.id)
                )
                
                # 3. Завершение
                print(f"[+] Job {job.id} completed.")
                job.status = "COMPLETED"
                job.result_model_path = os.path.join("models", str(job.id), "weights", "best.pt")
                job.metrics = {
                    "mAP50": results.results_dict.get("metrics/mAP50(B)", 0),
                    "precision": results.results_dict.get("metrics/precision(B)", 0),
                    "recall": results.results_dict.get("metrics/recall(B)", 0)
                }
                db.commit()
            
        except Exception as e:
            print(f"[!] Error in worker: {e}")
            db.rollback()
        finally:
            db.close()
            
        time.sleep(5) # Пауза между проверками

if __name__ == "__main__":
    process_jobs()
