import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Alias para src
      '@components': path.resolve(__dirname, './src/components'), // Alias para components
      '@assets': path.resolve(__dirname, './src/assets'), // Alias para assets
    },
  },
});
