# =============================================================================
# STYLE MATCHER - Матрица совместимости стилей одежды
# =============================================================================
# Определяет, насколько хорошо сочетаются вещи разных стилей.
# Например: casual + business = 30%, casual + casual = 100%
# =============================================================================

from typing import List, Optional

# =============================================================================
# МАТРИЦА СОВМЕСТИМОСТИ СТИЛЕЙ
# =============================================================================
# Значения от 0.0 (категорически не сочетаются) до 1.0 (идеально)
# 
# Стили в приложении:
# - casual (повседневный)
# - business (деловой)
# - sport (спортивный)
# - evening (вечерний)
# - street (уличный)

STYLE_COMPATIBILITY = {
    "casual": {
        "casual": 1.0,
        "business": 0.4,   # Можно комбинировать для smart casual
        "sport": 0.6,      # Athleisure тренд
        "evening": 0.3,
        "street": 0.85,
    },
    "business": {
        "casual": 0.4,
        "business": 1.0,
        "sport": 0.15,     # Почти не сочетается
        "evening": 0.6,    # Деловой вечер
        "street": 0.25,
    },
    "sport": {
        "casual": 0.6,
        "business": 0.15,
        "sport": 1.0,
        "evening": 0.1,    # Категорически нет
        "street": 0.7,     # Streetwear + sport
    },
    "evening": {
        "casual": 0.3,
        "business": 0.6,
        "sport": 0.1,
        "evening": 1.0,
        "street": 0.2,
    },
    "street": {
        "casual": 0.85,
        "business": 0.25,
        "sport": 0.7,
        "evening": 0.2,
        "street": 1.0,
    },
}

# Русские названия для маппинга
STYLE_NAMES_RU = {
    "повседневный": "casual",
    "деловой": "business",
    "спортивный": "sport",
    "вечерний": "evening",
    "уличный": "street",
}


def normalize_style(style: str) -> str:
    """Нормализует название стиля к английскому варианту."""
    if not style:
        return "casual"
    
    s = style.lower().strip()
    
    # Проверяем русские названия
    if s in STYLE_NAMES_RU:
        return STYLE_NAMES_RU[s]
    
    # Проверяем английские
    if s in STYLE_COMPATIBILITY:
        return s
    
    # По умолчанию casual
    return "casual"


def get_style_compatibility(style1: str, style2: str) -> float:
    """
    Вычисляет совместимость двух стилей.
    
    Args:
        style1: Первый стиль
        style2: Второй стиль
        
    Returns:
        float: Коэффициент совместимости от 0.0 до 1.0
    """
    s1 = normalize_style(style1)
    s2 = normalize_style(style2)
    
    if s1 in STYLE_COMPATIBILITY and s2 in STYLE_COMPATIBILITY.get(s1, {}):
        return STYLE_COMPATIBILITY[s1][s2]
    
    # Обратная проверка
    if s2 in STYLE_COMPATIBILITY and s1 in STYLE_COMPATIBILITY.get(s2, {}):
        return STYLE_COMPATIBILITY[s2][s1]
    
    return 0.5  # Средняя совместимость для неизвестных стилей


def calculate_outfit_style_compatibility(styles_list: List[List[str]]) -> float:
    """
    Вычисляет общую совместимость стилей для образа.
    
    Args:
        styles_list: Список списков стилей для каждой вещи
                    Например: [["casual"], ["casual", "street"], ["sport"]]
        
    Returns:
        float: Средний коэффициент совместимости от 0.0 до 1.0
    """
    if not styles_list or len(styles_list) < 2:
        return 1.0
    
    # Собираем все уникальные стили со всех вещей
    all_styles = []
    for item_styles in styles_list:
        if item_styles:
            # Добавляем первый стиль каждой вещи как основной
            if isinstance(item_styles, list) and item_styles:
                all_styles.append(normalize_style(item_styles[0]))
            elif isinstance(item_styles, str):
                all_styles.append(normalize_style(item_styles))
    
    if len(all_styles) < 2:
        return 1.0
    
    # Вычисляем совместимость между всеми парами стилей
    total_compat = 0.0
    pair_count = 0
    
    for i in range(len(all_styles)):
        for j in range(i + 1, len(all_styles)):
            compat = get_style_compatibility(all_styles[i], all_styles[j])
            total_compat += compat
            pair_count += 1
    
    return total_compat / pair_count if pair_count > 0 else 1.0


def get_compatible_styles(base_style: str) -> List[tuple]:
    """
    Возвращает стили, совместимые с базовым, отсортированные по совместимости.
    
    Args:
        base_style: Базовый стиль
        
    Returns:
        List[tuple]: Список (стиль, score)
    """
    s = normalize_style(base_style)
    
    if s not in STYLE_COMPATIBILITY:
        return [("casual", 0.8)]
    
    compatibilities = STYLE_COMPATIBILITY[s]
    sorted_styles = sorted(compatibilities.items(), key=lambda x: x[1], reverse=True)
    
    return sorted_styles


# =============================================================================
# МАППИНГ ПОВОДОВ К СТИЛЯМ
# =============================================================================
# Для генератора: какие стили подходят для какого повода

OCCASION_STYLES = {
    "casual": ["casual", "street"],
    "work": ["business", "casual"],
    "party": ["evening", "street"],
    "date": ["casual", "evening"],
    "sport": ["sport", "street", "casual"],
}


def get_styles_for_occasion(occasion: str) -> List[str]:
    """
    Возвращает подходящие стили для повода.
    
    Args:
        occasion: Повод (casual, work, party, date, sport)
        
    Returns:
        List[str]: Список подходящих стилей
    """
    return OCCASION_STYLES.get(occasion, ["casual"])
