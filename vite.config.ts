import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    fs: {
      strict: false
    },
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[ext]',
        chunkFileNames: 'chunks/[name].[hash].js',
        manualChunks: {
          'pong-game': ['./src/games/PongGame.tsx'],
          'tetris-game': ['./src/games/TetrisGame.tsx'],
          'satoshi-man-game': ['./src/games/SatoshiManGame.tsx'],
          'feast-famine-game': ['./src/games/FeastFamine.tsx']
        }
      }
    }
  }
})
