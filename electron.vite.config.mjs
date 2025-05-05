import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { resolve } from 'path'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        'react/jsx-runtime': resolve('./node_modules/react/jsx-runtime')
      }
    },
    plugins: [
      react({
        jsxRuntime: 'automatic',  // Pastikan JSX runtime diatur ke automatic
      }), 
      nodePolyfills()
    ]
  }
})