import Icon from '../common/Icon';

// =============================================================================
// ПУСТОЕ СОСТОЯНИЕ ГАРДЕРОБА (EmptyState.jsx) — premium design
// =============================================================================

export default function EmptyState({ onAddClick }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-up">
            {/* Иллюстрация с gradient background и float animation */}
            <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl flex items-center justify-center animate-float shadow-lg shadow-pink-100/40">
                    <Icon name="hanger" size={56} className="text-primary/60" />
                </div>
                {/* Decorative dots */}
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary/20 rounded-full" />
                <div className="absolute -bottom-1 -left-3 w-4 h-4 bg-purple-200/60 rounded-full" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">Здесь пока пусто</h3>
            <p className="text-gray-400 max-w-xs mb-8 text-sm leading-relaxed">
                Ваш гардероб пуст. Добавьте свои любимые вещи, чтобы начать создавать образы.
            </p>

            <button
                onClick={onAddClick}
                className="btn btn-primary px-8 shadow-lg shadow-pink-200/50"
            >
                Добавить первую вещь
            </button>
        </div>
    )
}
