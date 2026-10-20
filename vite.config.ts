import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // host: true → nghe trên mọi IPv4 của máy, máy khác cùng mạng LAN vào được qua http://<IP-máy>:<port>
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
  build: { assetsInlineLimit: 0 },
  test: { environment: 'node' },
} as never);
