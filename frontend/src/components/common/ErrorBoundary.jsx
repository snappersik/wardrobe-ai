import { Component } from 'react'

export default class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = { hasError: false, error: null }
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error }
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack)
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900 mb-4">Что-то пошло не так</h1>
                        <p className="text-gray-600 mb-4">Мы сожалеем, но произошла непредвиденная ошибка.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition"
                        >
                            Обновить страницу
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
