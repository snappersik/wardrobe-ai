import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    strictPort: true, // Не переключаться на другой порт если 3000 занят
    open: true, // Автоматически открывает браузер
  },
})
