import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// 演示构建：强制启用 Mock 演示模式，并内联全部资源为单个 HTML 文件，
// 可直接上传到任意静态托管（GitHub Pages / Netlify / 任意服务器目录）。
// 用法: npx vite build --config vite.config.demo.js
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  base: './',
  define: {
    'import.meta.env.VITE_DEMO': JSON.stringify('1')
  },
  build: {
    outDir: 'dist-demo'
  },
  preview: {
    // 允许通过隧道域名（trycloudflare.com 等）访问本地预览
    allowedHosts: true
  }
})
