# =============================================================================
# MULTI-HEAD RESNET-50 КЛАССИФИКАТОР (fashion_classifier.py)
# =============================================================================
# Двухголовый классификатор на базе ResNet-50 (ImageNet pretrained):
#   Head 1: Категория одежды (46 DeepFashion классов)
#   Head 2: Стиль одежды (7 Kaggle Fashion Product классов)
#
# Сезон, температура и влагозащита определяются через attribute_mappings.py
# =============================================================================

import os
import sys
import logging
from typing import Optional, Dict, List

import torch
import torch.nn as nn
from torchvision import transforms, models
from PIL import Image

from app.ml.attribute_mappings import (
    DEEPFASHION_CATEGORIES,
    CATEGORY_NAME_RU,
    CATEGORY_TYPE,
    get_attributes_for_category,
)

logger = logging.getLogger(__name__)

# Количество классов
NUM_CATEGORY_CLASSES = 46   # DeepFashion категории
NUM_STYLE_CLASSES = 7       # Kaggle: casual, formal, sport, party, ethnic, street, vintage

STYLE_CLASSES = {
    0: "casual",
    1: "formal",
    2: "sport",
    3: "party",
    4: "ethnic",
    5: "street",
    6: "vintage",
}


# =============================================================================
# АРХИТЕКТУРА: MultiHeadResNet50
# =============================================================================
class MultiHeadResNet50(nn.Module):
    """
    ResNet-50 с двумя классификационными головами.
    
    Общий backbone (ResNet-50 без fc):
        - Pretrained на ImageNet
        - Fine-tune последние 2 блока (layer3, layer4)
    
    Head 1 (category_head): 2048 -> 512 -> 46
    Head 2 (style_head):    2048 -> 256 -> 7
    """
    
    def __init__(self, num_categories: int = NUM_CATEGORY_CLASSES,
                 num_styles: int = NUM_STYLE_CLASSES,
                 pretrained: bool = True):
        super().__init__()
        
        # Загружаем ResNet-50 с предобученными весами ImageNet
        if pretrained:
            weights = models.ResNet50_Weights.IMAGENET1K_V2
            backbone = models.resnet50(weights=weights)
        else:
            backbone = models.resnet50(weights=None)
        
        # Убираем последний fc слой, оставляем feature extractor
        self.features = nn.Sequential(*list(backbone.children())[:-1])
        
        # Замораживаем ранние слои (conv1, bn1, layer1, layer2)
        # Fine-tune только layer3, layer4
        for name, param in self.features.named_parameters():
            if not any(layer in name for layer in ['layer3', 'layer4']):
                param.requires_grad = False
        
        # Head 1: Категория одежды
        self.category_head = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(2048, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.2),
            nn.Linear(512, num_categories),
        )
        
        # Head 2: Стиль одежды
        self.style_head = nn.Sequential(
            nn.Dropout(0.3),
            nn.Linear(2048, 256),
            nn.ReLU(inplace=True),
            nn.Dropout(0.2),
            nn.Linear(256, num_styles),
        )
    
    def forward(self, x):
        """
        Returns:
            category_logits: (batch, 46)
            style_logits: (batch, 7)
        """
        features = self.features(x)           # (batch, 2048, 1, 1)
        features = features.flatten(1)        # (batch, 2048)
        
        category_logits = self.category_head(features)
        style_logits = self.style_head(features)
        
        return category_logits, style_logits


# =============================================================================
# ПРЕДОБРАБОТКА ИЗОБРАЖЕНИЙ
# =============================================================================
TRANSFORM_INFERENCE = transforms.Compose([
    transforms.Resize(256),
    transforms.CenterCrop(224),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485, 0.456, 0.406],
        std=[0.229, 0.224, 0.225],
    ),
])


# =============================================================================
# КЛАССИФИКАТОР (высокоуровневый API)
# =============================================================================
class FashionClassifier:
    """
    Высокоуровневый классификатор одежды.
    
    Использование:
        classifier = FashionClassifier()
        result = classifier.predict("path/to/image.jpg")
        # result = {
        #     "id": "hoodie",
        #     "name": "Худи",
        #     "type": "top",
        #     "confidence": 0.92,
        #     "style": "casual",
        #     "style_confidence": 0.85,
        #     "seasons": ["fall", "winter"],
        #     "temp_min": 0,
        #     "temp_max": 18,
        #     "waterproof_level": 1,
        # }
    """
    
    def __init__(self, model_path: Optional[str] = None):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self.model_loaded = False
        
        # Пути к весам (приоритет: аргумент -> стандартный путь)
        if model_path is None:
            base_dir = os.path.dirname(os.path.abspath(__file__))
            model_path = os.path.join(base_dir, "weights", "fashion_resnet50.pth")
        
        self.model_path = model_path
        self._load_model()
    
    def _load_model(self):
        """Загружает модель. Если весов нет — работает в ImageNet-only режиме."""
        self.model = MultiHeadResNet50(pretrained=True)
        
        if os.path.exists(self.model_path):
            try:
                state_dict = torch.load(self.model_path, map_location=self.device, weights_only=True)
                self.model.load_state_dict(state_dict)
                self.model_loaded = True
                logger.info(f"✅ Fashion ResNet-50 weights loaded from {self.model_path}")
            except Exception as e:
                logger.warning(f"⚠️ Could not load weights: {e}. Using ImageNet backbone only.")
                self.model_loaded = False
        else:
            logger.warning(
                f"⚠️ No fine-tuned weights at {self.model_path}. "
                "Using ImageNet backbone only (predictions may be less accurate)."
            )
            self.model_loaded = False
        
        self.model.to(self.device)
        self.model.eval()
    
    def predict(self, image_path: str) -> dict:
        """
        Классифицирует изображение одежды.
        
        Returns:
            dict с категорией, стилем и атрибутами из справочника.
        """
        try:
            img = Image.open(image_path).convert("RGB")
        except Exception as e:
            logger.error(f"Cannot open image {image_path}: {e}")
            return self._fallback_result()
        
        input_tensor = TRANSFORM_INFERENCE(img).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            cat_logits, style_logits = self.model(input_tensor)
        
        # Категория
        cat_probs = torch.softmax(cat_logits, dim=1)[0]
        cat_idx = cat_probs.argmax().item()
        cat_conf = cat_probs[cat_idx].item()
        category_id = DEEPFASHION_CATEGORIES.get(cat_idx, "tee")
        
        # Стиль
        style_probs = torch.softmax(style_logits, dim=1)[0]
        style_idx = style_probs.argmax().item()
        style_conf = style_probs[style_idx].item()
        style_id = STYLE_CLASSES.get(style_idx, "casual")
        
        # Атрибуты из справочника
        attrs = get_attributes_for_category(category_id)
        
        return {
            "id": category_id,
            "name": CATEGORY_NAME_RU.get(category_id, category_id),
            "type": attrs["type"],
            "confidence": round(cat_conf, 4),
            "style": style_id,
            "style_confidence": round(style_conf, 4),
            "seasons": attrs["seasons"],
            "temp_min": attrs["temp_min"],
            "temp_max": attrs["temp_max"],
            "waterproof_level": attrs["waterproof_level"],
        }
    
    def predict_top_k(self, image_path: str, k: int = 5) -> List[dict]:
        """Возвращает топ-K предсказаний категории."""
        try:
            img = Image.open(image_path).convert("RGB")
        except Exception:
            return [self._fallback_result()]
        
        input_tensor = TRANSFORM_INFERENCE(img).unsqueeze(0).to(self.device)
        
        with torch.no_grad():
            cat_logits, style_logits = self.model(input_tensor)
        
        cat_probs = torch.softmax(cat_logits, dim=1)[0]
        top_k = torch.topk(cat_probs, min(k, len(cat_probs)))
        
        results = []
        for idx, conf in zip(top_k.indices.tolist(), top_k.values.tolist()):
            cat_id = DEEPFASHION_CATEGORIES.get(idx, "tee")
            attrs = get_attributes_for_category(cat_id)
            results.append({
                "id": cat_id,
                "name": CATEGORY_NAME_RU.get(cat_id, cat_id),
                "type": attrs["type"],
                "confidence": round(conf, 4),
            })
        
        return results
    
    @staticmethod
    def _fallback_result() -> dict:
        """Результат по умолчанию при ошибке."""
        return {
            "id": "tee",
            "name": "Футболка",
            "type": "top",
            "confidence": 0.0,
            "style": "casual",
            "style_confidence": 0.0,
            "seasons": ["spring", "summer", "fall"],
            "temp_min": 15,
            "temp_max": 35,
            "waterproof_level": 0,
        }


# =============================================================================
import threading

# SINGLETON + ОБРАТНАЯ СОВМЕСТИМОСТЬ
# =============================================================================
_fashion_classifier_instance = None
_fashion_classifier_lock = threading.Lock()


def get_fashion_classifier() -> FashionClassifier:
    """Возвращает singleton экземпляр FashionClassifier (thread-safe)."""
    global _fashion_classifier_instance
    if _fashion_classifier_instance is None:
        with _fashion_classifier_lock:
            if _fashion_classifier_instance is None:
                _fashion_classifier_instance = FashionClassifier()
    return _fashion_classifier_instance
