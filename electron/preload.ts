import { contextBridge, ipcRenderer } from 'electron'
/**
 * Preload Script
 * Expone métodos seguros a la ventana del navegador (Renderer Process) usando ContextBridge.
 * Permite comunicación IPC (Inter-Process Communication) sin exponer todo el objeto 'electron'.
 */
// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
    on: (channel: string, callback: (...args: any[]) => void) => {
        ipcRenderer.on(channel, (_event, ...args) => callback(...args))
    },
    off(...args: Parameters<typeof ipcRenderer.off>) {
        const [channel, ...omit] = args
        return ipcRenderer.off(channel, ...omit)
    },
    send(...args: Parameters<typeof ipcRenderer.send>) {
        const [channel, ...omit] = args
        return ipcRenderer.send(channel, ...omit)
    },
    invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
        const [channel, ...omit] = args
        return ipcRenderer.invoke(channel, ...omit)
    },
    // Método específico para obtener el puerto del servidor express
    getServerPort: () => ipcRenderer.invoke('get-server-port'),
})
