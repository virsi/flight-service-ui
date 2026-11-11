import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      usePolling: true, // нужно для hot-reload при использовании docker
    },
    host: true, // нужно, чтобы правильно работал маппинг портов в docker-контейнере
    strictPort: true,
    port: 3000,
    // обратный прокси: браузер ходит только на :3000, поэтому ограничений CORS нет
    proxy: {
      '/api': 'http://localhost:8080', // бэкенд flight-service-api
      '/flight-media': 'http://localhost:9100', // изображения и видео из MinIO (S3)
    },
  },
})
