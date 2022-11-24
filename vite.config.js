import path from 'path';

import vuePlugin from '@vitejs/plugin-vue2';
import { defineConfig } from 'vite';
import StylelintPlugin from 'vite-plugin-stylelint';


export default defineConfig( {
        build: {
          lib: {
              entry: path.resolve(__dirname, './src/index.ts'),
              name: 'Mirinae',
              fileName: 'mirinae'
          },
          rollupOptions: {
              external: ['vue'],
              output: {
                  globals: {
                      vue: 'Vue'
                  }
              }
          },
        },
        plugins: [
            vuePlugin(),
            StylelintPlugin({
                include: ['src/**/*.{css,vue,pcss,scss}'],
                exclude: ['node_modules'],
                lintOnStart: true,
                emitErrorAsWarning: true,
            }),
        ],
        test: {
            globals: true,
            environment: 'jsdom',
            include: ['./src/**/__tests__/**/*.+(ts|js)'],
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
    })
