**Кратко О Проекте**
Wardrobe AI — SPA для управления гардеробом и подбором образов с AI-помощью. Пользователь загружает вещи, фильтрует, собирает образы, ведёт календарь и получает рекомендации. Админ‑панель показывает статистику, логи и управление пользователями.

**Архитектура**
Frontend: React + Vite + Tailwind.  
Backend: FastAPI + SQLAlchemy (PostgreSQL).  
NoSQL: MongoDB для логов аудита.  
ML Worker: отдельный процесс для фоновых задач.  
Docker Compose: база, mongo, backend, ML worker.

**Данные И Базы**
PostgreSQL хранит пользователей, вещи, образы, календарь.  
MongoDB хранит audit logs (логи входов, действий).

**Безопасность**
JWT хранится в httpOnly cookie, без localStorage.  
CORS ограничен разрешёнными доменами.  
Маршруты защищены: frontend `ProtectedRoute`, backend зависимости `get_current_user` и `get_current_admin`.

**CRUD**
Вещи: создание, просмотр, обновление, удаление.  
Образы: создание, просмотр, обновление, удаление.  
Профиль: чтение, обновление, удаление.

**SPA + REST**
API доступен по `/api`.  
Vite proxy скрывает хост backend (запросы фронта идут на свой origin).

**Логи И Консоль**
API запросы логируются в консоль через axios interceptors.  
Backend пишет технические логи и аудит в MongoDB.

**Пагинация**
Пагинация реализована в админ‑таблице пользователей и в системных логах.

**Диаграммы И Фильтры**
Админ‑дашборд поддерживает фильтр периода (today/7days/30days/year).  
Сидинг заполняет данные, чтобы графики не были пустыми.

**Анимации**
Добавлены анимации появления карточек и модальных окон.

**DropZone**
Загрузка вещей — drag‑and‑drop с превью, без кнопки “Выберите файл”.

**Экспорт**
Экспорт логов в JSON, CSV, Excel (`.xlsx`) и PDF.

**Запуск**
Локально: `dev.ps1` или `docker compose up --build`.  
Сидинг данных: `python backend/seed.py`.
Балансировка: `docker compose -f docker-compose.yml -f docker-compose.lb.yml up --build nginx backend_1 backend_2`.
 
**Дополнительные Фишки**
Docker‑деплой включён.  
Proxy настроен в `frontend/vite.config.js`.  
Набросок балансировки: `docker-compose.lb.yml` + Nginx (см. `ops/nginx`).

**Готовые Ответы На Вопросы**
Почему cookie, а не localStorage?  
Cookie с `httpOnly` защищён от XSS, поэтому безопаснее для JWT.

Почему Mongo для логов?  
Логи — неструктурированные события, их удобно хранить в NoSQL.

Как защищены роуты?  
Frontend не пускает без `user`, backend проверяет cookie и роли.
