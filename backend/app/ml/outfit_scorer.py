# =============================================================================
# OUTFIT SCORER - ML оценка совместимости образов
# =============================================================================
# Объединяет все факторы для вычисления итогового score образа:
# - Цветовая гармония (40%)
# - Совместимость стилей (40%)
# - Соответствие погоде/сезону (20%)
# =============================================================================

from typing import List, Dict, Optional, Any
import json

from app.ml.color_harmony import calculate_outfit_color_harmony
from app.ml.style_matcher import (
    calculate_outfit_style_compatibility,
    get_styles_for_occasion
)

# =============================================================================
# КОНСТАНТЫ ВЕСОВ
# =============================================================================
WEIGHT_COLOR = 0.4      # Вес цветовой гармонии
WEIGHT_STYLE = 0.4      # Вес совместимости стилей  
WEIGHT_WEATHER = 0.2    # Вес соответствия погоде

# =============================================================================
# МАППИНГ ПОГОДЫ К СЕЗОНАМ
# =============================================================================
WEATHER_TO_SEASONS = {
    "cold": ["winter"],                    # < 5°C
    "cool": ["autumn", "spring", "winter"], # 5-15°C
    "warm": ["spring", "summer", "autumn"], # 15-25°C
    "hot": ["summer"],                      # > 25°C
}

# Русские названия сезонов
SEASON_NAMES = {
    "winter": "Зима",
    "spring": "Весна", 
    "summer": "Лето",
    "autumn": "Осень",
    "all": "Всесезонный",
}


def parse_json_field(value: Any) -> List[str]:
    """
    Парсит поле которое может быть строкой JSON или списком.
    """
    if not value:
        return []
    
    if isinstance(value, list):
        return value
    
    if isinstance(value, str):
        # Пробуем распарсить как JSON
        try:
            parsed = json.loads(value)
            if isinstance(parsed, list):
                return parsed
            return [str(parsed)]
        except (json.JSONDecodeError, TypeError):
            return [value]
    
    return []


def calculate_weather_compatibility(
    item_seasons: List[str],
    weather_category: str
) -> float:
    """
    Вычисляет насколько вещь подходит для текущей погоды.
    
    Args:
        item_seasons: Сезоны вещи (например ["summer", "spring"])
        weather_category: Категория погоды (cold, cool, warm, hot)
        
    Returns:
        float: Коэффициент соответствия от 0.0 до 1.0
    """
    if not item_seasons:
        return 0.7  # Без указания сезона - средняя совместимость
    
    # Получаем подходящие сезоны для погоды
    suitable_seasons = set(WEATHER_TO_SEASONS.get(weather_category, ["spring", "summer"]))
    item_season_set = set(s.lower() for s in item_seasons)
    
    # Проверяем "всесезонный"
    if "all" in item_season_set or "всесезонный" in item_season_set:
        return 1.0
    
    # Считаем пересечение
    intersection = item_season_set.intersection(suitable_seasons)
    
    if intersection:
        # Есть совпадение - хорошо
        return 0.9 + (len(intersection) / len(suitable_seasons)) * 0.1
    
    # Нет совпадения - плохо, но не критично
    return 0.3


def calculate_outfit_weather_score(
    items: List[Dict],
    weather_category: str
) -> float:
    """
    Вычисляет насколько весь образ подходит для погоды.
    
    Args:
        items: Список вещей с полем 'season'
        weather_category: Категория погоды
        
    Returns:
        float: Средний коэффициент соответствия
    """
    if not items:
        return 0.7
    
    total_score = 0.0
    
    for item in items:
        seasons = parse_json_field(item.get("season", []))
        score = calculate_weather_compatibility(seasons, weather_category)
        total_score += score
    
    return total_score / len(items)


def score_outfit(
    items: List[Dict],
    occasion: str = "casual",
    weather_category: str = "warm"
) -> Dict[str, float]:
    """
    Вычисляет полный score образа.
    
    Args:
        items: Список вещей (словари с color, style, season, category)
        occasion: Повод (casual, work, party, date, sport)
        weather_category: Категория погоды
        
    Returns:
        Dict с breakdown:
        {
            "total": 0.85,
            "color": 0.9,
            "style": 0.8,
            "weather": 0.85,
            "breakdown": "Цвета 90% | Стиль 80% | Погода 85%"
        }
    """
    if not items:
        return {
            "total": 0.0,
            "color": 0.0,
            "style": 0.0,
            "weather": 0.0,
            "breakdown": "Нет вещей"
        }
    
    # 1. Извлекаем цвета
    colors = []
    for item in items:
        item_colors = parse_json_field(item.get("color", []))
        if item_colors:
            colors.append(item_colors[0])  # Берём основной цвет
    
    color_score = calculate_outfit_color_harmony(colors)
    
    # 2. Извлекаем стили
    styles_list = []
    for item in items:
        item_styles = parse_json_field(item.get("style", []))
        styles_list.append(item_styles)
    
    style_score = calculate_outfit_style_compatibility(styles_list)
    
    # Учитываем соответствие стиля поводу
    target_styles = get_styles_for_occasion(occasion)
    occasion_bonus = 0.0
    
    for styles in styles_list:
        if styles:
            for style in styles:
                if style.lower() in target_styles:
                    occasion_bonus += 0.05
                    break
    
    style_score = min(1.0, style_score + occasion_bonus)
    
    # 3. Соответствие погоде
    weather_score = calculate_outfit_weather_score(items, weather_category)
    
    # 4. Итоговый score
    total = (
        color_score * WEIGHT_COLOR +
        style_score * WEIGHT_STYLE +
        weather_score * WEIGHT_WEATHER
    )
    
    # Формируем breakdown
    breakdown = f"Цвета {int(color_score * 100)}% | Стиль {int(style_score * 100)}% | Погода {int(weather_score * 100)}%"
    
    return {
        "total": round(total, 2),
        "color": round(color_score, 2),
        "style": round(style_score, 2),
        "weather": round(weather_score, 2),
        "breakdown": breakdown
    }


def filter_items_by_weather(
    items: List[Dict],
    weather_category: str,
    min_score: float = 0.4
) -> List[Dict]:
    """
    Фильтрует вещи, не подходящие для погоды.
    
    Args:
        items: Все вещи
        weather_category: Категория погоды
        min_score: Минимальный score для включения
        
    Returns:
        Отфильтрованный список вещей
    """
    filtered = []
    
    for item in items:
        seasons = parse_json_field(item.get("season", []))
        score = calculate_weather_compatibility(seasons, weather_category)
        
        if score >= min_score:
            filtered.append(item)
    
    # Если отфильтровали всё - возвращаем всё
    if not filtered:
        return items
    
    return filtered
