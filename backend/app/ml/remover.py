import os
from rembg import remove, new_session
from PIL import Image
import io

class BackgroundRemover:
    """
    Класс для автоматического удаления фона с изображений.
    Использует библиотеку rembg (модель u2net).
    """
    
    def __init__(self, model_name: str = "u2net"):
        # u2net - стандартная качественная модель
        # u2netp - облегченная версия
        self.session = new_session(model_name)

    def remove_background(self, input_path: str, output_path: str):
        """
        Читает изображение, удаляет фон и сохраняет результат в PNG.
        """
        try:
            with open(input_path, 'rb') as i:
                input_data = i.read()
                
            # Удаляем фон
            output_data = remove(input_data, session=self.session)
            
            # Сохраняем результат
            with open(output_path, 'wb') as o:
                o.write(output_data)
                
            return True
        except Exception as e:
            print(f"[!] Error removing background: {e}")
            return False

    def remove_background_from_bytes(self, image_bytes: bytes) -> bytes:
        """
        Удаляет фон из байтового массива изображения.
        """
        return remove(image_bytes, session=self.session)

# Глобальный экземпляр для переиспользования сессии
remover = None

def get_remover():
    global remover
    if remover is None:
        remover = BackgroundRemover()
    return remover
