# =============================================================================
# WEATHER SERVICE (weather.py) - Open-Meteo
# =============================================================================
# Сервис для получения погоды через Open-Meteo API (бесплатно, без ключа).
# Работает по координатам.
# =============================================================================

import httpx
from typing import Optional, Tuple

# Базовые URL
OPEN_METEO_URL = "https://api.open-meteo.com/v1/forecast"
GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search"
REVERSE_GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/reverse"


async def get_weather_by_coords(lat: float, lon: float) -> dict:
    """
    Получает погоду по координатам через Open-Meteo.
    
    Args:
        lat: Широта
        lon: Долгота
        
    Returns:
        dict: Погода с температурой и категорией
    """
    try:
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,weather_code,apparent_temperature",
            "timezone": "auto"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(OPEN_METEO_URL, params=params)
            
            if response.status_code != 200:
                return _get_fallback_weather("Unknown")
            
            data = response.json()
        
        current = data.get("current", {})
        temp = current.get("temperature_2m", 20)
        feels_like = current.get("apparent_temperature", temp)
        weather_code = current.get("weather_code", 0)
        
        return {
            "temp": round(temp, 1),
            "feels_like": round(feels_like, 1),
            "description": weather_code_to_description(weather_code),
            "icon": weather_code_to_icon(weather_code),
            "category": temp_to_category(temp),
            "coords": {"lat": lat, "lon": lon}
        }
        
    except Exception as e:
        print(f"❌ Ошибка Open-Meteo: {e}")
        return _get_fallback_weather("Unknown")


async def get_weather(city: str) -> dict:
    """
    Получает погоду для города (сначала геокодирует, потом запрашивает).
    """
    try:
        # Геокодируем город
        coords = await geocode_city(city)
        if not coords:
            return _get_fallback_weather(city)
        
        lat, lon = coords
        weather = await get_weather_by_coords(lat, lon)
        weather["city"] = city
        return weather
        
    except Exception as e:
        print(f"❌ Ошибка получения погоды: {e}")
        return _get_fallback_weather(city)


async def geocode_city(city: str) -> Optional[Tuple[float, float]]:
    """
    Геокодирует название города в координаты.
    """
    try:
        params = {
            "name": city,
            "count": 1,
            "language": "ru"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(GEOCODING_URL, params=params)
            data = response.json()
        
        results = data.get("results", [])
        if results:
            return (results[0]["latitude"], results[0]["longitude"])
        return None
        
    except Exception as e:
        print(f"❌ Ошибка геокодирования: {e}")
        return None


async def reverse_geocode(lat: float, lon: float) -> Optional[str]:
    """
    Обратное геокодирование: координаты -> название города.
    Использует Nominatim (OpenStreetMap).
    """
    try:
        # Open-Meteo не поддерживает reverse geocoding, используем Nominatim
        nominatim_url = "https://nominatim.openstreetmap.org/reverse"
        params = {
            "lat": lat,
            "lon": lon,
            "format": "json",
            "accept-language": "ru"
        }
        headers = {
            "User-Agent": "WardrobeAI/1.0"
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(nominatim_url, params=params, headers=headers)
            data = response.json()
        
        address = data.get("address", {})
        # Приоритет: city > town > village > state
        city = address.get("city") or address.get("town") or address.get("village") or address.get("state")
        return city
        
    except Exception as e:
        print(f"❌ Ошибка reverse geocoding: {e}")
        return None


def temp_to_category(temp: float) -> str:
    """Температура -> категория для генерации."""
    if temp < 5:
        return "cold"
    elif temp < 15:
        return "cool"
    elif temp < 25:
        return "warm"
    else:
        return "hot"


def category_to_russian(category: str) -> str:
    """Категория на русском."""
    mapping = {
        "cold": "Холодно",
        "cool": "Прохладно",
        "warm": "Тепло",
        "hot": "Жарко"
    }
    return mapping.get(category, "Тепло")


def weather_code_to_description(code: int) -> str:
    """WMO Weather Code -> описание на русском."""
    codes = {
        0: "ясно",
        1: "преимущественно ясно",
        2: "переменная облачность",
        3: "облачно",
        45: "туман",
        48: "изморозь",
        51: "лёгкая морось",
        53: "морось",
        55: "сильная морось",
        61: "небольшой дождь",
        63: "дождь",
        65: "сильный дождь",
        71: "небольшой снег",
        73: "снег",
        75: "сильный снег",
        80: "ливень",
        81: "сильный ливень",
        82: "очень сильный ливень",
        95: "гроза",
        96: "гроза с градом",
        99: "сильная гроза с градом"
    }
    return codes.get(code, "переменная облачность")


def weather_code_to_icon(code: int) -> str:
    """WMO Weather Code -> emoji иконка."""
    if code == 0:
        return "☀️"
    elif code in [1, 2]:
        return "⛅"
    elif code == 3:
        return "☁️"
    elif code in [45, 48]:
        return "🌫️"
    elif code in [51, 53, 55, 61, 63, 65, 80, 81, 82]:
        return "🌧️"
    elif code in [71, 73, 75]:
        return "❄️"
    elif code in [95, 96, 99]:
        return "⛈️"
    return "🌤️"


def _get_fallback_weather(city: str) -> dict:
    """Заглушка при ошибке."""
    return {
        "temp": 20,
        "feels_like": 18,
        "description": "данные недоступны",
        "icon": "🌤️",
        "city": city,
        "category": "warm"
    }
