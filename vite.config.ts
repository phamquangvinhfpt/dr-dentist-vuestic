import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'url'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'
import viteCompression from 'vite-plugin-compression'
import imagemin from 'vite-plugin-imagemin'
import { ViteWebfontDownload } from 'vite-plugin-webfont-dl'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    build: {
      sourcemap: !isProduction,
      minify: 'esbuild',
      target: 'esnext',
      chunkFileNames: 'assets/[name].[hash].js',
      assetFileNames: 'assets/[name].[hash][extname]',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['vue', 'vue-router', 'pinia'],
            ui: ['vuestic-ui'],
          },
        },
      },
    },
    plugins: [
      vue({
        script: {
          defineModel: true,
        },
      }),
      VueI18nPlugin({
        include: resolve(dirname(fileURLToPath(import.meta.url)), './src/i18n/locales/**'),
      }),
      viteCompression({
        verbose: true,
        disable: true,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz',
      }),
      imagemin({
        gifsicle: {
          optimizationLevel: 7,
          interlaced: false,
        },
        optipng: {
          optimizationLevel: 5,
        },
        mozjpeg: {
          quality: 65,
        },
        pngquant: {
          quality: [0.65, 0.9],
          speed: 4,
        },
        svgo: {
          plugins: [
            {
              name: 'removeViewBox',
            },
            {
              name: 'removeEmptyAttrs',
              active: false,
            },
          ],
        },
      }),
      ViteWebfontDownload([
        'https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap',
        'https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&display=swap',
      ]),
    ],
    resolve: {
      alias: {
        '@': resolve(dirname(fileURLToPath(import.meta.url)), './src'),
        '@stores': resolve(dirname(fileURLToPath(import.meta.url)), './src/stores'),
        '@modules': resolve(dirname(fileURLToPath(import.meta.url)), './src/stores/modules'),
        '@services': resolve(dirname(fileURLToPath(import.meta.url)), './src/services'),
      },
    },
    define: {
      'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development'),
    },
  }
})
