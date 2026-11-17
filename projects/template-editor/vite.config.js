import path from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'
import vueDevTools from 'vite-plugin-vue-devtools'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default defineConfig(({ command }) => ({
  base: '/',
  ...(command === 'build' ? { define: { 'process.env.NODE_ENV': JSON.stringify('production') } } : {}),
  plugins: [
    vue(),
    ...(command === 'serve' ? [vueDevTools()] : []),
  ],
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.esm-bundler.js',
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  build: {
    outDir: path.resolve(__dirname, 'dist'),
    target: 'es2022',
    emptyOutDir: false,
    chunkSizeWarningLimit: 10000,
    lib: {
      entry: {
        index: path.resolve(__dirname, 'src/index.ts'),
        types: path.resolve(__dirname, 'src/types/index.ts'),
        utils: path.resolve(__dirname, 'src/utils/index.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => entryName === 'index'
        ? 'index.js'
        : `${entryName}/index.js`,
      cssFileName: 'style',
    },
  },

  server: {
    allowedHosts: true
  }
}))
