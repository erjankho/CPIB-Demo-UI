import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Served from https://erjankho.github.io/CPIB-Demo-UI/ on GitHub Pages.
  // Change to '/' if deploying to a custom domain or a <user>.github.io repo.
  base: '/CPIB-Demo-UI/',
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});
