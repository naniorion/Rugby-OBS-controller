import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
/**
 * Configuración de Vite para Electron + React.
 * Utiliza plugins para integrar el proceso principal (Main) y el de renderizado (Renderer).
 */
export default defineConfig({
    base: './', // Necesario para rutas relativas en Electron (file://)
    plugins: [
        react(),
        electron([
            {
                // Main-Process entry file of the Electron App.
                entry: 'electron/main.ts',
            },
            {
                entry: 'electron/preload.ts',
                onstart(options) {
                    // Notifica al proceso de renderizado para recargar la página cuando el script de preload se reconstruye
                    options.reload()
                },
            },
        ]),
        renderer(),
    ],
})
