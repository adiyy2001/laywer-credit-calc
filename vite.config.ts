import path from 'path';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'wibor-scraper': path.resolve(
        __dirname,
        'src/libs/wibor-scrapper/src/index.ts',
      ),
    },
  },
});
