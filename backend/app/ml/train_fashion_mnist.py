# =============================================================================
# СКРИПТ ОБУЧЕНИЯ FASHION-MNIST (train_fashion_mnist.py)
# =============================================================================
# Обучает CNN на датасете Fashion-MNIST для классификации одежды.
# 
# Запуск: python -m app.ml.train_fashion_mnist
# =============================================================================

import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from tqdm import tqdm

# Импорт архитектуры модели
from app.ml.classifier import FashionCNN

def train():
    """Обучает модель Fashion-MNIST CNN."""
    
    # Устройство для вычислений
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"🖥️ Устройство: {device}")
    
    # Гиперпараметры
    BATCH_SIZE = 64
    EPOCHS = 10
    LEARNING_RATE = 0.001
    
    # Трансформации для данных
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize((0.5,), (0.5,))
    ])
    
    # Загрузка датасета Fashion-MNIST
    print("📥 Загрузка датасета Fashion-MNIST...")
    
    train_dataset = datasets.FashionMNIST(
        root='./data',
        train=True,
        download=True,
        transform=transform
    )
    
    test_dataset = datasets.FashionMNIST(
        root='./data',
        train=False,
        download=True,
        transform=transform
    )
    
    train_loader = DataLoader(train_dataset, batch_size=BATCH_SIZE, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=BATCH_SIZE, shuffle=False)
    
    print(f"✅ Загружено: {len(train_dataset)} обучающих, {len(test_dataset)} тестовых")
    
    # Создание модели
    model = FashionCNN().to(device)
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=LEARNING_RATE)
    
    # Обучение
    print(f"\n🚀 Начинаю обучение ({EPOCHS} эпох)...")
    
    for epoch in range(EPOCHS):
        model.train()
        running_loss = 0.0
        correct = 0
        total = 0
        
        progress = tqdm(train_loader, desc=f"Эпоха {epoch+1}/{EPOCHS}")
        
        for images, labels in progress:
            images, labels = images.to(device), labels.to(device)
            
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            
            running_loss += loss.item()
            _, predicted = torch.max(outputs, 1)
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
            
            progress.set_postfix({
                'loss': f'{running_loss/len(train_loader):.4f}',
                'acc': f'{100*correct/total:.2f}%'
            })
        
        # Валидация на тестовом наборе
        model.eval()
        test_correct = 0
        test_total = 0
        
        with torch.no_grad():
            for images, labels in test_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                _, predicted = torch.max(outputs, 1)
                test_total += labels.size(0)
                test_correct += (predicted == labels).sum().item()
        
        test_acc = 100 * test_correct / test_total
        print(f"📊 Эпоха {epoch+1}: Train Acc = {100*correct/total:.2f}%, Test Acc = {test_acc:.2f}%")
    
    # Сохранение весов
    weights_dir = os.path.join(os.path.dirname(__file__), "weights")
    os.makedirs(weights_dir, exist_ok=True)
    
    model_path = os.path.join(weights_dir, "fashion_mnist_cnn.pth")
    torch.save(model.state_dict(), model_path)
    
    print(f"\n✅ Модель сохранена: {model_path}")
    print(f"🎯 Финальная точность: {test_acc:.2f}%")


if __name__ == "__main__":
    train()
