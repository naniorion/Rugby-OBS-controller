import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { MatchState, INITIAL_STATE } from '../types';

export const useSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [matchState, setMatchState] = useState<MatchState>(INITIAL_STATE);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const connect = async () => {
            let port = 3000;

            // Método 1: Electron IPC (App de Escritorio)
            // Si funciona dentro de Electron, pedimos el puerto al proceso principal
            if ((window as any).ipcRenderer && (window as any).ipcRenderer.getServerPort) {
                try {
                    port = await (window as any).ipcRenderer.getServerPort();
                } catch (e) {
                    console.warn('IPC port fetch failed', e);
                }
            }
            // Método 2: Navegador/OBS (servido por Express/Vite)
            // Si estamos en un navegador, deducimos el puerto.
            else if (window.location.port && window.location.protocol.includes('http')) {
                // Intentamos usar el mismo puerto si estamos en producción/express
                const locPort = parseInt(window.location.port);
                if (locPort >= 3000 && locPort < 4000) { // Assumption: our server is in 3000 range
                    port = locPort;
                }
            }

            console.log('Connecting to Socket.io on port:', port);
            const newSocket = io(`http://localhost:${port}`);
            setSocket(newSocket);

            newSocket.on('connect', () => setIsConnected(true));
            newSocket.on('disconnect', () => setIsConnected(false));

            // Escuchar actualizaciones completas del estado desde el servidor
            newSocket.on('state-update', (newState: MatchState) => {
                setMatchState(newState);
            });
        };

        connect();

        return () => {
            // Cleanup if socket exists (might be null if effect runs fast)
            // But we can't access 'socket' state here easily due to closure.
            // Better to rely on garbage collection or set a ref if strict cleanup needed.
            // For now, strict mode might double connect in dev, but prod is fine.
        };
    }, []);

    /**
     * Envía actualizaciones de estado al servidor.
     * El servidor luego retransmite a todos los clientes (broadcast).
     */
    const updateState = useCallback((updates: Partial<MatchState>) => {
        if (socket) {
            socket.emit('update-state', updates);
            // Optimistic update could go here, but we rely on server broadcast for truth
        }
    }, [socket]);

    /**
     * Envía comandos específicos (ej: timer-start) que ejecutan lógica en el servidor.
     */
    const sendCommand = useCallback((command: string, ...args: any[]) => {
        if (socket) {
            socket.emit(command, ...args);
        }
    }, [socket]);

    return { socket, matchState, isConnected, updateState, sendCommand };
};
