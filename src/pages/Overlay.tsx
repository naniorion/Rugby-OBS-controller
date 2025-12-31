import React, { useEffect, useState } from 'react';
import { useMatch } from '../context/MatchContext';
import './Overlay.css'; // Import the CSS

/**
 * Componente Overlay: La vista que se muestra en OBS.
 * Muestra el marcador, el tiempo, rótulos, alineaciones y notificaciones de eventos.
 * Reacciona en tiempo real a los cambios en el contexto (MatchContext).
 */
export const Overlay: React.FC = () => {
    const { matchState } = useMatch();
    const { home, away, timer, cards } = matchState;

    // Estado local para controlar la visibilidad de notificaciones emergentes (ej. GOL, Cambio)
    const [notification, setNotification] = useState<{
        visible: boolean;
        type: 'sub' | 'score' | 'card' | null;
        data: any;
    }>({ visible: false, type: null, data: null });

    // Watch for new actions to trigger notifications
    useEffect(() => {
        if (matchState.actions && matchState.actions.length > 0) {
            // detailed check: if action is very recent (allows for page refresh without re-triggering old events if we tracked timestamp carefully, 
            // but for now relying on state update from socket might trigger this on connect. To fix, we could track 'lastActionId' ref)

            // Simple approach: Trigger on every new action IF it's distinct from header? 
            // Better: use a ref to store last processed ID.
        }
    }, [matchState.actions]);

    // Referencia para rastrear el ID de la última acción procesada y evitar notificaciones duplicadas al reconectar
    const lastActionIdRef = React.useRef<string | null>(null);

    /**
     * Efecto que observa la lista de 'actions' para disparar notificaciones visuales.
     * Se ejecuta cada vez que cambia la lista de acciones o las tarjetas.
     */
    useEffect(() => {
        if (matchState.actions && matchState.actions.length > 0) {
            const latest = matchState.actions[0];
            // Si es una acción nueva (ID diferente al último visto)
            if (latest.id !== lastActionIdRef.current) {
                // Validación: Si la nueva acción tiene ID menor que la actual, significa que se borró la última acción (undo).
                // En ese caso, actualizamos la referencia pero NO mostramos notificación.
                if (lastActionIdRef.current && parseInt(latest.id) < parseInt(lastActionIdRef.current)) {
                    lastActionIdRef.current = latest.id;
                    return;
                }
                lastActionIdRef.current = latest.id;

                // Lógica de disparadores (Triggers)
                if (latest.type === 'sub') {
                    setNotification({ visible: true, type: 'sub', data: latest });
                    setTimeout(() => setNotification(curr => ({ ...curr, visible: false })), 5000);
                } else if (['try', 'conversion', 'penalty', 'drop', 'card', 'penaltyTry'].includes(latest.type)) {
                    if (latest.player || ['try', 'conversion', 'penalty', 'drop', 'penaltyTry'].includes(latest.type)) {
                        // Enriquecemos los datos si es una tarjeta
                        let extraData = {};
                        if (latest.type === 'card') {
                            const relatedCard = cards.find((c: any) => c.id === latest.linkedId);
                            if (relatedCard) {
                                extraData = { cardType: relatedCard.type };
                            }
                        }
                        setNotification({ visible: true, type: 'score', data: { ...latest, ...extraData } });
                        setTimeout(() => setNotification(curr => ({ ...curr, visible: false })), 5000);
                    }
                }
            }
        }
    }, [matchState.actions, cards]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')} `;
    };

    const homeCards = cards.filter((c: any) => c.teamId === 'home');
    const awayCards = cards.filter((c: any) => c.teamId === 'away');

    const activeView = matchState.overlay?.activeView || 'scoreboard';

    /**
     * Helper para obtener el icono o imagen correspondiente a un tipo de acción.
     * Soporta rutas locales de imágenes y SVGs inline.
     */
    const getActionIcon = (type: string) => {
        // Mapa de Iconos PNG personalizados
        const iconMap: { [key: string]: string } = {
            'try': '/icons/ensayo_.png',
            'penaltyTry': '/icons/ensayo_castigo.png',
            'conversion': '/icons/transformacion.png',
            'penalty': '/icons/golpe.png',
            'drop': '/icons/drop.png'
        };

        if (iconMap[type]) {
            return (
                <img
                    src={iconMap[type]}
                    alt={type}
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
            );
        }

        // Icono de Sustitución
        if (type === 'sub') {
            return (
                <img
                    src="/icons/cambio.png"
                    alt="substitution"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                />
            );
        }

        // Tarjetas: SVG puro
        if (type.includes('yellow') || type.includes('red') || type === 'card') {
            const isRed = type.includes('red');
            const color = isRed ? '#ff4444' : '#ffd700';
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill={color}>
                    <rect x="4" y="3" width="16" height="20" rx="2" stroke="none" />
                </svg>
            );
        }

        if (type === 'sub') {
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 10h10" />
                    <path d="M10 7l-3 3 3 3" />
                    <path d="M17 14H7" />
                    <path d="M14 17l3-3-3-3" />
                </svg>
            );
        }

        return null;
    };

    /**
     * Renderiza el componente base del Marcador (Scoreboard).
     * Incluye logo, nombre y puntuación de ambos equipos, y el temporizador central.
     */
    const renderScoreboard = () => (
        <React.Fragment>
            <div className="scoreboard" style={{
                transform: `scale(${matchState.scoreboardConfig?.scale || 1})`,
                opacity: matchState.scoreboardConfig?.opacity || 1,
                transformOrigin: 'top center',
                transition: 'all 0.3s ease'
            }}>
                {/* Home Team */}
                <div className="team-panel" style={{ background: home.info.color }}>
                    {home.info.logoVal && <img src={home.info.logoVal} className="team-logo" style={{ maxHeight: 60, marginRight: 15, background: 'white', padding: 5, borderRadius: 4 }} />}
                    <div className="team-name">{home.info.initials || home.info.name}</div>
                    <div className="team-score">{home.score.total}</div>
                </div>

                {/* Timer */}
                <div className="timer-panel">
                    <div className="timer-value">{formatTime(timer.value)}</div>
                    <div className="timer-label">{timer.half === 1 ? '1st Half' : '2nd Half'}</div>
                </div>

                {/* Away Team */}
                <div className="team-panel" style={{ flexDirection: 'row-reverse', background: away.info.color }}>
                    {away.info.logoVal && <img src={away.info.logoVal} className="team-logo" style={{ maxHeight: 60, marginLeft: 15, background: 'white', padding: 5, borderRadius: 4 }} />}
                    <div className="team-name">{away.info.initials || away.info.name}</div>
                    <div className="team-score">{away.score.total}</div>
                </div>
            </div>

            {/* Floating Card Timers - Using Sprite Icons too? Or keep existing logic? 
                Existing logic uses `card - { type }` class. We should probably update this to use getActionIcon or keep it simple.
                The current floating cards use `card - icon card - { type }` classes which are CSS based (likely colors).
                User asked for "icons that I passed".
                Let's replace the floating card icon div with getActionIcon for consistency.
            */}
            <div style={{ position: 'absolute', top: 120, left: 40, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {homeCards.map((card: any) => {
                    if (card.type === 'yellow' && card.remainingSeconds <= 0) return null;
                    return (
                        <div key={card.id} className="card-indicator">
                            <div style={{ width: 24, height: 24 }}>{getActionIcon(`card-${card.type}`)}</div>
                            {card.type !== 'red' && <span>{formatTime(card.remainingSeconds)}</span>}
                            <span style={{ fontSize: '0.8em', opacity: 0.8 }}>#{card.player.number}</span>
                        </div>
                    );
                })}
            </div>

            <div style={{ position: 'absolute', top: 120, right: 40, display: 'flex', flexDirection: 'column', gap: 5 }}>
                {awayCards.map((card: any) => {
                    if (card.type === 'yellow' && card.remainingSeconds <= 0) return null;
                    return (
                        <div key={card.id} className="card-indicator">
                            <div style={{ width: 24, height: 24 }}>{getActionIcon(`card-${card.type}`)}</div>
                            {card.type !== 'red' && <span>{formatTime(card.remainingSeconds)}</span>}
                            <span style={{ fontSize: '0.8em', opacity: 0.8 }}>#{card.player.number}</span>
                        </div>
                    );
                })}
            </div>
        </React.Fragment>
    );

    // Render Logic
    return (
        <div className="overlay-container">
            {/* Always Render Scoreboard unless explicitly showing a full-screen take-over like Lineup or Summary? 
                Actually, user might want scoreboard visible even then. But usually lineups take focus.
                User specifically asked for "Rótulos" (Labels) to be visible WITH scoreboard.
            */}

            {(activeView === 'lineup_home' || activeView === 'lineup_away') && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10, background: 'rgba(0,0,0,0.5)' }}>
                    <div style={{
                        background: 'rgba(0,0,0,0.95)',
                        padding: 40,
                        borderRadius: 12,
                        width: 900, // Wider for 2 columns
                        borderTop: `6px solid ${activeView === 'lineup_home' ? home.info.color : away.info.color} `,
                        color: 'white',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginBottom: 20, borderBottom: '2px solid #444', paddingBottom: 15 }}>
                            {(activeView === 'lineup_home' ? home : away).info.logoVal && (
                                <img src={(activeView === 'lineup_home' ? home : away).info.logoVal} style={{ height: 100, objectFit: 'contain', background: 'white', padding: 10, borderRadius: 8 }} />
                            )}
                            <h1 style={{ margin: 0, textTransform: 'uppercase', fontSize: '2.5em' }}>
                                {(activeView === 'lineup_home' ? home : away).info.name}
                            </h1>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
                            {/* Starters */}
                            <div>
                                <h3 style={{ borderBottom: '1px solid #444', paddingBottom: 5, color: activeView === 'lineup_home' ? home.info.color : away.info.color }}>TITULARES</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    {(activeView === 'lineup_home' ? home : away).lineup.filter((p: any) => p.isStarter).map((p: any) => (
                                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', fontSize: '1.2em', padding: '2px 0', borderBottom: '1px solid #333' }}>
                                            <span style={{ fontWeight: 'bold', width: 40, color: (activeView === 'lineup_home' ? home.info.color : away.info.color) }}>{p.number}</span>
                                            <span>{p.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Bench */}
                            <div>
                                <h3 style={{ borderBottom: '1px solid #444', paddingBottom: 5, color: '#aaa' }}>SUPLENTES</h3>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    {(activeView === 'lineup_home' ? home : away).lineup.filter((p: any) => !p.isStarter).map((p: any) => (
                                        <div key={p.id} style={{ display: 'flex', alignItems: 'center', fontSize: '1.2em', padding: '2px 0', borderBottom: '1px solid #333' }}>
                                            <span style={{ fontWeight: 'bold', width: 40, color: '#aaa' }}>{p.number}</span>
                                            <span>{p.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Match Summary (Center) */}
            {activeView === 'match_summary' && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10, background: 'rgba(0,0,0,0.5)' }}>
                    <div style={{
                        background: 'rgba(0,0,0,0.95)',
                        padding: 30,
                        borderRadius: 12,
                        width: 900,
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        boxShadow: '0 10px 50px rgba(0,0,0,0.6)',
                    }}>
                        <h1 style={{ textAlign: 'center', margin: '0 0 20px 0', borderBottom: '1px solid #444', paddingBottom: 10, textTransform: 'uppercase', letterSpacing: 2 }}>Resumen del Partido</h1>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 1fr', gap: 20 }}>
                            {/* Headers */}
                            <div style={{ textAlign: 'right', borderBottom: `4px solid ${home.info.color} `, padding: 5, fontWeight: 'bold', fontSize: '1.2em' }}>{home.info.name}</div>
                            <div style={{ textAlign: 'center', color: '#888', padding: 5 }}>TIEMPO</div>
                            <div style={{ textAlign: 'left', borderBottom: `4px solid ${away.info.color} `, padding: 5, fontWeight: 'bold', fontSize: '1.2em' }}>{away.info.name}</div>

                            {/* Timeline Body */}
                            <div style={{ gridColumn: '1 / -1', maxHeight: 600, overflow: 'hidden', position: 'relative' }}>
                                <div className={(matchState.actions || []).length > 8 ? "scrolling-container" : ""} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                                    {(matchState.actions || [])
                                        .filter((a: any) => {
                                            const allowed = matchState.summaryConfig?.filterTypes;
                                            if (allowed && allowed.length > 0) return allowed.includes(a.type);
                                            return true;
                                        })
                                        .map((act: any) => {
                                            // Helper to translate Action Title
                                            const getActionTitle = (type: string, cardType?: string) => {
                                                if (type === 'try') return 'ENSAYO';
                                                if (type === 'conversion') return 'TRANSFORMACIÓN';
                                                if (type === 'penalty') return 'GOLPE DE CASTIGO';
                                                if (type === 'drop') return 'DROP';
                                                if (type === 'penaltyTry') return 'ENSAYO DE CASTIGO';
                                                if (type === 'sub') return 'CAMBIO';
                                                if (type === 'card' || type === 'yellow' || type === 'red') {
                                                    const finalType = cardType || type;
                                                    if (finalType.includes('red')) return 'TARJETA ROJA';
                                                    if (finalType.includes('yellow')) return 'TARJETA AMARILLA';
                                                    return 'TARJETA'; // Fallback
                                                }
                                                return type.toUpperCase();
                                            };

                                            const title = getActionTitle(act.type, act.cardType);

                                            // Helper to translate Description
                                            const getDescription = () => {
                                                // Specific format for Cards: "Para [number] - [Name]"
                                                if (act.type === 'card' || act.type === 'yellow' || act.type === 'red' || act.cardType) {
                                                    return `Para ${act.player?.number || '?'} - ${act.player?.name || 'Jugador'}`;
                                                }
                                                // Specific format for Subs: "Entra [In], Sale [Out]"
                                                if (act.type === 'sub' && act.subDetails) {
                                                    return `Entra ${act.subDetails.playerIn.name}, Sale ${act.subDetails.playerOut.name}`;
                                                }
                                                // Standard Scorers: "Name (#Num)"
                                                if (act.player) {
                                                    return `${act.player.name} (${act.player.number})`;
                                                }
                                                // Generic / Team Action
                                                const teamName = act.teamId === 'home' ? home.info.name : away.info.name;
                                                return `${teamName} marca ${title}`;
                                            };

                                            const description = getDescription();

                                            return (
                                                <div key={act.id} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 1fr', alignItems: 'center', gap: 20 }}>

                                                    {/* Left Column (Home Actions) */}
                                                    <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', opacity: act.teamId === 'home' ? 1 : 0 }}>
                                                        {act.teamId === 'home' && (
                                                            <>
                                                                <div style={{ margin: '0 10px', textAlign: 'right' }}>
                                                                    <div style={{ fontWeight: 'bold' }}>{title}</div>
                                                                    <div style={{ fontSize: '0.8em', color: '#ccc' }}>
                                                                        {description}
                                                                    </div>
                                                                </div>
                                                                <div style={{
                                                                    width: 40, height: 40,
                                                                    borderRadius: '50%',
                                                                    background: act.type === 'card' ? 'transparent' : home.info.color,
                                                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                                                    boxShadow: act.type === 'card' ? 'none' : '0 0 10px rgba(0,0,0,0.5)'
                                                                }}>
                                                                    {getActionIcon(act.type === 'card' ? (act.cardType || 'card') : act.type)}
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    {/* Center (Timestamp & Score) */}
                                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                                        <div style={{ textAlign: 'center', fontFamily: 'monospace', fontSize: '1.1em', color: 'gold', background: 'rgba(255,255,255,0.05)', padding: '5px', borderRadius: 4 }}>
                                                            {act.timestamp}
                                                        </div>
                                                        {act.scoreSnapshot && (
                                                            <div style={{ fontSize: '0.9em', color: '#fff', fontWeight: 'bold' }}>
                                                                {act.scoreSnapshot.home} - {act.scoreSnapshot.away}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Right Column (Away Actions) */}
                                                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', opacity: act.teamId === 'away' ? 1 : 0 }}>
                                                        {act.teamId === 'away' && (
                                                            <>
                                                                <div style={{
                                                                    width: 40, height: 40,
                                                                    borderRadius: '50%',
                                                                    background: act.type === 'card' ? 'transparent' : away.info.color,
                                                                    display: 'flex', justifyContent: 'center', alignItems: 'center',
                                                                    boxShadow: act.type === 'card' ? 'none' : '0 0 10px rgba(0,0,0,0.5)'
                                                                }}>
                                                                    {getActionIcon(act.type === 'card' ? (act.cardType || 'card') : act.type)}
                                                                </div>
                                                                <div style={{ margin: '0 10px', textAlign: 'left' }}>
                                                                    <div style={{ fontWeight: 'bold' }}>{title}</div>
                                                                    <div style={{ fontSize: '0.8em', color: '#ccc' }}>
                                                                        {description}
                                                                    </div>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                </div>
                                            )
                                        })}
                                </div>
                            </div>
                            {(matchState.actions || []).length === 0 && <div style={{ textAlign: 'center', color: '#666', marginTop: 20 }}>No hay eventos registrados.</div>}
                        </div>
                    </div>
                </div>
            )}

            {/* Stats Comparison View */}
            {activeView === 'stats_comparison' && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10, background: 'rgba(0,0,0,0.5)' }}>
                    <div style={{
                        background: 'rgba(0,0,0,0.95)',
                        padding: 40,
                        borderRadius: 12,
                        width: 700,
                        color: 'white',
                        boxShadow: '0 10px 50px rgba(0,0,0,0.6)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 20
                    }}>
                        <h1 style={{ textAlign: 'center', margin: 0, borderBottom: '1px solid #444', paddingBottom: 15, textTransform: 'uppercase', letterSpacing: 2 }}>Estadísticas</h1>

                        {/* Headers */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 150px 1fr', alignItems: 'center', marginBottom: 10 }}>
                            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5em', color: home.info.color }}>
                                <div>{home.info.name}</div>
                                <div style={{ fontSize: '2em', lineHeight: 1 }}>{home.score.total}</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '0.9em', color: '#888' }}>VS</div>
                                <div style={{ fontSize: '1.2em', fontFamily: 'monospace', color: 'gold', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 4, display: 'inline-block', marginTop: 5 }}>
                                    {formatTime(timer.value)}
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', fontWeight: 'bold', fontSize: '1.5em', color: away.info.color }}>
                                <div>{away.info.name}</div>
                                <div style={{ fontSize: '2em', lineHeight: 1 }}>{away.score.total}</div>
                            </div>
                        </div>

                        {/* Stat Rows */}
                        {[
                            { label: 'Ensayos', icon: 'try', h: home.score.tries, a: away.score.tries },
                            { label: 'Ensayos Castigo', icon: 'penaltyTry', h: home.score.penaltyTries, a: away.score.penaltyTries },
                            { label: 'Transformaciones', icon: 'conversion', h: home.score.conversions, a: away.score.conversions },
                            { label: 'Golpes de Castigo', icon: 'penalty', h: home.score.penalties, a: away.score.penalties },
                            { label: 'Drops', icon: 'drop', h: home.score.drops, a: away.score.drops },
                            { label: 'Tarjetas Amarillas', icon: 'card-yellow', h: homeCards.filter((c: any) => c.type === 'yellow').length, a: awayCards.filter((c: any) => c.type === 'yellow').length },
                            { label: 'Tarjetas Rojas', icon: 'card-red', h: homeCards.filter((c: any) => c.type === 'red').length, a: awayCards.filter((c: any) => c.type === 'red').length },
                            // Handling manual adjustments if needed? Maybe not relevant for stats count, only total score.
                        ].map((stat, i) => (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 150px 1fr', alignItems: 'center', padding: '10px 0', borderBottom: i < 5 ? '1px solid #222' : 'none' }}>
                                <div style={{ textAlign: 'center', fontSize: '1.8em', fontWeight: 'bold' }}>{stat.h}</div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                                    <div style={{ color: '#aaa', fontSize: '0.8em', textTransform: 'uppercase' }}>{stat.label}</div>
                                    <div style={{
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: '8px', // Changed to square-ish to fit sprite better? Or keep circle. Sprite is rectangular.
                                        width: 40, height: 40,
                                        display: 'flex', justifyContent: 'center', alignItems: 'center',
                                        overflow: 'hidden' // Ensure sprite doesn't bleed if we change size
                                    }}>
                                        {/* Use getActionIcon for ALL to enforce sprite */}
                                        {getActionIcon(stat.icon)}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'center', fontSize: '1.8em', fontWeight: 'bold' }}>{stat.a}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Lower Third Stats Bar - 2 Row Layout */}
            {activeView === 'stats_lower' && (
                <div style={{
                    position: 'absolute',
                    bottom: 40,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 10,
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    <div style={{
                        background: 'rgba(0,0,0,0.95)',
                        padding: '15px 30px',
                        borderRadius: 12,
                        color: 'white',
                        boxShadow: '0 10px 40px rgba(0,0,0,0.8)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10
                    }}>
                        {/* Helper to render a stat row */}
                        {[
                            { team: home, stats: home.score, cards: homeCards, align: 'left' },
                            { team: away, stats: away.score, cards: awayCards, align: 'left' }
                        ].map((row, idx) => (
                            <div key={idx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 30,
                                borderBottom: idx === 0 ? '1px solid #333' : 'none',
                                paddingBottom: idx === 0 ? 10 : 0
                            }}>
                                {/* Team Name & Logo */}
                                <div style={{
                                    width: 250,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 10,
                                    color: row.team.info.color,
                                    fontWeight: 'bold',
                                    fontSize: '1.4em'
                                }}>
                                    {row.team.info.logoVal && <img src={row.team.info.logoVal} style={{ height: 35, background: 'white', padding: 2, borderRadius: 4 }} />}
                                    {row.team.info.name}
                                </div>

                                {/* Stats Strip */}
                                <div style={{ display: 'flex', gap: 20 }}>
                                    {[
                                        { icon: 'try', val: row.stats.tries },
                                        { icon: 'conversion', val: row.stats.conversions },
                                        { icon: 'penalty', val: row.stats.penalties },
                                        { icon: 'drop', val: row.stats.drops },
                                        { icon: 'card-yellow', val: row.cards.filter((c: any) => c.type === 'yellow').length },
                                        { icon: 'card-red', val: row.cards.filter((c: any) => c.type === 'red').length },
                                    ].map((s, i) => (
                                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{
                                                width: 32, height: 32, // Increased slightly for visibility
                                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                                // Removed specific colors as the sprite has its own
                                            }}>
                                                {getActionIcon(s.icon)}
                                            </div>
                                            <div style={{ fontSize: '1.5em', fontWeight: 'bold', fontFamily: 'monospace', color: 'white' }}>{s.val}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {activeView === 'custom_label' && (
                <div style={{
                    position: 'absolute',
                    bottom: 40, // Bottom alignment
                    left: 40,   // Left alignment
                    display: 'flex',
                    zIndex: 20
                }}>
                    <div style={{
                        background: 'rgba(0,0,0,0.9)',
                        padding: '15px 30px',
                        borderRadius: 8,
                        borderLeft: `6px solid ${matchState.overlay.customLabelColor || '#fff'} `,
                        color: 'white',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        boxShadow: '0 5px 20px rgba(0,0,0,0.5)',
                        animation: 'slideUp 0.5s ease-out'
                    }}>
                        {/* Adjusted sizes to be "acorde al resto" (consistent) */}
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1 }}>
                            {matchState.overlay.customLabelText}
                        </div>
                        {matchState.overlay.customLabelSubtext && (
                            <div style={{ fontSize: '0.9rem', color: '#ccc', marginTop: 4 }}>
                                {matchState.overlay.customLabelSubtext}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Scoreboard is always visible in background for these non-fullscreen views, 
                OR we can choose to hide it for Lineup/Summary. 
                Let's keep it visible for Custom Label as requested. 
                For Lineup/Summary, maybe hide it to reduce clutter? 
                Let's hide it for Lineup/Summary to be safe, but SHOW for Custom Label.
            */}
            {/* Notification Pop-ups */}
            {notification.visible && notification.data && (
                <div style={{
                    position: 'absolute',
                    bottom: 120, // Above lower third stats
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 100,
                    animation: 'fadeInUp 0.5s ease-out'
                }}>
                    {notification.type === 'sub' && (
                        <div style={{
                            background: 'rgba(0,0,0,0.95)',
                            padding: 20,
                            borderRadius: 12,
                            borderTop: `4px solid ${notification.data.teamId === 'home' ? home.info.color : away.info.color} `,
                            color: 'white',
                            display: 'flex',
                            gap: 30,
                            alignItems: 'center',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.8)'
                        }}>
                            {(notification.data.teamId === 'home' ? home : away).info.logoVal && (
                                <img
                                    src={(notification.data.teamId === 'home' ? home : away).info.logoVal}
                                    style={{ height: 50, objectFit: 'contain', background: 'white', padding: 5, borderRadius: 4 }}
                                />
                            )}
                            <div style={{ fontSize: '1.2em', fontWeight: 'bold', color: notification.data.teamId === 'home' ? home.info.color : away.info.color, textTransform: 'uppercase' }}>Cambio</div>
                            <div style={{ width: 1, height: 40, background: '#444' }}></div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 15, color: '#f44336' }}>
                                    <span style={{ fontSize: '1.5em', fontWeight: 'bold' }}>▼</span>
                                    {notification.data.subDetails ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
                                                {notification.data.subDetails.playerOut.number}
                                            </span>
                                            <span style={{ fontSize: '1.2em' }}>{notification.data.subDetails.playerOut.name}</span>
                                        </div>
                                    ) : (
                                        <span>{notification.data.description.split('Out')[0].split(',')[1]?.replace(' Out', '').trim() || 'Player Out'}</span>
                                    )}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 15, color: '#4caf50' }}>
                                    <span style={{ fontSize: '1.5em', fontWeight: 'bold' }}>▲</span>
                                    {notification.data.subDetails ? (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <span style={{ fontSize: '1.2em', fontWeight: 'bold' }}>
                                                {notification.data.subDetails.playerIn.number}
                                            </span>
                                            <span style={{ fontSize: '1.2em' }}>{notification.data.subDetails.playerIn.name}</span>
                                        </div>
                                    ) : (
                                        <span>{notification.data.description.split(' In,')[0].replace('Substitution: ', '')}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {notification.type === 'score' && (
                        <div style={{
                            background: 'rgba(0,0,0,0.95)',
                            padding: '10px 40px',
                            borderRadius: 12,
                            borderLeft: `8px solid ${notification.data.teamId === 'home' ? home.info.color : away.info.color} `,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 20,
                            boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
                            minWidth: 400
                        }}>
                            <div style={{
                                width: 60, height: 60,
                                background: 'white',
                                borderRadius: '50%',
                                display: 'flex', justifyContent: 'center', alignItems: 'center',
                                fontSize: '2em', fontWeight: 'bold',
                                color: '#333'
                            }}>
                                {notification.data.player?.number || (['penaltyTry', 'try', 'conversion', 'penalty', 'drop'].includes(notification.data.type) ? '!' : '#')}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <div style={{ fontSize: '1.6em', fontWeight: 'bold', lineHeight: 1 }}>{notification.data.player?.name || (['penaltyTry', 'try', 'conversion', 'penalty', 'drop'].includes(notification.data.type) ? (notification.data.teamId === 'home' ? home.info.name : away.info.name) : 'Unknown Player')}</div>
                                <div style={{ fontSize: '1em', color: notification.data.teamId === 'home' ? home.info.color : away.info.color, textTransform: 'uppercase', fontWeight: 'bold', marginTop: 5 }}>
                                    {notification.data.type === 'try' ? 'ENSAYO' :
                                        notification.data.type === 'penaltyTry' ? 'ENSAYO DE CASTIGO' :
                                            notification.data.type === 'conversion' ? 'TRANSFORMACIÓN' :
                                                notification.data.type === 'penalty' ? 'GOLPE DE CASTIGO' :
                                                    notification.data.type === 'drop' ? 'DROP' :
                                                        (notification.data.type === 'yellow' || notification.data.cardType === 'yellow' || (notification.data.data && notification.data.data.cardType === 'yellow')) ? 'TARJETA AMARILLA' :
                                                            (notification.data.type === 'red' || notification.data.cardType === 'red' || (notification.data.data && notification.data.data.cardType === 'red')) ? 'TARJETA ROJA' :
                                                                notification.data.type.toUpperCase()}
                                </div>
                            </div>
                            <div style={{ marginLeft: 'auto', opacity: 0.8 }}>
                                {/* Show Action Icon */}
                                <div style={{ width: 50, height: 50 }}>
                                    {getActionIcon(notification.data.type === 'yellow' ? 'card-yellow' : notification.data.type === 'red' ? 'card-red' : notification.data.type)}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}


            {/* League Logo (Top Right) */}
            {matchState.leagueLogo && (
                <div style={{
                    position: 'absolute',
                    top: 40,
                    right: 40,
                    zIndex: 50,
                    transform: `scale(${matchState.leagueLogoConfig?.scale || 1})`,
                    opacity: matchState.leagueLogoConfig?.opacity || 1,
                    transformOrigin: 'top right',
                    transition: 'all 0.3s ease'
                }}>
                    <img src={matchState.leagueLogo} alt="League Logo" style={{ maxHeight: 100, objectFit: 'contain' }} />
                </div>
            )}

            {(activeView === 'scoreboard' || activeView === 'custom_label' || activeView === 'stats_lower') && renderScoreboard()}
        </div>
    );
};
