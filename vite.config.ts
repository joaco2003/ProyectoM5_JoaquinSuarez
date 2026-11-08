import { defineConfig } from 'vite'               // Función para definir la config de Vite
import react from '@vitejs/plugin-react'           // Plugin para que Vite entienda React
import tailwindcss from '@tailwindcss/vite'        // Plugin de Tailwind (estilos)
export default defineConfig({ plugins: [react(), tailwindcss()] }) // Activamos ambos plugins
