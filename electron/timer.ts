import { EventEmitter } from 'events';

/**
 * Clase TimerManager
 * Gestiona el cronómetro del partido en el backend (Electron/Node).
 * Mantiene la precisión del tiempo y emite eventos 'tick' cada segundo.
 * Funciona de forma independiente al frontend para evitar desajustes si la UI se refresca.
 */
export class TimerManager extends EventEmitter {
    private startTime: number = 0;
    private accumulatedTime: number = 0; // ms
    private isRunning: boolean = false;
    private intervalId: NodeJS.Timeout | null = null;

    // Get current time in seconds
    getTimeSeconds(): number {
        let currentChunk = 0;
        if (this.isRunning) {
            currentChunk = Date.now() - this.startTime;
        }
        return Math.floor((this.accumulatedTime + currentChunk) / 1000);
    }

    /**
     * Inicia el cronómetro si no está corriendo.
     */
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.startTime = Date.now();

        this.intervalId = setInterval(() => {
            this.emit('tick', this.getTimeSeconds());
        }, 1000);
    }

    /**
     * Pausa el cronómetro y acumula el tiempo transcurrido.
     */
    stop() {
        if (!this.isRunning) return;
        this.isRunning = false;
        this.accumulatedTime += Date.now() - this.startTime;
        if (this.intervalId) clearInterval(this.intervalId);
        this.emit('tick', this.getTimeSeconds());
    }

    /**
     * Reinicia el cronómetro a un valor específico (por defecto 0).
     */
    reset(newTimeSeconds: number = 0) {
        this.stop();
        this.accumulatedTime = newTimeSeconds * 1000;
        this.emit('tick', this.getTimeSeconds());
    }

    /**
     * Establece el tiempo actual manualmente.
     * Si estaba corriendo, se reanuda desde el nuevo tiempo.
     */
    set(newTimeSeconds: number) {
        const wasRunning = this.isRunning;
        this.stop();
        this.accumulatedTime = newTimeSeconds * 1000;
        if (wasRunning) this.start();
        else this.emit('tick', this.getTimeSeconds());
    }
}
