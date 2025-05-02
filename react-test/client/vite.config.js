import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  root:'.',
  plugins: [react()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components/'),
      '@page': path.resolve(__dirname, 'src/menuPage/'),
      '@css': path.resolve(__dirname, 'src/css/'),
      '@img': path.resolve(__dirname, 'src/img/'),
      '@data': path.resolve(__dirname, 'src/data/'),
      '@utils': path.resolve(__dirname, 'src/commonJs/utils.js'),
    },
  },
  build: {
    rollupOptions: {
        external: ['exceljs'],
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
})
