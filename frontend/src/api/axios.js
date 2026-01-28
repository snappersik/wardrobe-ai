import axios from 'axios'

const api = axios.create({
    baseURL: 'http://localhost:8000/api',
    withCredentials: true, // Важно для кук
    headers: {
        'Content-Type': 'application/json',
    }
})

api.interceptors.response.use(
    (response) => {
        return response
    },
    (error) => {
        const { response } = error
        if (response) {
            switch (response.status) {
                case 401:
                    // Не авторизован - редирект на логин ТОЛЬКО если это не проверка статуса
                    // И если мы не на публичных страницах, хотя это сложно проверить здесь.
                    // Лучше вообще убрать глобальный редирект на 401 для '/'
                    if (!window.location.pathname.includes('/login') &&
                        !window.location.pathname.includes('/register') &&
                        window.location.pathname !== '/' // Разрешаем 401 на главной (хотя оно там редко бывает, но вдруг)
                    ) {
                        // Но проблема в том, что checkAuth делает запрос, он падает с 401, и тут происходит редирект.
                        // Мы должны знать, какой запрос упал. 
                    }
                    if (error.config.url.includes('/users/me')) {
                        // Если это проверка юзера, то не редиректим, просто игнорируем (AuthContext обработает)
                        return Promise.reject(error)
                    }

                    if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
                        window.location.href = '/login'
                    }
                    break
                case 403:
                    window.location.href = '/403'
                    break
                case 429:
                    window.location.href = '/429'
                    break
                case 500:
                    window.location.href = '/500'
                    break
                default:
                    console.error('API Error:', error)
            }
        } else {
            // Network Error or Server down
            console.error('Network Error:', error)
        }
        return Promise.reject(error)
    }
)

export default api
