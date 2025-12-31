/**
 * Definición de la estructura de un Equipo (Team).
 * Contiene información básica como ID, nombre, iniciales para el marcador, color y logo.
 */
export interface Team {
    id: 'home' | 'away'; // Identificador único: local o visitante
    name: string;        // Nombre completo del equipo
    initials: string;    // Código corto (3 letras) para el marcador
    color: string;       // Color principal del equipo en formato HEX
    logoVal: string;     // Imagen del logo en Base64 o URL
}

/**
 * Representa el desglose del puntaje de un equipo.
 * Se rastrean tries, conversiones, penales, drops, y penalty tries por separado.
 */
export interface Score {
    tries: number;          // Cantidad de tries (5 puntos)
    conversions: number;    // Cantidad de conversiones (2 puntos)
    penalties: number;      // Cantidad de penales (3 puntos)
    drops: number;          // Cantidad de drops (3 puntos)
    penaltyTries: number;   // Cantidad de penalty tries (7 puntos automáticos)
    manual: number;         // Ajustes manuales (+/-) si ocurriera un error de cálculo
    total: number;          // Puntaje total calculado
}

/**
 * Representa un Jugador.
 * Puede ser titular (starter) o suplente (bench).
 */
export interface Player {
    id: string;             // ID único del jugador
    name: string;           // Nombre del jugador
    number: string;         // Número de camiseta
    isStarter: boolean;     // true = XV titular, false = Banca
    isOnField?: boolean;    // true = Actualmente en el campo
}

/**
 * Estado del Cronómetro del partido.
 */
export interface MatchTimer {
    value: number;       // Tiempo actual en segundos
    isRunning: boolean;  // Si el reloj está corriendo o pausado
    mode: 'up' | 'down'; // 'up' = cuenta progresiva, 'down' = cuenta regresiva
    half: 1 | 2;         // 1er o 2do tiempo
    label: string;       // Etiqueta visual (ej: "1st Half", "Time Off")
}

/**
 * Representa una Tarjeta (Amarilla o Roja).
 */
export interface Card {
    id: string;              // ID único de la tarjeta
    teamId: 'home' | 'away'; // Equipo sancionado
    player: Player;          // Jugador sancionado
    type: 'yellow' | 'red';  // Tipo de tarjeta
    timestamp: number;       // Momento (segundos de partido) en que ocurrió
    remainingSeconds: number;// Tiempo restante de sanción (para amarillas)
}

/**
 * Registro de una sustitución de jugadores.
 */
export interface Substitution {
    id: string;
    teamId: 'home' | 'away';
    playerIn: Player;        // Jugador que entra
    playerOut: Player;       // Jugador que sale
    matchTime: string;       // Tiempo formateado (ej: "25:00")
}

/**
 * Acción del partido para el registro (Log).
 * Puede ser puntos, tarjetas, sustituciones, etc.
 */
export interface MatchAction {
    id: string;
    type: 'try' | 'conversion' | 'penalty' | 'drop' | 'card' | 'sub' | 'manual' | 'penaltyTry';
    teamId: 'home' | 'away';
    player?: Player;         // Jugador involucrado (opcional)
    description: string;     // Texto descriptivo para mostrar en el log
    timestamp: string;       // Tiempo formateado
    linkedId?: string;       // ID de enlace (ej: para relacionar con una Card específica y poder borrarla)
    cardType?: 'yellow' | 'red';
    subDetails?: {           // Detalles específicos si es una sustitución
        playerIn: { name: string; number: string; id: string };
        playerOut: { name: string; number: string; id: string };
    };
    scoreSnapshot?: { home: number; away: number }; // Marcador en el momento de la acción (para deshacer)
}

/**
 * Estado Global del Partido (MatchState).
 * Esta estructura contiene TODA la información sincronizada entre Dashboard y Overlay.
 */
export interface MatchState {
    home: {
        info: Team;
        score: Score;
        lineup: Player[];
    };
    away: {
        info: Team;
        score: Score;
        lineup: Player[];
    };
    timer: MatchTimer;
    cards: Card[];
    subs: Substitution[];
    actions: MatchAction[]; // Historial de acciones
    savedLabels: { id: string; text: string; subtext: string; color: string }[]; // Textos preguardados
    overlay: {
        // Vista activa en el overlay (qué se muestra en pantalla)
        activeView: 'scoreboard' | 'lineup_home' | 'lineup_away' | 'custom_label' | 'match_summary' | 'stats_comparison' | 'stats_lower';
        customLabelText?: string;
        customLabelSubtext?: string;
        customLabelColor?: string;
    };
    summaryConfig: {
        maxItems: number; // Máximo de items en el resumen
        filterTypes: string[]; // Tipos de eventos a mostrar en el resumen
    };
    obsConfig: {
        address: string;
        password: string;
        isConnected: boolean;
    };
    leagueLogo: string; // Logo de la liga
    scoreboardConfig: {
        scale: number;
        opacity: number;
    };
    leagueLogoConfig: {
        scale: number;
        opacity: number;
    };
}

/**
 * Estado Inicial de la aplicación.
 * Define los valores por defecto al arrancar.
 */
export const INITIAL_STATE: MatchState = {
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
