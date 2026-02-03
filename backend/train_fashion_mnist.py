# =============================================================================
# СКРИПТ ОБУЧЕНИЯ FASHION-MNIST (train_fashion_mnist.py)
# =============================================================================
# Скачивает датасет Fashion-MNIST и обучает CNN модель.
# 
# Запуск:
#   cd backend
#   python train_fashion_mnist.py
#
# После обучения модель сохраняется в:
#   app/ml/weights/fashion_mnist_cnn.pth
# =============================================================================

import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from tqdm import tqdm

# Импортируем архитектуру модели
import sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from app.ml.classifier import FashionCNN, FASHION_MNIST_CLASSES

# =============================================================================
# КОНФИГУРАЦИЯ
# =============================================================================
BATCH_SIZE = 64
EPOCHS = 15
LEARNING_RATE = 0.001
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
SAVE_PATH = os.path.join(os.path.dirname(__file__), "app", "ml", "weights", "fashion_mnist_cnn.pth")


def train():
    """Обучение модели на Fashion-MNIST."""
    
    print("=" * 60)
    print("🎓 ОБУЧЕНИЕ FASHION-MNIST КЛАССИФИКАТОРА")
    print("=" * 60)
    print(f"Device: {DEVICE}")
    print(f"Epochs: {EPOCHS}")
    print(f"Batch size: {BATCH_SIZE}")
    print()
    
    # =========================================================================
    # 1. ПОДГОТОВКА ДАННЫХ
    # =========================================================================
    print("📥 Загрузка датасета Fashion-MNIST...")
    
    # Трансформации для обучения (с аугментацией)
    train_transform = transforms.Compose([
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(10),
        transforms.ToTensor(),
        transforms.Normalize((0.5,), (0.5,))
    ])
    
    # Трансформации для тестирования (без аугментации)
    test_transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.5,), (0.5,))
    ])
    
    # Загрузка датасетов (автоматически скачиваются при первом запуске)
    train_dataset = datasets.FashionMNIST(
        root="./data",
        train=True,
        download=True,
        transform=train_transform
    )
    
    test_dataset = datasets.FashionMNIST(
        root="./data",
        train=False,
        download=True,
        transform=test_transform
    )
    
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False)
    
    print(f"✅ Train samples: {len(train_dataset)}")
    print(f"✅ Test samples: {len(test_dataset)}")
    print()
    
    # =========================================================================
    # 2. СОЗДАНИЕ МОДЕЛИ
    # =========================================================================
    print("🧠 Создание модели...")
    model = FashionCNN().to(DEVICE)
    
    # Подсчет параметров
    total_params = sum(p.numel() for p in model.parameters())
    print(f"   Всего параметров: {total_params:,}")
    print()
    
    # =========================================================================
    # 3. НАСТРОЙКА ОБУЧЕНИЯ
    # =========================================================================
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=5, gamma=0.5)
    
    # =========================================================================
    # 4. ЦИКЛ ОБУЧЕНИЯ
    # =========================================================================
    print("🚀 Начало обучения...")
    print()
    
    best_accuracy = 0.0
    
    for epoch in range(EPOCHS):
        # --- Training ---
        model.train()
        train_loss = 0.0
        train_correct = 0
        train_total = 0
        
        pbar = tqdm(train_loader, desc=f"Epoch {epoch+1}/{EPOCHS}", ncols=80)
        for images, labels in pbar:
            images, labels = images.to(DEVICE), labels.to(DEVICE)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            train_loss += loss.item()
            _, predicted = torch.max(outputs.data, 1)
            train_total += labels.size(0)
            train_correct += (predicted == labels).sum().item()
            
            pbar.set_postfix({"loss": f"{loss.item():.4f}"})
        
        train_accuracy = 100 * train_correct / train_total
        
        # --- Validation ---
        model.eval()
        test_correct = 0
        test_total = 0
        
        with torch.no_grad():
            for images, labels in test_loader:
                images, labels = images.to(DEVICE), labels.to(DEVICE)
                outputs = model(images)
                _, predicted = torch.max(outputs.data, 1)
                test_total += labels.size(0)
                test_correct += (predicted == labels).sum().item()
        
        test_accuracy = 100 * test_correct / test_total
        
        print(f"   Train Acc: {train_accuracy:.2f}% | Test Acc: {test_accuracy:.2f}%")
        
        # Сохраняем лучшую модель
        if test_accuracy > best_accuracy:
            best_accuracy = test_accuracy
            os.makedirs(os.path.dirname(SAVE_PATH), exist_ok=True)
            torch.save(model.state_dict(), SAVE_PATH)
            print(f"   💾 Модель сохранена (accuracy: {best_accuracy:.2f}%)")
        
        scheduler.step()
        print()
    
    # =========================================================================
    # 5. ИТОГИ
    # =========================================================================
    print("=" * 60)
    print("🎉 ОБУЧЕНИЕ ЗАВЕРШЕНО!")
    print("=" * 60)
    print(f"Лучшая точность: {best_accuracy:.2f}%")
    print(f"Модель сохранена: {SAVE_PATH}")
    print()
    print("Классы:")
    for class_id, info in FASHION_MNIST_CLASSES.items():
        print(f"  {class_id}: {info['name']} ({info['id']})")


if __name__ == "__main__":
    train()
