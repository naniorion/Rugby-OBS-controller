import { createContext, useContext, ReactNode } from 'react';
import { useSocket } from '../hooks/useSocket';
import { MatchState, Substitution, MatchAction } from '../types';

/**
 * MatchContext is the core system of the application.
 * It manages the global state (scores, timers, lineups, overlay configuration)
 * and handles synchronization between the Desktop Dashboard and the Browser Overlay via Socket.IO.
 */
interface MatchContextType {
    matchState: MatchState;
    isConnected: boolean;
    updateScore: (team: 'home' | 'away', type: 'try' | 'conversion' | 'penalty' | 'drop' | 'manual' | 'penaltyTry', delta: number, playerId?: string) => void;
    updateTimer: (action: 'start' | 'stop' | 'reset' | 'set', val?: number) => void;
    updateTeamInfo: (team: 'home' | 'away', info: any) => void;
    addCard: (card: any) => void;
    removeCard: (cardId: string) => void;
    performSub: (teamId: 'home' | 'away', playerInId: string, playerOutId: string) => void;
    setOverlayView: (view: 'scoreboard' | 'lineup_home' | 'lineup_away' | 'custom_label' | 'match_summary' | 'stats_comparison' | 'stats_lower', text?: string, subtext?: string, color?: string) => void;
    saveLabel?: (label: any) => void;
    deleteLabel?: (labelId: string) => void;
    deleteAction?: (actionId: string) => void;
    updateSummaryConfig?: (config: { maxItems?: number; filterTypes?: string[] }) => void;
    connectOBS?: (config: { address: string; password: string }) => void;
    setHalf?: (half: 1 | 2) => void;
    resetMatch?: () => void;
    setLeagueLogo?: (logo: string) => void;
    setScoreboardConfig?: (config: { scale: number; opacity: number }) => void;
    setLeagueLogoConfig?: (config: { scale: number; opacity: number }) => void;
    setPresentationConfig?: (config: {
        title: string;
        posterImage: string;
        showPoster: boolean;
        posterConfig?: { scale: number; opacity: number };
        logosConfig?: { scale: number; opacity: number };
        referee?: string;
        assistants?: string;
        commentators?: string;
        field?: string;
    }) => void;
    setSponsorsConfig?: (config: { image: string; show: boolean; scale: number; opacity: number }) => void;
    loadConfig?: (config: Partial<MatchState>) => void;

    // Add other methods as needed
}

const MatchContext = createContext<MatchContextType | undefined>(undefined);

/**
 * Proveedor de Contexto (MatchProvider).
 * Envuelve la aplicación para dar acceso al estado del partido y funciones de control.
 */
export const MatchProvider = ({ children }: { children: ReactNode }) => {
    // Hooks personalizados para socket
    const { matchState, isConnected, updateState, sendCommand } = useSocket();

    /**
     * Actualiza el puntaje de un equipo y genera una acción en el log.
     * @param team 'home' o 'away'
     * @param type Tipo de anotación (try, conversion, etc.)
     * @param delta Cantidad a sumar/restar (ej: +1 try)
     * @param playerId ID del jugador que anotó (opcional)
     */
    const updateScore = (team: 'home' | 'away', type: 'try' | 'conversion' | 'penalty' | 'drop' | 'manual' | 'penaltyTry', delta: number, playerId?: string) => {
        // Obtenemos el estado actual del equipo
        const teamState = matchState[team];
        const newScore = { ...teamState.score };

        // Aplicamos la lógica de incremento según el tipo
        if (type === 'try') newScore.tries = Math.max(0, newScore.tries + delta);
        if (type === 'conversion') newScore.conversions = Math.max(0, newScore.conversions + delta);
        if (type === 'penalty') newScore.penalties = Math.max(0, newScore.penalties + delta);
        if (type === 'drop') newScore.drops = Math.max(0, newScore.drops + delta);
        if (type === 'penaltyTry') {
            // Penalty Try cuenta como stats separada y también suma al contador de tries normal
            newScore.penaltyTries = Math.max(0, (newScore.penaltyTries || 0) + delta);
            newScore.tries = Math.max(0, newScore.tries + delta);
        }
        if (type === 'manual') newScore.manual = (newScore.manual || 0) + delta;

        // Recálculo del Puntaje Total
        // Fórmula de Rugby: Try(5) + Conv(2) + Pen(3) + Drop(3) + PenaltyTry(7 auto)
        // Nota: Como PenaltyTry suma a 'tries' (+5), necesitamos agregar 2 extra para llegar a 7.
        newScore.total = (newScore.tries * 5) + (newScore.conversions * 2) + (newScore.penalties * 3) + (newScore.drops * 3) + ((newScore.penaltyTries || 0) * 2) + (newScore.manual || 0);

        // Buscar jugador si fue provisto
        const player = playerId ? teamState.lineup.find((p: any) => p.id === playerId) : undefined;

        // Construir descripción para el log
        let desc = `${team === 'home' ? matchState.home.info.name : matchState.away.info.name} scored a ${type}`;
        if (type === 'penaltyTry') desc = `${team === 'home' ? matchState.home.info.name : matchState.away.info.name} awarded Penalty Try`;

        if (player) {
            desc = `${player.name} (#${player.number}) scored a ${type}`;
        }

        // Crear nueva acción
        const newAction = {
            id: Date.now().toString(),
            type: type,
            teamId: team,
            player: player,
            description: desc,
            timestamp: matchState.timer.value ? `${Math.floor(matchState.timer.value / 60)}:${(matchState.timer.value % 60).toString().padStart(2, '0')}` : '00:00',
            scoreSnapshot: {
                home: team === 'home' ? newScore.total : matchState.home.score.total,
                away: team === 'away' ? newScore.total : matchState.away.score.total
            }
        };

        const currentActions = matchState.actions || [];

        // Enviar actualización al servidor/socket
        updateState({
            [team]: { ...teamState, score: newScore },
            actions: [newAction, ...currentActions]
        });
    };

    /**
     * Realiza una sustitución de jugadores.
     * Actualiza el 'lineup' (quién está en campo) y genera la acción.
     */
    const performSub = (teamId: 'home' | 'away', playerInId: string, playerOutId: string) => {
        const team = matchState[teamId];
        // Actualizar flags isOnField
        const newLinup = team.lineup.map((p: any) => {
            if (p.id === playerInId) return { ...p, isOnField: true };
            if (p.id === playerOutId) return { ...p, isOnField: false };
            return p;
        });

        const playerIn = team.lineup.find((p: any) => p.id === playerInId);
        const playerOut = team.lineup.find((p: any) => p.id === playerOutId);

        if (!playerIn || !playerOut) {
            console.error("Player substitution failed: player not found");
            return;
        }

        // Crear objeto sustitución
        const newSub: Substitution = {
            id: Date.now().toString(),
            teamId,
            playerIn,
            playerOut,
            matchTime: matchState.timer.value ? `${Math.floor(matchState.timer.value / 60)}:${(matchState.timer.value % 60).toString().padStart(2, '0')}` : '00:00'
        };

        const newAction: MatchAction | any = {
            id: Date.now().toString(),
            type: 'sub',
            teamId,
            description: `Substitution: ${playerIn.name} In, ${playerOut.name} Out`,
            timestamp: newSub.matchTime,
            subDetails: {
                playerIn: { name: playerIn.name, number: playerIn.number, id: playerIn.id },
                playerOut: { name: playerOut.name, number: playerOut.number, id: playerOut.id }
            },
            scoreSnapshot: {
                home: matchState.home.score.total,
                away: matchState.away.score.total
            }
        };

        updateState({
            [teamId]: { ...team, lineup: newLinup },
            subs: [newSub, ...(matchState.subs || [])],
            actions: [newAction, ...(matchState.actions || [])]
        });
    };

    /**
     * Control del cronómetro. Envía comandos al backend (Electron/Express).
     */
    const updateTimer = (action: 'start' | 'stop' | 'reset' | 'set', val?: number) => {
        if (action === 'start') sendCommand('timer-start');
        if (action === 'stop') sendCommand('timer-stop');
        if (action === 'reset') sendCommand('timer-reset', val || 0);
        if (action === 'set') sendCommand('timer-set', val || 0);
    };

    /**
     * Actualiza información general del equipo (nombre, color, logo).
     */
    const updateTeamInfo = (team: 'home' | 'away', updates: any) => {
        const teamState = matchState[team];
        const newTeamState = { ...teamState };

        if ('lineup' in updates) {
            newTeamState.lineup = updates.lineup;
        }

        const { lineup, ...infoUpdates } = updates;
        if (Object.keys(infoUpdates).length > 0) {
            newTeamState.info = { ...teamState.info, ...infoUpdates };
        }

        updateState({
            [team]: newTeamState
        });
    };

    /**
     * Añade una tarjeta (amarilla/roja) y su acción correspondiente.
     */
    const addCard = (card: any) => {

        const newAction = {
            id: Date.now().toString(),
            type: 'card' as const,
            cardType: card.type,
            teamId: card.teamId,
            description: `Card (${card.type}) for #${card.player?.number || '?'}`,
            timestamp: matchState.timer.value ? `${Math.floor(matchState.timer.value / 60)}:${(matchState.timer.value % 60).toString().padStart(2, '0')}` : '00:00',
            linkedId: card.id,
            player: card.player,
            scoreSnapshot: {
                home: matchState.home.score.total,
                away: matchState.away.score.total
            }
        };


        const newCards = [...matchState.cards, card];
        const currentActions = matchState.actions || [];

        updateState({
            cards: newCards,
            actions: [newAction, ...currentActions]
        });
    }

    /**
     * Elimina una tarjeta activa.
     */
    const removeCard = (cardId: string) => {
        const newCards = matchState.cards.filter((c: any) => c.id !== cardId);
        // También eliminamos la acción asociada del log para mantener consistencia
        const newActions = (matchState.actions || []).filter((a: any) => a.linkedId !== cardId);

        updateState({
            cards: newCards,
            actions: newActions
        });
    }

    /**
     * Cambia la vista activa del Overlay (Tablero, Alineación, etc.).
     */
    const setOverlayView = (view: 'scoreboard' | 'lineup_home' | 'lineup_away' | 'custom_label' | 'match_summary' | 'stats_comparison' | 'stats_lower' | 'presentation', text?: string, subtext?: string, color?: string) => {
        updateState({ overlay: { activeView: view, customLabelText: text, customLabelSubtext: subtext, customLabelColor: color } });
    }

    const saveLabel = (label: any) => {
        const current = matchState.savedLabels || [];
        const newLabels = [...current, label];
        updateState({ savedLabels: newLabels });
    };

    const deleteLabel = (labelId: string) => {
        const current = matchState.savedLabels || [];
        const newLabels = current.filter((l: any) => l.id !== labelId);
        updateState({ savedLabels: newLabels });
    };

    /**
     * Elimina una acción del historial y revierte sus efectos (UNDO).
     */
    const deleteAction = (actionId: string) => {
        const currentActions = matchState.actions || [];
        const actionToDelete = currentActions.find((a: any) => a.id === actionId);

        if (!actionToDelete) return;

        // Lógica de Deshacer (Undo)
        const updates: any = {};

        // 1. Revertir Puntaje
        if (['try', 'conversion', 'penalty', 'drop', 'penaltyTry'].includes(actionToDelete.type)) {
            const teamId = actionToDelete.teamId;
            const teamState = matchState[teamId];
            const newScore = { ...teamState.score };

            // Restar lo que se sumó
            if (actionToDelete.type === 'try') {
                newScore.tries = Math.max(0, newScore.tries - 1);
            } else if (actionToDelete.type === 'conversion') {
                newScore.conversions = Math.max(0, newScore.conversions - 1);
            } else if (actionToDelete.type === 'penalty') {
                newScore.penalties = Math.max(0, newScore.penalties - 1);
            } else if (actionToDelete.type === 'drop') {
                newScore.drops = Math.max(0, newScore.drops - 1);
            } else if (actionToDelete.type === 'penaltyTry') {
                newScore.penaltyTries = Math.max(0, newScore.penaltyTries - 1);
                newScore.tries = Math.max(0, newScore.tries - 1);
            }

            // Recalcular total
            newScore.total = (newScore.tries * 5) + (newScore.conversions * 2) + (newScore.penalties * 3) + (newScore.drops * 3) + ((newScore.penaltyTries || 0) * 2) + (newScore.manual || 0);

            updates[teamId] = { ...teamState, score: newScore };
        }

        // 2. Revertir Tarjeta
        else if (actionToDelete.type === 'card' && actionToDelete.linkedId) {
            const newCards = matchState.cards.filter((c: any) => c.id !== actionToDelete.linkedId);
            updates.cards = newCards;
        }

        // 3. Revertir Sustitución
        else if (actionToDelete.type === 'sub' && actionToDelete.subDetails) {
            const { teamId, subDetails } = actionToDelete;
            if (subDetails.playerIn?.id && subDetails.playerOut?.id) {
                // Intercambiar de nuevo: El que entró (In) sale, el que salió (Out) entra.
                const team = updates[teamId] || matchState[teamId];
                const newLineup = team.lineup.map((p: any) => {
                    if (p.id === subDetails.playerIn.id) return { ...p, isOnField: false };
                    if (p.id === subDetails.playerOut.id) return { ...p, isOnField: true };
                    return p;
                });
                updates[teamId] = { ...team, lineup: newLineup };
            }
        }

        // Aplicar todos los cambios
        const newActions = currentActions.filter((a: any) => a.id !== actionId);
        updateState({ ...updates, actions: newActions });
    };

    const updateSummaryConfig = (config: { maxItems?: number; filterTypes?: string[] }) => {
        const currentConfig = matchState.summaryConfig || { maxItems: 8, filterTypes: [] };
        updateState({
            summaryConfig: {
                ...currentConfig,
                ...config
            }
        });
    };

    const connectOBS = (config: { address: string; password: string }) => {
        sendCommand('obs-connect', config);
    };

    /**
     * Establece el tiempo de juego (1er o 2do tiempo).
     * Ajusta el reloj automáticamente (0:00 o 40:00).
     */
    const setHalf = (half: 1 | 2) => {
        const timeVal = half === 2 ? 2400 : 0; // 40 minutos * 60 segundos
        sendCommand('timer-reset', timeVal);

        // Generar entrada de log para cambio de tiempo
        const newAction: MatchAction | any = {
            id: Date.now().toString(),
            type: 'manual', // Usamos manual genérico para el log
            teamId: 'neutral',
            description: half === 2 ? "MATCH: Inicio 2ª Parte" : "MATCH: Fin 1ª Parte / Descanso",
            timestamp: half === 2 ? "40:00" : (matchState.timer.value ? `${Math.floor(matchState.timer.value / 60)}:${(matchState.timer.value % 60).toString().padStart(2, '0')}` : '00:00'),
            scoreSnapshot: { home: matchState.home.score.total, away: matchState.away.score.total }
        };

        const currentActions = matchState.actions || [];

        updateState({
            timer: {
                ...matchState.timer,
                half: half,
                label: half === 1 ? '1st Half' : '2nd Half',
                value: timeVal // Optimistic update
            },
            actions: [newAction, ...currentActions]
        });
    };

    /**
     * Reinicia todo el partido a 0.
     */
    const resetMatch = () => {
        sendCommand('timer-reset', 0);
        updateState({
            home: { ...matchState.home, score: { tries: 0, conversions: 0, penalties: 0, drops: 0, penaltyTries: 0, manual: 0, total: 0 } },
            away: { ...matchState.away, score: { tries: 0, conversions: 0, penalties: 0, drops: 0, penaltyTries: 0, manual: 0, total: 0 } },
            timer: { ...matchState.timer, value: 0, isRunning: false, half: 1, label: '1st Half' },
            cards: [],
            subs: [],
            actions: []
        });
    };

    const setLeagueLogo = (logo: string) => {
        updateState({ leagueLogo: logo });
    };

    const setScoreboardConfig = (config: { scale: number; opacity: number }) => {
        updateState({ scoreboardConfig: config });
    };

    const setLeagueLogoConfig = (config: { scale: number; opacity: number }) => {
        updateState({ leagueLogoConfig: config });
    };

    const setPresentationConfig = (config: {
        title: string;
        posterImage: string;
        showPoster: boolean;
        posterConfig?: { scale: number; opacity: number };
        logosConfig?: { scale: number; opacity: number };
        referee?: string;
        assistants?: string;
        commentators?: string;
        field?: string;
    }) => {
        updateState({ presentation: config });
    };

    const setSponsorsConfig = (config: { image: string; show: boolean; scale: number; opacity: number }) => {
        updateState({ sponsors: config });
    };

    const loadConfig = (config: Partial<MatchState>) => {
        updateState(config);
    };

    return (
        <MatchContext.Provider value={{
            matchState,
            isConnected,
            updateScore,
            updateTimer,
            updateTeamInfo,
            addCard,
            removeCard,
            setOverlayView,
            saveLabel,
            deleteLabel,
            deleteAction,
            updateSummaryConfig,
            connectOBS,
            setHalf,
            resetMatch,
            performSub,
            setLeagueLogo,
            setScoreboardConfig,
            setLeagueLogoConfig,
            setPresentationConfig,
            setSponsorsConfig,
            loadConfig
        }}>
            {children}
        </MatchContext.Provider>
    );
};

export const useMatch = () => {
    const context = useContext(MatchContext);
    if (context === undefined) {
        throw new Error('useMatch must be used within a MatchProvider');
    }
    return context;
};
