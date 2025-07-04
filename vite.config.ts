import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib'
  
  return {
    plugins: [
      vue(),
      ...(isLib ? [dts({ include: ['src'] })] : [])
    ],
    resolve: {
      alias: {
        'src': resolve(__dirname, 'src'),
        '@': resolve(__dirname, 'src')
      }
    },
    build: isLib ? {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'Isoflow',
        fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`
      },
      rollupOptions: {
        external: ['vue'],
        output: {
          globals: {
            vue: 'Vue'
          }
        }
      }
    } : {
      outDir: 'dist',
      assetsDir: 'assets'
    },
    server: {
      port: 3000,
      open: true
    },
    test: {
      environment: 'jsdom'
    }
  }
}) 