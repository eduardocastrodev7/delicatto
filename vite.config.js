import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Redireciona todas as rotas para index.html em dev
    historyApiFallback: true,
  },
})