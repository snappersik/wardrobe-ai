# =============================================================================
# СКРИПТ ЗАПУСКА ЛОКАЛЬНОГО ОКРУЖЕНИЯ РАЗРАБОТКИ
# =============================================================================
# Запускает:
# 1. Базы данных (PostgreSQL, Mongo) через Docker
# 2. Backend (Uvicorn с авто-перезагрузкой) в новом окне
# 3. ML Worker в новом окне
# 4. Frontend (Vite) в новом окне

Write-Host "🚀 Запуск среды разработки Wardrobe AI..." -ForegroundColor Cyan

# 1. Запуск баз данных в фоне
Write-Host "🐘 Запускаем базы данных (Postgres, Mongo)..." -ForegroundColor Yellow
docker compose up -d db mongo
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка запуска Docker. Убедитесь, что Docker Desktop запущен." -ForegroundColor Red
    exit
}

# Функция для запуска процесса в новом окне PowerShell
function Start-NewWindow {
    param (
        [string]$Title,
        [string]$Command,
        [string]$Path
    )
    Write-Host "   Starting $Title..." -ForegroundColor Gray
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Path'; $Command"
}

$RootPath = Get-Location

# 2. Запуск Backend
Start-NewWindow -Title "Backend (FastAPI)" `
    -Path "$RootPath\backend" `
    -Command ".\venv\Scripts\activate; python main.py"

# 3. Запуск ML Worker
Start-NewWindow -Title "ML Worker" `
    -Path "$RootPath\backend" `
    -Command ".\venv\Scripts\activate; python -m app.ml.worker"

# 4. Запуск Frontend
Start-NewWindow -Title "Frontend (Vite)" `
    -Path "$RootPath\frontend" `
    -Command "npm run dev"

Write-Host "✅ Все сервисы запущены в отдельных окнах!" -ForegroundColor Green
Write-Host "🌐 Backend API: http://localhost:8000"
Write-Host "🎨 Frontend:    http://localhost:3000"
