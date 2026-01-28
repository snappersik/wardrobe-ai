import {
    Search,
    ArrowLeft,
    Eye,
    EyeOff,
    Wand2, // WandSparkles mapping
    PlayCircle,
    Check,
    Sparkles,
    LayoutGrid,
    Shirt,
    Mail,
    Lock,
    SlidersHorizontal,
    Plus,
    Trash2,
    X,
    Upload,
    Camera
} from 'lucide-react';

const icons = {
    'search': Search,
    'arrow-left': ArrowLeft,
    'eye': Eye,
    'eye-off': EyeOff,
    'wand-sparkles': Wand2, // Lucide doesn't have exact WandSparkles, Wand2 is close
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
    'camera': Camera
};

export default function Icon({ name, className, size = 24 }) {
    const LucideIcon = icons[name];

    if (!LucideIcon) {
        console.warn(`Icon "${name}" not found`);
        return null;
    }

    // Extract size from className if possible or use prop
    // Simple implementation: render directly
    return <LucideIcon className={className} size={size} />;
}
