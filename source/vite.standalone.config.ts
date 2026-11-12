import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// One JavaScript chunk, one stylesheet, every font and image inlined.
// tools/make-standalone.mjs then folds the result into a single HTML file.
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  build: {
    target: 'es2020',
    outDir: 'node_modules/.dq-standalone',
    emptyOutDir: true,
    copyPublicDir: false,
    assetsInlineLimit: 100_000_000,
    cssCodeSplit: false,
    chunkSizeWarningLimit: 20_000,
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});
