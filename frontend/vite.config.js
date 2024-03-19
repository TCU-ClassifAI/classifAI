import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import eslint from 'vite-plugin-eslint';
import dotenv from 'dotenv';

// Load environment variables from each .env file
dotenv.config({ path: 'frontend.env' });

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), eslint()],
  server: {
      // this ensures that the browser opens upon server start
      open: true,
      // this sets a default port to 3000  
      port: 3000, 
  },
  define: {
    global: {}
  },
  build: {
    outDir: 'build',
  }
})
