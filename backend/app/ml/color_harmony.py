# =============================================================================
# COLOR HARMONY - Правила сочетания цветов для генерации образов
# =============================================================================
# Модуль определяет, насколько хорошо сочетаются цвета между собой.
# Использует теорию цвета: комплементарные, аналогичные, нейтральные.
# =============================================================================

from typing import List, Tuple

# =============================================================================
# ЦВЕТОВОЕ КОЛЕСО (для вычисления гармонии)
# =============================================================================
# Порядок цветов на цветовом круге (12 основных оттенков)
COLOR_WHEEL = [
    "red", "orange", "yellow", "green", "blue", "purple"
]

# Позиции цветов на колесе (0-360 градусов, упрощённо 0-11)
COLOR_POSITIONS = {
    "red": 0,
    "orange": 1,
    "yellow": 2,
    "green": 3,
    "blue": 4,
    "purple": 5,
    # Оттенки основных цветов
    "pink": 0,      # Близок к красному
    "brown": 1,     # Близок к оранжевому
    "beige": 2,     # Близок к жёлтому
}

# =============================================================================
# НЕЙТРАЛЬНЫЕ ЦВЕТА
# =============================================================================
# Нейтральные цвета сочетаются со всем
NEUTRAL_COLORS = {"black", "white", "gray", "beige", "brown"}

# =============================================================================
# МАТРИЦА СОЧЕТАЕМОСТИ ЦВЕТОВ
# =============================================================================
# Прямое определение совместимости для точного контроля
# Значения от 0.0 (не сочетаются) до 1.0 (идеально)

COLOR_COMPATIBILITY = {
    # Нейтральные - сочетаются со всем отлично
    "black": {"black": 0.9, "white": 1.0, "gray": 0.95, "red": 0.95, "blue": 0.95, "green": 0.9, "yellow": 0.85, "orange": 0.8, "purple": 0.95, "pink": 0.9, "beige": 0.9, "brown": 0.85},
    "white": {"black": 1.0, "white": 0.8, "gray": 0.95, "red": 0.95, "blue": 1.0, "green": 0.9, "yellow": 0.85, "orange": 0.85, "purple": 0.9, "pink": 0.95, "beige": 0.95, "brown": 0.85},
    "gray": {"black": 0.95, "white": 0.95, "gray": 0.85, "red": 0.9, "blue": 0.95, "green": 0.85, "yellow": 0.8, "orange": 0.75, "purple": 0.9, "pink": 0.9, "beige": 0.85, "brown": 0.8},
    
    # Красные тона
    "red": {"black": 0.95, "white": 0.95, "gray": 0.9, "red": 0.7, "blue": 0.6, "green": 0.4, "yellow": 0.5, "orange": 0.6, "purple": 0.7, "pink": 0.8, "beige": 0.85, "brown": 0.7},
    "pink": {"black": 0.9, "white": 0.95, "gray": 0.9, "red": 0.8, "blue": 0.7, "green": 0.5, "yellow": 0.5, "orange": 0.5, "purple": 0.85, "pink": 0.7, "beige": 0.9, "brown": 0.6},
    
    # Синие тона
    "blue": {"black": 0.95, "white": 1.0, "gray": 0.95, "red": 0.6, "blue": 0.75, "green": 0.7, "yellow": 0.6, "orange": 0.65, "purple": 0.85, "pink": 0.7, "beige": 0.9, "brown": 0.85},
    "purple": {"black": 0.95, "white": 0.9, "gray": 0.9, "red": 0.7, "blue": 0.85, "green": 0.5, "yellow": 0.55, "orange": 0.5, "purple": 0.7, "pink": 0.85, "beige": 0.8, "brown": 0.6},
    
    # Тёплые тона
    "yellow": {"black": 0.85, "white": 0.85, "gray": 0.8, "red": 0.5, "blue": 0.6, "green": 0.7, "yellow": 0.6, "orange": 0.8, "purple": 0.55, "pink": 0.5, "beige": 0.85, "brown": 0.8},
    "orange": {"black": 0.8, "white": 0.85, "gray": 0.75, "red": 0.6, "blue": 0.65, "green": 0.55, "yellow": 0.8, "orange": 0.6, "purple": 0.5, "pink": 0.5, "beige": 0.85, "brown": 0.85},
    "brown": {"black": 0.85, "white": 0.85, "gray": 0.8, "red": 0.7, "blue": 0.85, "green": 0.8, "yellow": 0.8, "orange": 0.85, "purple": 0.6, "pink": 0.6, "beige": 0.95, "brown": 0.75},
    "beige": {"black": 0.9, "white": 0.95, "gray": 0.85, "red": 0.85, "blue": 0.9, "green": 0.85, "yellow": 0.85, "orange": 0.85, "purple": 0.8, "pink": 0.9, "beige": 0.8, "brown": 0.95},
    
    # Зелёные тона
    "green": {"black": 0.9, "white": 0.9, "gray": 0.85, "red": 0.4, "blue": 0.7, "green": 0.7, "yellow": 0.7, "orange": 0.55, "purple": 0.5, "pink": 0.5, "beige": 0.85, "brown": 0.8},
}


def get_color_harmony(color1: str, color2: str) -> float:
    """
    Вычисляет насколько хорошо сочетаются два цвета.
    
    Args:
        color1: Первый цвет (например "blue")
        color2: Второй цвет (например "white")
        
    Returns:
        float: Коэффициент сочетаемости от 0.0 до 1.0
    """
    # Нормализуем цвета к нижнему регистру
    c1 = color1.lower() if color1 else "gray"
    c2 = color2.lower() if color2 else "gray"
    
    # Проверяем прямое соответствие в матрице
    if c1 in COLOR_COMPATIBILITY and c2 in COLOR_COMPATIBILITY.get(c1, {}):
        return COLOR_COMPATIBILITY[c1][c2]
    
    # Проверяем обратное соответствие
    if c2 in COLOR_COMPATIBILITY and c1 in COLOR_COMPATIBILITY.get(c2, {}):
        return COLOR_COMPATIBILITY[c2][c1]
    
    # Если один из цветов нейтральный - хорошая совместимость
    if c1 in NEUTRAL_COLORS or c2 in NEUTRAL_COLORS:
        return 0.85
    
    # Для неизвестных цветов - средняя совместимость
    return 0.6


def calculate_outfit_color_harmony(colors: List[str]) -> float:
    """
    Вычисляет общую цветовую гармонию для набора цветов (весь образ).
    
    Args:
        colors: Список цветов всех вещей в образе
        
    Returns:
        float: Средний коэффициент гармонии от 0.0 до 1.0
    """
    if not colors or len(colors) < 2:
        return 1.0  # Один цвет - идеально
    
    # Убираем пустые значения и дубликаты
    valid_colors = [c for c in colors if c]
    if len(valid_colors) < 2:
        return 1.0
    
    # Вычисляем гармонию между всеми парами
    total_harmony = 0.0
    pair_count = 0
    
    for i in range(len(valid_colors)):
        for j in range(i + 1, len(valid_colors)):
            harmony = get_color_harmony(valid_colors[i], valid_colors[j])
            total_harmony += harmony
            pair_count += 1
    
    return total_harmony / pair_count if pair_count > 0 else 1.0


def get_harmonious_colors(base_color: str, count: int = 5) -> List[Tuple[str, float]]:
    """
    Возвращает список цветов, хорошо сочетающихся с базовым.
    
    Args:
        base_color: Базовый цвет
        count: Количество рекомендаций
        
    Returns:
        List[Tuple[str, float]]: Список (цвет, score)
    """
    c = base_color.lower() if base_color else "gray"
    
    if c not in COLOR_COMPATIBILITY:
        # Для неизвестных цветов возвращаем нейтральные
        return [(color, 0.85) for color in list(NEUTRAL_COLORS)[:count]]
    
    # Сортируем по совместимости
    compatibilities = COLOR_COMPATIBILITY[c]
    sorted_colors = sorted(compatibilities.items(), key=lambda x: x[1], reverse=True)
    
    return sorted_colors[:count]
