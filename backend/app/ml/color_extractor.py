# =============================================================================
# K-MEANS COLOR EXTRACTOR (color_extractor.py)
# =============================================================================
# Модуль для извлечения доминирующего цвета из изображения одежды
# с использованием кластеризации K-means.
# =============================================================================

import numpy as np
from PIL import Image
from sklearn.cluster import KMeans
from typing import Tuple, Dict, List

# =============================================================================
# МАППИНГ ЦВЕТОВ RGB -> НАЗВАНИЕ
# =============================================================================
# Базовые цвета для определения ближайшего названия
COLOR_MAP = {
    # Ахроматические - белый и вариации
    (255, 255, 255): ("белый", "white"),
    (250, 250, 250): ("белый", "white"),  # Почти белый
    (245, 245, 245): ("белый", "white"),  # Светло-белый
    (240, 240, 240): ("белый", "white"),  # Off-white
    (230, 230, 235): ("белый", "white"),  # Светло-серо-белый (для #e6e7eb)
    
    # Серые
    (0, 0, 0): ("чёрный", "black"),
    (40, 40, 40): ("чёрный", "black"),    # Почти чёрный
    (128, 128, 128): ("серый", "gray"),
    (180, 180, 180): ("светло-серый", "gray"),
    (80, 80, 80): ("тёмно-серый", "gray"),
    
    # Основные цвета
    (255, 0, 0): ("красный", "red"),
    (200, 0, 0): ("красный", "red"),
    (0, 255, 0): ("зелёный", "green"),
    (0, 200, 0): ("зелёный", "green"),
    (0, 0, 255): ("синий", "blue"),
    (0, 0, 200): ("синий", "blue"),
    
    # Вторичные цвета
    (255, 255, 0): ("жёлтый", "yellow"),
    (255, 0, 255): ("пурпурный", "purple"),
    (0, 255, 255): ("голубой", "blue"),
    
    # Популярные оттенки одежды
    (255, 165, 0): ("оранжевый", "orange"),
    (255, 140, 0): ("оранжевый", "orange"),
    (255, 192, 203): ("розовый", "pink"),
    (255, 105, 180): ("розовый", "pink"),
    (128, 0, 128): ("фиолетовый", "purple"),
    (148, 0, 211): ("фиолетовый", "purple"),
    (165, 42, 42): ("коричневый", "brown"),
    (139, 69, 19): ("коричневый", "brown"),
    (210, 180, 140): ("бежевый", "beige"),
    (245, 222, 179): ("бежевый", "beige"),
    (0, 128, 128): ("бирюзовый", "blue"),
    (128, 0, 0): ("бордовый", "red"),
    (0, 0, 128): ("тёмно-синий", "blue"),
    (25, 25, 112): ("тёмно-синий", "blue"),
    (128, 128, 0): ("оливковый", "green"),
    (107, 142, 35): ("оливковый", "green"),
    (255, 215, 0): ("золотой", "yellow"),
}


def _color_distance(c1: Tuple[int, int, int], c2: Tuple[int, int, int]) -> float:
    """Вычисляет евклидово расстояние между двумя цветами в RGB."""
    return np.sqrt(sum((a - b) ** 2 for a, b in zip(c1, c2)))


def find_closest_color_name(rgb: Tuple[int, int, int]) -> Tuple[str, str]:
    """
    Находит ближайшее название цвета для заданного RGB.
    
    Args:
        rgb: Кортеж (R, G, B) значений 0-255
        
    Returns:
        Tuple[str, str]: (название_ru, название_en)
    """
    min_distance = float('inf')
    closest_name = ("неизвестный", "unknown")
    
    for color_rgb, names in COLOR_MAP.items():
        distance = _color_distance(rgb, color_rgb)
        if distance < min_distance:
            min_distance = distance
            closest_name = names
    
    return closest_name


def extract_dominant_color(image_path: str, k: int = 3) -> Dict:
    """
    Извлекает доминирующий цвет из изображения с помощью K-means кластеризации.
    
    Алгоритм:
    1. Загружаем изображение и уменьшаем для скорости
    2. Удаляем прозрачные пиксели (для PNG)
    3. Применяем K-means с k кластерами
    4. Выбираем самый частый кластер
    5. Находим ближайшее название цвета
    
    Args:
        image_path: Путь к изображению
        k: Количество кластеров (по умолчанию 3)
        
    Returns:
        dict: {
            "rgb": [R, G, B],
            "hex": "#RRGGBB",
            "name_ru": "синий",
            "name_en": "blue"
        }
    """
    try:
        # Загружаем изображение
        img = Image.open(image_path)
        
        # Уменьшаем для скорости обработки
        img.thumbnail((150, 150))
        
        # Конвертируем в RGBA если нужно
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        # Получаем пиксели
        pixels = np.array(img)
        
        # Удаляем прозрачные пиксели (alpha < 128)
        # Reshape в (N, 4) - RGBA
        flat_pixels = pixels.reshape(-1, 4)
        
        # Фильтруем непрозрачные пиксели
        opaque_mask = flat_pixels[:, 3] > 128
        rgb_pixels = flat_pixels[opaque_mask][:, :3]
        
        if len(rgb_pixels) < k:
            # Недостаточно пикселей
            return {
                "rgb": [128, 128, 128],
                "hex": "#808080",
                "name_ru": "серый",
                "name_en": "gray"
            }
        
        # K-means кластеризация
        kmeans = KMeans(n_clusters=k, n_init=10, random_state=42)
        kmeans.fit(rgb_pixels)
        
        # Находим самый большой кластер
        labels, counts = np.unique(kmeans.labels_, return_counts=True)
        dominant_cluster = labels[np.argmax(counts)]
        
        # Получаем центр доминирующего кластера
        dominant_rgb = kmeans.cluster_centers_[dominant_cluster].astype(int)
        
        # Находим название цвета
        name_ru, name_en = find_closest_color_name(tuple(dominant_rgb))
        
        # Формируем HEX
        hex_color = "#{:02x}{:02x}{:02x}".format(*dominant_rgb)
        
        return {
            "rgb": dominant_rgb.tolist(),
            "hex": hex_color,
            "name_ru": name_ru,
            "name_en": name_en
        }
        
    except Exception as e:
        print(f"❌ Ошибка извлечения цвета: {e}")
        return {
            "rgb": [128, 128, 128],
            "hex": "#808080",
            "name_ru": "неизвестный",
            "name_en": "unknown"
        }


def extract_color_palette(image_path: str, k: int = 5) -> List[Dict]:
    """
    Извлекает палитру из k цветов изображения.
    
    Args:
        image_path: Путь к изображению
        k: Количество цветов в палитре
        
    Returns:
        List[Dict]: Список цветов отсортированных по частоте
    """
    try:
        img = Image.open(image_path)
        img.thumbnail((150, 150))
        
        if img.mode != 'RGBA':
            img = img.convert('RGBA')
        
        pixels = np.array(img)
        flat_pixels = pixels.reshape(-1, 4)
        opaque_mask = flat_pixels[:, 3] > 128
        rgb_pixels = flat_pixels[opaque_mask][:, :3]
        
        if len(rgb_pixels) < k:
            return []
        
        kmeans = KMeans(n_clusters=k, n_init=10, random_state=42)
        kmeans.fit(rgb_pixels)
        
        # Подсчитываем частоту каждого кластера
        labels, counts = np.unique(kmeans.labels_, return_counts=True)
        
        # Сортируем по частоте
        sorted_indices = np.argsort(-counts)
        
        palette = []
        for idx in sorted_indices:
            rgb = kmeans.cluster_centers_[idx].astype(int)
            name_ru, name_en = find_closest_color_name(tuple(rgb))
            percentage = counts[idx] / len(rgb_pixels) * 100
            
            palette.append({
                "rgb": rgb.tolist(),
                "hex": "#{:02x}{:02x}{:02x}".format(*rgb),
                "name_ru": name_ru,
                "name_en": name_en,
                "percentage": round(percentage, 1)
            })
        
        return palette
        
    except Exception as e:
        print(f"❌ Ошибка извлечения палитры: {e}")
        return []


# =============================================================================
# SINGLETON INSTANCE
# =============================================================================
_extractor_instance = None

def get_color_extractor():
    """Возвращает singleton экземпляр (для совместимости с API)."""
    return {
        "extract_dominant_color": extract_dominant_color,
        "extract_color_palette": extract_color_palette
    }
