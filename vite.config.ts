import path from 'path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  base: '/mediatech-ai-agent/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true, // 외부 접근 허용
    proxy: {
      '/api': {
        target: 'https://1.255.86.189:8080',
        changeOrigin: true,
        secure: false, // SSL 인증서 검증 비활성화 (자체 서명 인증서 대응)

        configure: (proxy, options) => {
          proxy.on('error', (err) => {
            console.log('🚨 Proxy error:', err);
          });
          proxy.on('proxyReq', (proxyReq, req) => {
            console.log(
              '🌐 Proxying request:',
              req.method,
              req.url,
              '→',
              options.target + proxyReq.path
            );
          });
          proxy.on('proxyRes', (proxyRes, req) => {
            console.log('✅ Proxy response:', proxyRes.statusCode, req.url);
          });
        },
      },
    },
  },
});
