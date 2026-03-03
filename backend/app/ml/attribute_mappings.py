# =============================================================================
# МАППИНГ АТРИБУТОВ ОДЕЖДЫ (attribute_mappings.py)
# =============================================================================
# Словарные маппинги категория -> сезон, температура, влагозащита.
# Используется вместо ML-предсказания для этих атрибутов.
# =============================================================================

from typing import Dict, List, Tuple, Optional


# =============================================================================
# DEEPFASHION 46 КАТЕГОРИЙ -> ID МАППИНГ
# =============================================================================
DEEPFASHION_CATEGORIES = {
    0: "blouse",
    1: "blazer",
    2: "button-down",
    3: "cardigan",
    4: "flannel",
    5: "halter",
    6: "henley",
    7: "hoodie",
    8: "jacket",
    9: "jersey",
    10: "parka",
    11: "peacoat",
    12: "poncho",
    13: "sweater",
    14: "tank",
    15: "tee",
    16: "top",
    17: "turtleneck",
    18: "capris",
    19: "chinos",
    20: "culottes",
    21: "cutoffs",
    22: "gauchos",
    23: "jeans",
    24: "joggers",
    25: "leggings",
    26: "sarong",
    27: "shorts",
    28: "skirt",
    29: "sweatpants",
    30: "sweatshorts",
    31: "trunks",
    32: "coat",
    33: "dress",
    34: "jumpsuit",
    35: "kaftan",
    36: "kimono",
    37: "nightdress",
    38: "onesie",
    39: "robe",
    40: "romper",
    41: "shirtdress",
    42: "sundress",
    43: "boots",
    44: "sandal",
    45: "sneaker",
}

# Обратный маппинг: id -> index
CATEGORY_TO_INDEX = {v: k for k, v in DEEPFASHION_CATEGORIES.items()}


# =============================================================================
# КАТЕГОРИЯ -> ТИП (верх / низ / полное / обувь / аксессуар)
# =============================================================================
CATEGORY_TYPE: Dict[str, str] = {
    # Верх
    "blouse": "top", "blazer": "top", "button-down": "top",
    "cardigan": "top", "flannel": "top", "halter": "top",
    "henley": "top", "hoodie": "top", "jacket": "top",
    "jersey": "top", "parka": "top", "peacoat": "top",
    "poncho": "top", "sweater": "top", "tank": "top",
    "tee": "top", "top": "top", "turtleneck": "top",
    "coat": "top",
    # Низ
    "capris": "bottom", "chinos": "bottom", "culottes": "bottom",
    "cutoffs": "bottom", "gauchos": "bottom", "jeans": "bottom",
    "joggers": "bottom", "leggings": "bottom", "sarong": "bottom",
    "shorts": "bottom", "skirt": "bottom", "sweatpants": "bottom",
    "sweatshorts": "bottom", "trunks": "bottom",
    # Полное (верх + низ)
    "dress": "full", "jumpsuit": "full", "kaftan": "full",
    "kimono": "full", "nightdress": "full", "onesie": "full",
    "robe": "full", "romper": "full", "shirtdress": "full",
    "sundress": "full",
    # Обувь
    "boots": "shoes", "sandal": "shoes", "sneaker": "shoes",
}


# =============================================================================
# КАТЕГОРИЯ -> РУССКОЕ НАЗВАНИЕ
# =============================================================================
CATEGORY_NAME_RU: Dict[str, str] = {
    "blouse": "Блузка", "blazer": "Блейзер", "button-down": "Рубашка",
    "cardigan": "Кардиган", "flannel": "Фланелевая рубашка", "halter": "Топ-халтер",
    "henley": "Хенли", "hoodie": "Худи", "jacket": "Куртка",
    "jersey": "Джерси", "parka": "Парка", "peacoat": "Бушлат",
    "poncho": "Пончо", "sweater": "Свитер", "tank": "Майка",
    "tee": "Футболка", "top": "Топ", "turtleneck": "Водолазка",
    "capris": "Бриджи", "chinos": "Чиносы", "culottes": "Кюлоты",
    "cutoffs": "Шорты обрезные", "gauchos": "Гаучо", "jeans": "Джинсы",
    "joggers": "Джоггеры", "leggings": "Леггинсы", "sarong": "Саронг",
    "shorts": "Шорты", "skirt": "Юбка", "sweatpants": "Спортивные штаны",
    "sweatshorts": "Спортивные шорты", "trunks": "Плавки",
    "coat": "Пальто", "dress": "Платье", "jumpsuit": "Комбинезон",
    "kaftan": "Кафтан", "kimono": "Кимоно", "nightdress": "Ночная сорочка",
    "onesie": "Комбинезон (слитный)", "robe": "Халат", "romper": "Ромпер",
    "shirtdress": "Платье-рубашка", "sundress": "Сарафан",
    "boots": "Ботинки", "sandal": "Сандалии", "sneaker": "Кроссовки",
}


# =============================================================================
# КАТЕГОРИЯ -> СЕЗОНЫ (подходящие сезоны для типа одежды)
# =============================================================================
CATEGORY_SEASONS: Dict[str, List[str]] = {
    # Лёгкий верх — лето / весна
    "blouse": ["spring", "summer"], "halter": ["summer"],
    "tank": ["summer"], "tee": ["spring", "summer", "fall"],
    "top": ["spring", "summer"],
    # Средний верх — демисезон
    "button-down": ["spring", "summer", "fall"],
    "flannel": ["fall", "winter"], "henley": ["fall", "spring"],
    "jersey": ["spring", "fall"], "cardigan": ["spring", "fall"],
    "blazer": ["spring", "fall"],
    # Тёплый верх — зима
    "hoodie": ["fall", "winter"], "sweater": ["fall", "winter"],
    "turtleneck": ["fall", "winter"], "poncho": ["fall", "winter"],
    # Верхняя одежда
    "jacket": ["spring", "fall"], "coat": ["fall", "winter"],
    "parka": ["winter"], "peacoat": ["fall", "winter"],
    # Лёгкий низ
    "shorts": ["summer"], "cutoffs": ["summer"], "sweatshorts": ["summer"],
    "trunks": ["summer"], "skirt": ["spring", "summer"],
    "sarong": ["summer"], "culottes": ["spring", "summer"],
    "capris": ["spring", "summer"],
    # Средний / тёплый низ
    "jeans": ["spring", "summer", "fall", "winter"],
    "chinos": ["spring", "summer", "fall"],
    "joggers": ["spring", "fall"], "leggings": ["spring", "fall", "winter"],
    "sweatpants": ["fall", "winter"], "gauchos": ["spring", "summer"],
    # Платья / комбинезоны
    "dress": ["spring", "summer", "fall"],
    "sundress": ["summer"], "shirtdress": ["spring", "summer"],
    "jumpsuit": ["spring", "summer"], "romper": ["summer"],
    "kaftan": ["summer"], "kimono": ["spring", "summer"],
    "nightdress": ["spring", "summer", "fall", "winter"],
    "onesie": ["fall", "winter"], "robe": ["spring", "summer", "fall", "winter"],
    # Обувь
    "boots": ["fall", "winter"], "sandal": ["summer"],
    "sneaker": ["spring", "summer", "fall"],
}


# =============================================================================
# КАТЕГОРИЯ -> ДИАПАЗОН ТЕМПЕРАТУРЫ (°C)
# =============================================================================
CATEGORY_TEMP_RANGE: Dict[str, Tuple[int, int]] = {
    # Лёгкий верх
    "blouse": (18, 30), "halter": (25, 40), "tank": (25, 40),
    "tee": (15, 35), "top": (20, 35),
    # Средний верх
    "button-down": (12, 28), "flannel": (5, 18),
    "henley": (8, 22), "jersey": (10, 25), "cardigan": (8, 22),
    "blazer": (10, 25),
    # Тёплый верх
    "hoodie": (0, 18), "sweater": (0, 18),
    "turtleneck": (-5, 15), "poncho": (0, 15),
    # Верхняя одежда
    "jacket": (5, 20), "coat": (-10, 10),
    "parka": (-25, 5), "peacoat": (-10, 10),
    # Лёгкий низ
    "shorts": (22, 40), "cutoffs": (22, 40), "sweatshorts": (20, 35),
    "trunks": (25, 40), "skirt": (15, 35),
    "sarong": (25, 40), "culottes": (18, 32), "capris": (18, 32),
    # Средний / тёплый низ
    "jeans": (-5, 30), "chinos": (10, 30),
    "joggers": (5, 22), "leggings": (0, 25),
    "sweatpants": (-5, 18), "gauchos": (15, 30),
    # Платья / комбинезоны
    "dress": (12, 32), "sundress": (22, 38),
    "shirtdress": (15, 30), "jumpsuit": (15, 30),
    "romper": (22, 38), "kaftan": (25, 40),
    "kimono": (15, 30), "nightdress": (10, 30),
    "onesie": (-5, 15), "robe": (5, 25),
    # Обувь
    "boots": (-25, 15), "sandal": (20, 40), "sneaker": (5, 30),
}


# =============================================================================
# КАТЕГОРИЯ -> УРОВЕНЬ ВЛАГОЗАЩИТЫ (0-4)
# =============================================================================
# 0 = нет защиты, 1 = минимальная, 2 = средняя, 3 = хорошая, 4 = полная
CATEGORY_WATERPROOF: Dict[str, int] = {
    # Верх — без защиты
    "blouse": 0, "halter": 0, "tank": 0, "tee": 0, "top": 0,
    "button-down": 0, "flannel": 1, "henley": 0, "jersey": 0,
    "cardigan": 0, "blazer": 1, "sweater": 0, "turtleneck": 0,
    "poncho": 2,
    # Верхняя одежда — с защитой
    "hoodie": 1, "jacket": 2, "coat": 2, "parka": 4, "peacoat": 2,
    # Низ
    "shorts": 0, "cutoffs": 0, "sweatshorts": 0, "trunks": 3,
    "skirt": 0, "sarong": 0, "culottes": 0, "capris": 0,
    "jeans": 1, "chinos": 0, "joggers": 0, "leggings": 0,
    "sweatpants": 0, "gauchos": 0,
    # Платья / комбинезоны
    "dress": 0, "sundress": 0, "shirtdress": 0, "jumpsuit": 0,
    "romper": 0, "kaftan": 0, "kimono": 0, "nightdress": 0,
    "onesie": 1, "robe": 0,
    # Обувь
    "boots": 3, "sandal": 0, "sneaker": 1,
}


# =============================================================================
# KAGGLE FASHION PRODUCT IMAGES — МАППИНГ СТИЛЕЙ (usage -> style)
# =============================================================================
USAGE_TO_STYLE: Dict[str, str] = {
    "Casual": "casual",
    "Formal": "formal",
    "Sports": "sport",
    "Party": "party",
    "Smart Casual": "casual",
    "Ethnic": "ethnic",
    "Travel": "casual",
    "Home": "casual",
}


# =============================================================================
# ГРУППИРОВКА КАТЕГОРИЙ ДЛЯ ФРОНТЕНДА
# =============================================================================
CATEGORY_GROUPS = [
    {
        "group": "Верх",
        "icon": "shirt",
        "categories": [
            "tee", "top", "tank", "blouse", "button-down", "halter",
            "henley", "jersey", "flannel",
        ]
    },
    {
        "group": "Свитеры и кардиганы",
        "icon": "layers",
        "categories": [
            "sweater", "cardigan", "hoodie", "turtleneck", "poncho",
        ]
    },
    {
        "group": "Верхняя одежда",
        "icon": "shield",
        "categories": [
            "jacket", "coat", "blazer", "parka", "peacoat",
        ]
    },
    {
        "group": "Низ",
        "icon": "scissors",
        "categories": [
            "jeans", "chinos", "shorts", "skirt", "joggers", "leggings",
            "sweatpants", "culottes", "capris", "cutoffs", "sweatshorts",
            "sarong", "gauchos", "trunks",
        ]
    },
    {
        "group": "Платья и комбинезоны",
        "icon": "sparkles",
        "categories": [
            "dress", "sundress", "shirtdress", "jumpsuit", "romper",
            "kaftan", "kimono", "nightdress", "onesie", "robe",
        ]
    },
    {
        "group": "Обувь",
        "icon": "footprints",
        "categories": [
            "sneaker", "boots", "sandal",
        ]
    },
]


# =============================================================================
# ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ
# =============================================================================

def get_attributes_for_category(category_id: str) -> dict:
    """
    Получает все атрибуты для заданной категории.
    
    Returns:
        dict с ключами: type, name_ru, seasons, temp_min, temp_max, waterproof_level
    """
    return {
        "type": CATEGORY_TYPE.get(category_id, "other"),
        "name_ru": CATEGORY_NAME_RU.get(category_id, category_id),
        "seasons": CATEGORY_SEASONS.get(category_id, ["spring", "summer", "fall", "winter"]),
        "temp_min": CATEGORY_TEMP_RANGE.get(category_id, (0, 30))[0],
        "temp_max": CATEGORY_TEMP_RANGE.get(category_id, (0, 30))[1],
        "waterproof_level": CATEGORY_WATERPROOF.get(category_id, 0),
    }


def get_style_from_usage(usage: str) -> str:
    """Маппинг Kaggle usage label -> наш style ID."""
    return USAGE_TO_STYLE.get(usage, "casual")


# Маппинг старых Fashion-MNIST категорий в новые DeepFashion
FASHION_MNIST_TO_DEEPFASHION = {
    "t-shirt": "tee",
    "trouser": "jeans",
    "pullover": "sweater",
    "dress": "dress",
    "coat": "coat",
    "sandal": "sandal",
    "shirt": "button-down",
    "sneaker": "sneaker",
    "bag": "unknown",
    "ankle-boot": "boots",
}


def migrate_old_category(old_id: str) -> str:
    """Конвертирует старый Fashion-MNIST ID в новый DeepFashion ID."""
    return FASHION_MNIST_TO_DEEPFASHION.get(old_id, old_id)
