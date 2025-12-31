import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import path from 'node:path'
import fs from 'node:fs'
import express from 'express'
import { createServer } from 'node:http'
import { Server } from 'socket.io'
import cors from 'cors'
import { TimerManager } from './timer'

import OBSWebSocket from 'obs-websocket-js';

const obs = new OBSWebSocket();

// Estado Global del Partido en el Servidor (Source of Truth)
// Se mantiene aquí para persistencia entre recargas de la UI y para nuevos clientes (Overlay OBS).
let matchState: any = {
    // ... (keep all matchState init same)
    home: {
        info: { id: 'home', name: 'Home Team', initials: 'HOM', color: '#21752f', logoVal: '' },
        score: { tries: 0, conversions: 0, penalties: 0, drops: 0, penaltyTries: 0, manual: 0, total: 0 },
        lineup: []
    },
    away: {
        info: { id: 'away', name: 'Away Team', initials: 'AWY', color: '#a8a8a8', logoVal: '' },
        score: { tries: 0, conversions: 0, penalties: 0, drops: 0, penaltyTries: 0, manual: 0, total: 0 },
        lineup: []
    },
    timer: { value: 0, isRunning: false, mode: 'up', half: 1, label: '1st Half' },
    cards: [],
    subs: [],
    actions: [],
    savedLabels: [],
    overlay: { activeView: 'scoreboard' },
    summaryConfig: { maxItems: 20, filterTypes: ['try', 'conversion', 'penalty', 'drop', 'card', 'sub', 'manual', 'penaltyTry'] },
    obsConfig: { address: 'ws://localhost:4455', password: '', isConnected: false },
    leagueLogo: '',
    scoreboardConfig: { scale: 1, opacity: 1 },
    leagueLogoConfig: { scale: 1, opacity: 1 }
};

// ... imports

// Listen to fixed range of ports for OBS compatibility
let SERVER_PORT = 3000;

const expressApp = express();
expressApp.use(cors());

// Serve static files for OBS/Browser access
expressApp.use(express.static(path.join(__dirname, '../dist')));

const httpServer = createServer(expressApp);
const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const timerManager = new TimerManager();

/**
 * Inicia el servidor HTTP y Socket.IO.
 * Busca un puerto libre comenzando desde el 3000 si está ocupado.
 */
const startServer = (port: number) => {
    httpServer.listen(port, () => {
        SERVER_PORT = port;
        console.log(`Socket.io and HTTP server running at http://localhost:${SERVER_PORT}`);
    });

    httpServer.on('error', (e: any) => {
        if (e.code === 'EADDRINUSE') {
            console.log(`Port ${port} in use, trying ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('Server error:', e);
        }
    });
};

startServer(3000);

// Expose Port via IPC
ipcMain.handle('get-server-port', () => SERVER_PORT);

// ... Timer Events ...


// Eventos del Temporizador (Backend)
// Actualiza el estado global cada segundo y gestiona la cuenta atrás de las tarjetas amarillas.
timerManager.on('tick', (seconds) => {
    // ... (keep existing timer logic)
    matchState.timer.value = seconds;
    matchState.timer.isRunning = true;

    // Handle Card Timers
    if (matchState.cards.length > 0) {
        // Decrement first
        matchState.cards.forEach((card: any) => {
            if (card.type === 'yellow' && card.remainingSeconds > 0) {
                card.remainingSeconds--;
            }
        });

        // Remove expired yellow cards from active list
        // Red cards persist until manually removed
        matchState.cards = matchState.cards.filter((card: any) => {
            if (card.type === 'yellow' && card.remainingSeconds <= 0) {
                return false; // Remove expired yellow card
            }
            return true; // Keep others
        });
    }

    io.emit('state-update', matchState);
});

/**
 * Gestión de Conexiones de Clientes (UI Dashboard y Overlay OBS).
 */
io.on('connection', (socket) => {
    // ... (keep existing socket logic)
    console.log('Client connected:', socket.id);
    socket.emit('state-update', matchState);

    // General State Update (merging)
    socket.on('update-state', (partialState) => {
        if (partialState.home) matchState.home = { ...matchState.home, ...partialState.home };
        if (partialState.away) matchState.away = { ...matchState.away, ...partialState.away };
        if (partialState.actions) matchState.actions = partialState.actions;
        if (partialState.subs) matchState.subs = partialState.subs;
        if (partialState.cards) {
            matchState.cards = partialState.cards;
        }
        if (partialState.savedLabels) {
            matchState.savedLabels = partialState.savedLabels;
        }
        if (partialState.overlay) {
            matchState.overlay = { ...matchState.overlay, ...partialState.overlay };
        }
        if (partialState.timer) {
            matchState.timer = { ...matchState.timer, ...partialState.timer };
        }
        if (partialState.leagueLogo !== undefined) {
            matchState.leagueLogo = partialState.leagueLogo;
        }
        if (partialState.scoreboardConfig) {
            matchState.scoreboardConfig = { ...matchState.scoreboardConfig, ...partialState.scoreboardConfig };
        }
        if (partialState.leagueLogoConfig) {
            matchState.leagueLogoConfig = { ...matchState.leagueLogoConfig, ...partialState.leagueLogoConfig };
        }

        io.emit('state-update', matchState);
    });

    // Timer Controls
    socket.on('timer-start', () => {
        timerManager.start();
        matchState.timer.isRunning = true;
        io.emit('state-update', matchState);
    });

    socket.on('timer-stop', () => {
        timerManager.stop();
        matchState.timer.isRunning = false;
        io.emit('state-update', matchState);
    });

    socket.on('timer-reset', (val = 0) => {
        timerManager.reset(val);
        matchState.timer.value = val;
        matchState.timer.isRunning = false;
        io.emit('state-update', matchState);
    });

    socket.on('timer-set', (val) => {
        timerManager.set(val);
    });

    socket.on('obs-connect', async (config: any) => {
        try {
            await obs.connect(config.address, config.password || undefined);
            console.log('Connected to OBS');

            matchState.obsConfig = {
                address: config.address,
                password: config.password,
                isConnected: true
            };
            io.emit('state-update', matchState);
        } catch (error: any) {
            console.error('Failed to connect to OBS', error);
            matchState.obsConfig = {
                address: config.address,
                password: config.password,
                isConnected: false
            };
            io.emit('state-update', matchState);
        }
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected', socket.id);
    });
});


// --- Electron ---
process.env.DIST = path.join(__dirname, '../dist')
process.env.VITE_PUBLIC = app.isPackaged ? process.env.DIST : path.join(__dirname, '../public')
let win: BrowserWindow | null
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

/**
 * Crea la ventana principal de Electron.
 * En desarrollo carga desde localhost (Vite dev server), en producción carga index.html compilado.
 */
function createWindow() {
    win = new BrowserWindow({
        width: 1400,
        height: 900,
        icon: path.join(process.env.VITE_PUBLIC || '', 'electron-vite.svg'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
        },
    })
    if (VITE_DEV_SERVER_URL) {
        win.loadURL(VITE_DEV_SERVER_URL || '')
    } else {
        const indexPath = path.join(process.env.DIST || '', 'index.html');
        if (!fs.existsSync(indexPath)) {
            dialog.showErrorBox('Error de Carga', `No se encuentra el archivo de inicio: ${indexPath}`);
        }
        win.loadFile(indexPath)
    }
    // DEBUG: Open DevTools to see errors - DISABLED for release
    // win.webContents.openDevTools();
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
        httpServer.close();
    }
})
app.whenReady().then(createWindow)
