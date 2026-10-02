import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // En desarrollo, el WebSocket va al servidor de partidas (npm run server)
    proxy: { '/ws': { target: 'ws://localhost:3000', ws: true } },
  },
})
