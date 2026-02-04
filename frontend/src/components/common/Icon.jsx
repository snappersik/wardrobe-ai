// =============================================================================
// КОМПОНЕНТ ИКОНОК (Icon.jsx)
// =============================================================================
// Универсальный компонент для отображения иконок.
// Использует библиотеку Lucide React (https://lucide.dev).
// Централизует все иконки в одном месте для удобства управления.
// =============================================================================

// Импорт иконок из библиотеки Lucide React
import {
    Search,           // Поиск (лупа)
    ArrowLeft,        // Стрелка назад
    Eye,              // Глаз (показать пароль)
    EyeOff,           // Глаз перечёркнутый (скрыть пароль)
    Wand2,            // Волшебная палочка (AI генерация)
    PlayCircle,       // Play кнопка
    Check,            // Галочка
    Sparkles,         // Искры (эффекты)
    LayoutGrid,       // Сетка
    Shirt,            // Рубашка (одежда)
    Mail,             // Письмо (email)
    Lock,             // Замок (пароль)
    SlidersHorizontal, // Слайдеры (настройки)
    Plus,             // Плюс (добавить)
    Trash2,           // Корзина (удалить)
    X,                // Крестик (закрыть)
    Upload,           // Загрузка файла
    Camera,           // Камера
    Layers,           // Слои
    PlusSquare,       // Плюс в квадрате
    Calendar,         // Календарь
    User,             // Пользователь
    Image,            // Изображение (галерея)
    Download,         // Скачать
    Info,             // Информация
    Inbox,            // Пустой inbox
    AlertTriangle,    // Предупреждение
    Save,             // Сохранить
    Footprints,       // Следы (обувь)
    RectangleVertical, // Прямоугольник (брюки)
    HelpCircle,       // Вопрос (помощь)
    ShoppingBag,      // Сумка
    Pencil,           // Карандаш (редактировать)
    Sun,              // Солнце
    Briefcase,        // Портфель (работа)
    Music,            // Музыка (вечеринка)
    Heart,            // Сердце (свидание)
    Activity,         // Активность (спорт)
    CloudSnow,        // Облако со снегом
    Cloud,            // Облако
    Thermometer,      // Термометр
    ThumbsDown,       // Дизлайк
    ThumbsUp,         // Лайк
    Bookmark,         // Закладка
    MapPin,           // Метка на карте
    ChevronRight,     // Стрелка вправо
    ChevronLeft,      // Стрелка влево
    CloudSun          // Облако с солнцем
} from 'lucide-react';

// =============================================================================
// МАППИНГ НАЗВАНИЙ ИКОНОК
// =============================================================================
// Объект для маппинга строковых названий на компоненты иконок.
// Позволяет использовать иконки по имени: <Icon name="search" />
const icons = {
    'search': Search,
    'arrow-left': ArrowLeft,
    'eye': Eye,
    'eye-off': EyeOff,
    'wand-sparkles': Wand2,
    'circle-play': PlayCircle,
    'check': Check,
    'sparkles': Sparkles,
    'layout-grid': LayoutGrid,
    'shirt': Shirt,
    'mail': Mail,
    'lock': Lock,
    'sliders-horizontal': SlidersHorizontal,
    'plus': Plus,
    'trash': Trash2,
    'x': X,
    'upload': Upload,
    'camera': Camera,
    'layers': Layers,
    'plus-square': PlusSquare,
    'calendar': Calendar,
    'user': User,
    'image': Image,
    'download': Download,
    'info': Info,
    'inbox': Inbox,
    'alert-triangle': AlertTriangle,
    'save': Save,
    'footprints': Footprints,
    'trousers': RectangleVertical,
    'dress': Shirt,
    'jacket': Shirt,
    'vest': Shirt,
    'boot': Footprints,
    'help-circle': HelpCircle,
    'shopping-bag': ShoppingBag,
    'pencil': Pencil,
    'sun': Sun,
    'briefcase': Briefcase,
    'music': Music,
    'heart': Heart,
    'activity': Activity,
    'cloud-snow': CloudSnow,
    'cloud': Cloud,
    'thermometer': Thermometer,
    'thumbs-down': ThumbsDown,
    'thumbs-up': ThumbsUp,
    'bookmark': Bookmark,
    'map-pin': MapPin,
    'chevron-right': ChevronRight,
    'chevron-left': ChevronLeft,
    'cloud-sun': CloudSun
};

// =============================================================================
// КОМПОНЕНТ ИКОНКИ
// =============================================================================
/**
 * Универсальный компонент иконки.
 * 
 * @param {string} name - Название иконки (ключ из объекта icons)
 * @param {string} className - CSS классы для кастомизации
 * @param {number} size - Размер иконки в пикселях (по умолчанию 24)
 * @returns {JSX.Element|null} - Компонент иконки или null если не найдена
 * 
 * @example
 * <Icon name="search" size={20} className="text-gray-500" />
 */
export default function Icon({ name, className, size = 24 }) {
    // Получаем компонент иконки по имени
    const LucideIcon = icons[name];

    // Если иконка не найдена - предупреждаем в консоли
    if (!LucideIcon) {
        console.warn(`Icon "${name}" not found`);
        return null;
    }

    // Рендерим иконку с переданными параметрами
    return <LucideIcon className={className} size={size} />;
}
