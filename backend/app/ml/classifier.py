# =============================================================================
# FASHION-MNIST КЛАССИФИКАТОР (classifier.py)
# =============================================================================
# Модуль для классификации одежды с использованием модели, 
# обученной на датасете Fashion-MNIST.
# 
# Fashion-MNIST содержит 10 классов одежды:
# 0: T-shirt/top (Футболка)
# 1: Trouser (Брюки)
# 2: Pullover (Пуловер)
# 3: Dress (Платье)
# 4: Coat (Пальто)
# 5: Sandal (Сандалии)
# 6: Shirt (Рубашка)
# 7: Sneaker (Кроссовки)
# 8: Bag (Сумка)
# 9: Ankle boot (Ботинки)
# =============================================================================

import os
import torch
import torch.nn as nn
import torch.nn.functional as F
from PIL import Image
import torchvision.transforms as transforms

# =============================================================================
# МАППИНГ КЛАССОВ
# =============================================================================
# Fashion-MNIST class ID -> наш clothing-categories.json ID
FASHION_MNIST_CLASSES = {
    0: {"id": "t-shirt", "name": "Футболка", "type": "top"},
    1: {"id": "trouser", "name": "Брюки", "type": "bottom"},
    2: {"id": "pullover", "name": "Пуловер", "type": "top"},
    3: {"id": "dress", "name": "Платье", "type": "full"},
    4: {"id": "coat", "name": "Пальто", "type": "top"},
    5: {"id": "sandal", "name": "Сандалии", "type": "shoes"},
    6: {"id": "shirt", "name": "Рубашка", "type": "top"},
    7: {"id": "sneaker", "name": "Кроссовки", "type": "shoes"},
    8: {"id": "bag", "name": "Сумка", "type": "accessory"},
    9: {"id": "ankle-boot", "name": "Ботинки", "type": "shoes"},
}


# =============================================================================
# АРХИТЕКТУРА НЕЙРОННОЙ СЕТИ (CNN)
# =============================================================================
class FashionCNN(nn.Module):
    """
    Сверточная нейронная сеть для классификации одежды.
    
    Архитектура:
    - 2 сверточных слоя с max pooling
    - 2 полносвязных слоя
    - Dropout для регуляризации
    
    Вход: 28x28 grayscale изображение
    Выход: 10 классов
    """
    def __init__(self):
        super(FashionCNN, self).__init__()
        
        # Первый сверточный блок: 1 -> 32 каналов
        self.conv1 = nn.Conv2d(1, 32, kernel_size=3, padding=1)
        self.bn1 = nn.BatchNorm2d(32)
        
        # Второй сверточный блок: 32 -> 64 каналов
        self.conv2 = nn.Conv2d(32, 64, kernel_size=3, padding=1)
        self.bn2 = nn.BatchNorm2d(64)
        
        # Третий сверточный блок: 64 -> 128 каналов
        self.conv3 = nn.Conv2d(64, 128, kernel_size=3, padding=1)
        self.bn3 = nn.BatchNorm2d(128)
        
        # Max pooling
        self.pool = nn.MaxPool2d(2, 2)
        
        # Dropout для регуляризации
        self.dropout = nn.Dropout(0.25)
        
        # Полносвязные слои
        # После 3 pooling слоёв: 28/2/2/2 = 3.5, но у нас только 2 pooling = 7x7
        self.fc1 = nn.Linear(128 * 7 * 7, 256)
        self.fc2 = nn.Linear(256, 10)
    
    def forward(self, x):
        # Conv1 -> BN -> ReLU -> Pool
        x = self.pool(F.relu(self.bn1(self.conv1(x))))
        
        # Conv2 -> BN -> ReLU -> Pool
        x = self.pool(F.relu(self.bn2(self.conv2(x))))
        
        # Conv3 -> BN -> ReLU (без pool)
        x = F.relu(self.bn3(self.conv3(x)))
        
        # Flatten
        x = x.view(-1, 128 * 7 * 7)
        
        # FC1 -> ReLU -> Dropout
        x = self.dropout(F.relu(self.fc1(x)))
        
        # FC2 (выходной слой)
        x = self.fc2(x)
        
        return x


# =============================================================================
# КЛАССИФИКАТОР ОДЕЖДЫ
# =============================================================================
class ClothingClassifier:
    """
    Классификатор одежды на основе Fashion-MNIST.
    
    Использование:
        classifier = ClothingClassifier()
        category = classifier.predict("path/to/image.jpg")
    """
    
    def __init__(self, model_path: str = None):
        """
        Инициализация классификатора.
        
        Args:
            model_path: Путь к файлу весов модели (.pth)
        """
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = FashionCNN().to(self.device)
        
        # Путь к модели по умолчанию
        if model_path is None:
            model_path = os.path.join(
                os.path.dirname(__file__), 
                "weights", 
                "fashion_mnist_cnn.pth"
            )
        
        self.model_path = model_path
        self.model_loaded = False
        
        # Пытаемся загрузить веса
        if os.path.exists(model_path):
            self._load_model()
        else:
            print(f"⚠️ Модель не найдена: {model_path}")
            print("   Запустите train_fashion_mnist.py для обучения")
        
        # Трансформации для входного изображения
        self.transform = transforms.Compose([
            transforms.Resize((28, 28)),
            transforms.Grayscale(num_output_channels=1),
            transforms.ToTensor(),
            transforms.Normalize((0.5,), (0.5,))
        ])
    
    def _load_model(self):
        """Загружает веса модели."""
        try:
            self.model.load_state_dict(
                torch.load(self.model_path, map_location=self.device)
            )
            self.model.eval()
            self.model_loaded = True
            print(f"✅ Модель загружена: {self.model_path}")
        except Exception as e:
            print(f"❌ Ошибка загрузки модели: {e}")
            self.model_loaded = False
    
    def predict(self, image_path: str) -> dict:
        """
        Классифицирует изображение одежды.
        
        Args:
            image_path: Путь к изображению
            
        Returns:
            dict: {"id": "t-shirt", "name": "Футболка", "type": "top", "confidence": 0.95}
        """
        if not self.model_loaded:
            return {"id": "unknown", "name": "Неизвестно", "type": "other", "confidence": 0.0}
        
        try:
            # Загружаем и преобразуем изображение
            image = Image.open(image_path).convert("RGB")
            image_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            # Делаем предсказание
            with torch.no_grad():
                outputs = self.model(image_tensor)
                probabilities = F.softmax(outputs, dim=1)
                confidence, predicted = torch.max(probabilities, 1)
                
                class_id = predicted.item()
                conf = confidence.item()
            
            # Получаем информацию о классе
            class_info = FASHION_MNIST_CLASSES.get(class_id, {
                "id": "unknown", "name": "Неизвестно", "type": "other"
            })
            
            return {
                "id": class_info["id"],
                "name": class_info["name"],
                "type": class_info["type"],
                "confidence": round(conf, 4)
            }
            
        except Exception as e:
            print(f"❌ Ошибка классификации: {e}")
            return {"id": "unknown", "name": "Неизвестно", "type": "other", "confidence": 0.0}
    
    def predict_top_k(self, image_path: str, k: int = 3) -> list:
        """
        Возвращает топ-K предсказаний.
        
        Args:
            image_path: Путь к изображению
            k: Количество предсказаний
            
        Returns:
            list: Список из k предсказаний с уверенностью
        """
        if not self.model_loaded:
            return []
        
        try:
            image = Image.open(image_path).convert("RGB")
            image_tensor = self.transform(image).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                outputs = self.model(image_tensor)
                probabilities = F.softmax(outputs, dim=1)
                top_probs, top_classes = torch.topk(probabilities, k)
            
            results = []
            for i in range(k):
                class_id = top_classes[0][i].item()
                conf = top_probs[0][i].item()
                class_info = FASHION_MNIST_CLASSES.get(class_id, {
                    "id": "unknown", "name": "Неизвестно", "type": "other"
                })
                results.append({
                    "id": class_info["id"],
                    "name": class_info["name"],
                    "type": class_info["type"],
                    "confidence": round(conf, 4)
                })
            
            return results
            
        except Exception as e:
            print(f"❌ Ошибка классификации: {e}")
            return []


# =============================================================================
# SINGLETON INSTANCE
# =============================================================================
_classifier_instance = None

def get_classifier() -> ClothingClassifier:
    """
    Возвращает singleton экземпляр классификатора.
    Модель загружается только один раз при первом вызове.
    """
    global _classifier_instance
    if _classifier_instance is None:
        _classifier_instance = ClothingClassifier()
    return _classifier_instance
