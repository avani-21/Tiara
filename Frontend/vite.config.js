import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
 server:{
  proxy:{
    '/api':{
      target:'http://3.7.169.158',
      changeOrigin:true,
    }
  }
 },

})
