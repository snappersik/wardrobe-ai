import os
import shutil
import yaml
from sqlalchemy.orm import Session
from app.models.models import ClothingItem
from app.db.database import settings

def export_dataset(db: Session, export_path: str):
    """
    Exports clothing items from DB to a YOLOv8 dataset format.
    
    YOLOv8 Structure:
    - images/
      - train/
    - labels/
      - train/
    - dataset.yaml
    """
    
    # 1. Создаем структуру папок
    images_dir = os.path.join(export_path, "images", "train")
    labels_dir = os.path.join(export_path, "labels", "train")
    os.makedirs(images_dir, exist_ok=True)
    os.makedirs(labels_dir, exist_ok=True)
    
    # 2. Получаем все вещи с категориями
    items = db.query(ClothingItem).filter(ClothingItem.category.isnot(None)).all()
    
    # Уникальные категории для mapping'а в ID
    categories = sorted(list(set(item.category for item in items)))
    cat_to_id = {cat: i for i, cat in enumerate(categories)}
    
    # 3. Копируем файлы и создаем метки
    exported_count = 0
    for item in items:
        try:
            # Путь к оригинальному файлу (относительно backend/)
            src_path = os.path.join(os.getcwd(), item.image_path.lstrip("./"))
            if not os.path.exists(src_path):
                print(f"[!] File not found: {src_path}")
                continue
                
            # Имя файла
            file_ext = os.path.splitext(src_path)[1]
            target_filename = f"{item.id}{file_ext}"
            target_img_path = os.path.join(images_dir, target_filename)
            
            # Копируем картинку
            shutil.copy2(src_path, target_img_path)
            
            # Создаем файл метки (YOLO format)
            # ВНИМАНИЕ: Сейчас у нас нет координат боксов в БД.
            # Для классификации YOLOv8 структура другая, но для детекции 
            # мы пока создаем метку на всё изображение (0.5 0.5 1 1)
            label_filename = f"{item.id}.txt"
            target_label_path = os.path.join(labels_dir, label_filename)
            
            class_id = cat_to_id[item.category]
            with open(target_label_path, "w") as f:
                # class x_center y_center width height (нормализованные 0-1)
                f.write(f"{class_id} 0.5 0.5 1.0 1.0\n")
                
            exported_count += 1
        except Exception as e:
            print(f"[!] Error exporting item {item.id}: {e}")

    # 4. Создаем dataset.yaml
    yaml_content = {
        "path": export_path,
        "train": "images/train",
        "val": "images/train",  # Для начала используем те же данные для валидации
        "names": {i: cat for i, cat in enumerate(categories)}
    }
    
    with open(os.path.join(export_path, "dataset.yaml"), "w") as f:
        yaml.dump(yaml_content, f, default_flow_style=False)
        
    return exported_count, len(categories)
