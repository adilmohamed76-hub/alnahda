import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env variables from .env files in the root directory.
  // The third parameter '' loads all variables, not just those with VITE_ prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // This makes the environment variable available in the client-side code
    // by replacing `process.env.API_KEY` with its value at build time.
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
    },
  };
});
