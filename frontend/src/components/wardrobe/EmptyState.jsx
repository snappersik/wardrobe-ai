export default function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <div className="icon-shirt text-gray-300 text-6xl"></div>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Здесь пока пусто</h3>
            <p className="text-gray-500 max-w-xs mb-8">
                Ваш гардероб пуст. Добавьте свои любимые вещи, чтобы начать создавать образы.
            </p>
            <button className="btn btn-primary px-8">
                Добавить первую вещь
            </button>
        </div>
    )
}
