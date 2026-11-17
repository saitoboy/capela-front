import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Versão no rodapé do Admin. COMMIT_REF vem do Netlify; local cai em 'dev'.
  define: {
    __COMMIT__: JSON.stringify((process.env.COMMIT_REF ?? 'dev').slice(0, 7)),
    __BUILD__: JSON.stringify(new Date().toISOString()),
  },
})
