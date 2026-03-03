// =============================================================================
// МОДАЛКА УЛУЧШЕНИЯ ПЛАНА (UpgradeModal.jsx)
// =============================================================================
// Полноэкранная модалка с тарифными планами.
// Показывает текущий план и преимущества каждого тарифа.
// =============================================================================

import Icon from './Icon'

const PLANS = [
    {
        id: 'free',
        label: 'Free',
        labelRu: 'Бесплатный',
        price: '0 ₽',
        color: 'from-gray-400 to-gray-500',
        borderColor: 'border-gray-300',
        features: [
            { text: 'До 5 образов за генерацию', included: true },
            { text: '10 генераций в день', included: true },
            { text: 'Статистика гардероба', included: false },
            { text: 'Уведомления о неиспользуемых вещах', included: false },
            { text: 'Стоимость гардероба', included: false },
        ],
    },
    {
        id: 'basic',
        label: 'Basic',
        labelRu: 'Базовый',
        price: '199 ₽/мес',
        color: 'from-blue-500 to-indigo-600',
        borderColor: 'border-blue-400',
        popular: true,
        features: [
            { text: 'До 8 образов за генерацию', included: true },
            { text: 'Безлимитные генерации', included: true },
            { text: 'Статистика гардероба', included: false },
            { text: 'Уведомления о неиспользуемых вещах', included: false },
            { text: 'Стоимость гардероба', included: false },
        ],
    },
    {
        id: 'premium',
        label: 'Premium',
        labelRu: 'Премиум',
        price: '399 ₽/мес',
        color: 'from-amber-500 to-orange-600',
        borderColor: 'border-amber-400',
        features: [
            { text: 'До 10 образов за генерацию', included: true },
            { text: 'Безлимитные генерации', included: true },
            { text: 'Полная статистика гардероба', included: true },
            { text: 'Уведомления о неиспользуемых вещах', included: true },
            { text: 'Стоимость гардероба', included: true },
        ],
    },
]

/**
 * Полноэкранная модалка сравнения планов.
 *
 * @param {boolean} isOpen - Показать/скрыть
 * @param {function} onClose - Закрыть модалку
 * @param {string} currentPlan - Текущий план пользователя
 * @param {string} reason - Причина показа ('limit_reached' | 'upgrade')
 */
export default function UpgradeModal({ isOpen, onClose, currentPlan = 'free', reason = 'upgrade' }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
                {/* Header */}
                <div className="relative p-6 pb-2 text-center">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <Icon name="x" size={20} className="text-gray-500" />
                    </button>

                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 text-sm font-medium mb-3">
                        <Icon name="sparkles" size={16} />
                        {reason === 'limit_reached' ? 'Лимит генераций исчерпан' : 'Улучшите ваш план'}
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                        Выберите подходящий план
                    </h2>
                    <p className="text-gray-500 text-sm">
                        Разблокируйте больше образов, безлимитные генерации и статистику
                    </p>
                </div>

                {/* Plans */}
                <div className="p-6 pt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {PLANS.map(plan => {
                            const isCurrent = currentPlan === plan.id
                            const isUpgrade = PLANS.findIndex(p => p.id === plan.id) > PLANS.findIndex(p => p.id === currentPlan)

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative rounded-2xl border-2 p-5 transition-all ${isCurrent
                                            ? `${plan.borderColor} bg-gradient-to-b from-white to-gray-50 shadow-lg scale-[1.02]`
                                            : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                                        }`}
                                >
                                    {/* Popular badge */}
                                    {plan.popular && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-semibold">
                                            Популярный
                                        </div>
                                    )}

                                    {/* Current badge */}
                                    {isCurrent && (
                                        <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-gray-800 text-white text-xs font-semibold">
                                            Текущий
                                        </div>
                                    )}

                                    {/* Plan header */}
                                    <div className="mb-4">
                                        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r ${plan.color} text-white text-xs font-bold mb-2`}>
                                            {plan.label}
                                        </div>
                                        <div className="text-2xl font-bold text-gray-900">{plan.price}</div>
                                        <div className="text-xs text-gray-500">{plan.labelRu}</div>
                                    </div>

                                    {/* Features list */}
                                    <ul className="space-y-2.5 mb-5">
                                        {plan.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <Icon
                                                    name={feature.included ? 'check' : 'x'}
                                                    size={16}
                                                    className={`mt-0.5 flex-shrink-0 ${feature.included ? 'text-green-500' : 'text-gray-300'
                                                        }`}
                                                />
                                                <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'
                                                    }`}>
                                                    {feature.text}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA button */}
                                    {isCurrent ? (
                                        <div className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-500 text-sm font-medium text-center">
                                            Ваш план
                                        </div>
                                    ) : isUpgrade ? (
                                        <button
                                            onClick={() => {
                                                // Заглушка — без реальной оплаты
                                                alert(`Переход на ${plan.labelRu} будет доступен в ближайшее время!`)
                                            }}
                                            className={`w-full py-2.5 rounded-xl bg-gradient-to-r ${plan.color} text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm`}
                                        >
                                            Перейти на {plan.label}
                                        </button>
                                    ) : (
                                        <div className="w-full py-2.5 rounded-xl bg-gray-50 text-gray-400 text-sm font-medium text-center">
                                            —
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 pb-6 text-center">
                    <button
                        onClick={onClose}
                        className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        Продолжить с текущим планом
                    </button>
                </div>
            </div>
        </div>
    )
}
