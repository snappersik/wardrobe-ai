# =============================================================================
# СКРИПТ ОБУЧЕНИЯ MULTI-HEAD RESNET-50 (train_deepfashion.py)
# =============================================================================
# Обучает MultiHeadResNet50 на комбинации двух датасетов:
#   - DeepFashion (Category & Attribute Prediction) — 46 категорий
#   - Kaggle Fashion Product Images (Myntra) — стили (usage labels)
#
# Запуск:
#   python -m app.ml.train_deepfashion
#   python -m app.ml.train_deepfashion --epochs 20 --batch-size 32
# =============================================================================

import os
import sys
import argparse
import logging
import json
from pathlib import Path

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, random_split
from torchvision import transforms
from PIL import Image

from app.ml.fashion_classifier import MultiHeadResNet50, NUM_CATEGORY_CLASSES, NUM_STYLE_CLASSES, STYLE_CLASSES
from app.ml.attribute_mappings import DEEPFASHION_CATEGORIES, USAGE_TO_STYLE

logging.basicConfig(level=logging.INFO, format='%(asctime)s | %(message)s')
logger = logging.getLogger(__name__)


# =============================================================================
# DATASET
# =============================================================================
class FashionDataset(Dataset):
    """
    Универсальный датасет для обучения.
    Принимает список (image_path, category_label, style_label).
    
    category_label: int (0-45) — индекс категории DeepFashion
    style_label: int (0-6) — индекс стиля, -1 если неизвестен
    """
    
    def __init__(self, samples, transform=None):
        self.samples = samples   # [(path, cat_idx, style_idx), ...]
        self.transform = transform
    
    def __len__(self):
        return len(self.samples)
    
    def __getitem__(self, idx):
        path, cat_label, style_label = self.samples[idx]
        
        try:
            img = Image.open(path).convert("RGB")
        except Exception:
            # Fallback: чёрное изображение
            img = Image.new("RGB", (224, 224), (0, 0, 0))
        
        if self.transform:
            img = self.transform(img)
        
        return img, cat_label, style_label


# =============================================================================
# ПОДГОТОВКА ДАННЫХ
# =============================================================================

# Аугментация для тренировки
TRANSFORM_TRAIN = transforms.Compose([
    transforms.Resize(256),
    transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
    transforms.RandomHorizontalFlip(),
    transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])

TRANSFORM_VAL = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
])


def load_deepfashion_samples(data_dir: str) -> list:
    """
    Загружает DeepFashion Category & Attribute Prediction.
    
    Ожидаемая структура:
        data_dir/
            Anno/
                list_category_img.txt   — маппинг image_path -> category_label
                list_category_cloth.txt — список категорий
            Img/
                ... изображения ...
    
    Returns:
        [(image_path, category_idx, -1), ...]
    """
    samples = []
    anno_dir = os.path.join(data_dir, "Anno")
    img_dir = os.path.join(data_dir, "Img")
    
    list_file = os.path.join(anno_dir, "list_category_img.txt")
    if not os.path.exists(list_file):
        logger.warning(f"DeepFashion annotation not found: {list_file}")
        return samples
    
    with open(list_file, 'r') as f:
        lines = f.readlines()
    
    # Первые 2 строки — заголовки (кол-во + header)
    num_images = int(lines[0].strip())
    for line in lines[2:]:
        parts = line.strip().split()
        if len(parts) >= 2:
            img_path = os.path.join(img_dir, parts[0])
            cat_idx = int(parts[1]) - 1  # DeepFashion is 1-indexed
            if 0 <= cat_idx < NUM_CATEGORY_CLASSES and os.path.exists(img_path):
                samples.append((img_path, cat_idx, -1))
    
    logger.info(f"📦 DeepFashion: загружено {len(samples)} из {num_images} изображений")
    return samples


def load_kaggle_fashion_samples(data_dir: str) -> list:
    """
    Загружает Kaggle Fashion Product Images (Myntra).
    
    Ожидаемая структура:
        data_dir/
            styles.csv          — метаданные (id, gender, masterCategory, usage, ...)
            images/
                1234.jpg
                ...
    
    Returns:
        [(image_path, -1, style_idx), ...]
    """
    import csv
    
    samples = []
    csv_path = os.path.join(data_dir, "styles.csv")
    images_dir = os.path.join(data_dir, "images")
    
    if not os.path.exists(csv_path):
        logger.warning(f"Kaggle Fashion CSV not found: {csv_path}")
        return samples
    
    # Инвертированный маппинг стилей
    style_to_idx = {v: k for k, v in STYLE_CLASSES.items()}
    
    with open(csv_path, 'r', encoding='utf-8', errors='ignore') as f:
        reader = csv.DictReader(f)
        for row in reader:
            usage = row.get("usage", "").strip()
            style_id = USAGE_TO_STYLE.get(usage)
            
            if style_id and style_id in style_to_idx:
                img_name = f"{row['id']}.jpg"
                img_path = os.path.join(images_dir, img_name)
                
                if os.path.exists(img_path):
                    style_idx = style_to_idx[style_id]
                    samples.append((img_path, -1, style_idx))
    
    logger.info(f"📦 Kaggle Fashion: загружено {len(samples)} изображений")
    return samples


# =============================================================================
# ОБУЧЕНИЕ
# =============================================================================

def train(args):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    logger.info(f"🖥️  Device: {device}")
    
    # Собираем семплы
    all_samples = []
    
    if args.deepfashion_dir:
        all_samples.extend(load_deepfashion_samples(args.deepfashion_dir))
    
    if args.kaggle_dir:
        all_samples.extend(load_kaggle_fashion_samples(args.kaggle_dir))
    
    if not all_samples:
        logger.error("❌ Нет данных для обучения! Укажите --deepfashion-dir и/или --kaggle-dir")
        sys.exit(1)
    
    logger.info(f"📊 Всего семплов: {len(all_samples)}")
    
    # Train/Val split (80/20)
    dataset = FashionDataset(all_samples, transform=TRANSFORM_TRAIN)
    val_size = int(0.2 * len(dataset))
    train_size = len(dataset) - val_size
    train_dataset, val_dataset = random_split(dataset, [train_size, val_size])
    val_dataset.dataset.transform = TRANSFORM_VAL  # Без аугментации для валидации
    
    train_loader = DataLoader(train_dataset, batch_size=args.batch_size, shuffle=True, num_workers=2, pin_memory=True)
    val_loader = DataLoader(val_dataset, batch_size=args.batch_size, shuffle=False, num_workers=2, pin_memory=True)
    
    logger.info(f"📈 Train: {train_size}, Val: {val_size}")
    
    # Модель
    model = MultiHeadResNet50(pretrained=True).to(device)
    
    # Loss functions
    category_criterion = nn.CrossEntropyLoss(ignore_index=-1)
    style_criterion = nn.CrossEntropyLoss(ignore_index=-1)
    
    # Optimizer: разные learning rates для backbone и heads
    backbone_params = [p for n, p in model.named_parameters() if 'head' not in n and p.requires_grad]
    head_params = [p for n, p in model.named_parameters() if 'head' in n]
    
    optimizer = optim.AdamW([
        {'params': backbone_params, 'lr': args.lr * 0.1},
        {'params': head_params, 'lr': args.lr},
    ], weight_decay=1e-4)
    
    scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=args.epochs)
    
    # Обучение
    best_val_acc = 0.0
    save_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "weights", "fashion_resnet50.pth")
    os.makedirs(os.path.dirname(save_path), exist_ok=True)
    
    for epoch in range(args.epochs):
        model.train()
        total_loss = 0
        correct_cat = 0
        total_cat = 0
        
        for batch_idx, (images, cat_labels, style_labels) in enumerate(train_loader):
            images = images.to(device)
            cat_labels = cat_labels.to(device)
            style_labels = style_labels.to(device)
            
            cat_logits, style_logits = model(images)
            
            # Multi-task loss
            loss_cat = category_criterion(cat_logits, cat_labels)
            loss_style = style_criterion(style_logits, style_labels)
            
            # Игнорируем NaN потери (если все labels = -1)
            loss = 0
            if not torch.isnan(loss_cat):
                loss = loss + loss_cat
            if not torch.isnan(loss_style):
                loss = loss + 0.5 * loss_style  # Стиль менее важен
            
            if isinstance(loss, (int, float)) and loss == 0:
                continue
            
            optimizer.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
            optimizer.step()
            
            total_loss += loss.item()
            
            # Accuracy для категорий
            mask = cat_labels >= 0
            if mask.any():
                preds = cat_logits[mask].argmax(dim=1)
                correct_cat += (preds == cat_labels[mask]).sum().item()
                total_cat += mask.sum().item()
        
        scheduler.step()
        
        train_acc = correct_cat / max(total_cat, 1) * 100
        avg_loss = total_loss / max(len(train_loader), 1)
        
        # Валидация
        model.eval()
        val_correct = 0
        val_total = 0
        
        with torch.no_grad():
            for images, cat_labels, style_labels in val_loader:
                images = images.to(device)
                cat_labels = cat_labels.to(device)
                
                cat_logits, _ = model(images)
                
                mask = cat_labels >= 0
                if mask.any():
                    preds = cat_logits[mask].argmax(dim=1)
                    val_correct += (preds == cat_labels[mask]).sum().item()
                    val_total += mask.sum().item()
        
        val_acc = val_correct / max(val_total, 1) * 100
        
        logger.info(
            f"Epoch {epoch+1}/{args.epochs} | "
            f"Loss: {avg_loss:.4f} | "
            f"Train Acc: {train_acc:.1f}% | "
            f"Val Acc: {val_acc:.1f}%"
        )
        
        # Сохраняем лучшую модель
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            torch.save(model.state_dict(), save_path)
            logger.info(f"💾 Best model saved (val_acc={val_acc:.1f}%)")
    
    logger.info(f"✅ Training complete! Best val accuracy: {best_val_acc:.1f}%")
    logger.info(f"📁 Weights saved to: {save_path}")


# =============================================================================
# CLI
# =============================================================================
def main():
    parser = argparse.ArgumentParser(description="Train Multi-Head ResNet-50 for Fashion")
    parser.add_argument("--deepfashion-dir", type=str, default=None,
                        help="Path to DeepFashion Category & Attribute Prediction dataset")
    parser.add_argument("--kaggle-dir", type=str, default=None,
                        help="Path to Kaggle Fashion Product Images dataset")
    parser.add_argument("--epochs", type=int, default=15)
    parser.add_argument("--batch-size", type=int, default=32)
    parser.add_argument("--lr", type=float, default=1e-3)
    
    args = parser.parse_args()
    train(args)


if __name__ == "__main__":
    main()
