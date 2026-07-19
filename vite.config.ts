import { defineConfig, mergeConfig } from 'vite';
import { defaultViteConfig } from 'markedit-vite';

export default defineConfig(
  mergeConfig(
    defaultViteConfig({
      entry: 'src/main.ts',
    }),
    {
      build: {
        rollupOptions: {
          output: {
            entryFileNames: 'markedit-fen.js',
          },
        },
      },
    },
  ),
);
