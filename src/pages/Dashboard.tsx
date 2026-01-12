import React, { useState } from 'react';
import { useMatch } from '../context/MatchContext';

import { LineupEditor } from '../components/LineupEditor';
import { LabelManager } from '../components/LabelManager';
import { ActionLog } from '../components/ActionLog';
import { SubstitutionControl } from '../components/SubstitutionControl';
import { PlayerSelectorModal } from '../components/PlayerSelectorModal';
import { Player } from '../types';
import pkg from '../../package.json'; // Import package.json
const { version } = pkg;

const btnStyle = {
    padding: '10px',
    borderRadius: '4px',
    border: 'none',
    background: '#555',
    color: 'white',
    cursor: 'pointer',
    fontWeight: 'bold'
};

// Simple Tabs Component
/**
 * Componente funcional de Pestañas (Tabs) simple.
 * Gestiona qué contenido se muestra según la pestaña activa (index).
 */
const Tabs = ({ children }: any) => {
    const [activeTab, setActiveTab] = useState(0);
    return (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div style={{ display: 'flex', borderBottom: '1px solid #444', padding: '0 20px', backgroundColor: '#252525' }}>
                {children.map((child: any, index: number) => (
                    <button
                        key={index}
                        onClick={() => setActiveTab(index)}
                        style={{
                            padding: '15px 20px',
                            background: activeTab === index ? '#444' : 'transparent',
                            color: activeTab === index ? 'white' : '#aaa',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '1em',
                            borderBottom: activeTab === index ? '3px solid #4caf50' : '3px solid transparent',
                            marginBottom: -1
                        }}
                    >
                        {child.props.label}
                    </button>
                ))}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                {children[activeTab]}
            </div>
        </div>
    );
};

const Tab = ({ children }: any) => children;

/**
 * Componente Principal: Dashboard
 * Es el panel de control del operador. Desde aquí se gestiona todo el partido:
 * - Puntuación y reloj
 * - Alineaciones y cambios
 * - Rótulos y Overlay
 * - Conexión con OBS y configuración
 */
export const Dashboard: React.FC = () => {
    // Consumimos todas las funciones del contexto global para manipular el estado
    const { matchState, isConnected, updateScore, updateTimer, updateTeamInfo, addCard, removeCard, setOverlayView, setHalf, resetMatch, setLeagueLogo, setScoreboardConfig, setLeagueLogoConfig, setPresentationConfig, setSponsorsConfig } = useMatch() as any;
    const { home, away, timer, cards } = matchState;

    // Estado para Modales y Puerto del Servidor
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [serverPort, setServerPort] = useState<number | null>(null);

    /**
     * Efecto para detectar el puerto del servidor Socket.IO.
     * Si estamos en Electron, usamos el Bridge IPC expuesto en preload.
     */
    React.useEffect(() => {
        const fetchPort = async () => {
            if ((window as any).ipcRenderer) {
                const port = await (window as any).ipcRenderer.getServerPort();
                setServerPort(port);
            }
        };
        fetchPort();
    }, []);

    // Estado para gestionar qué acción disparó el modal de selección de jugador
    const [modalAction, setModalAction] = useState<{
        type: 'score' | 'card';
        teamId: 'home' | 'away';
        details: any; // e.g. score type or card type
    } | null>(null);

    /**
     * Abre el modal para seleccionar quién anotó o recibió tarjeta.
     */
    const openSelector = (teamId: 'home' | 'away', type: 'score' | 'card', details: any) => {
        setModalAction({ teamId, type, details });
        setIsModalOpen(true);
    };

    /**
     * Callback cuando se selecciona un jugador en el modal.
     * Ejecuta la acción pendiente (sumar puntos o dar tarjeta).
     */
    const handlePlayerSelect = (player: Player | null) => {
        if (!modalAction) return;

        if (modalAction.type === 'score') {
            updateScore(modalAction.teamId, modalAction.details.type, modalAction.details.delta, player ? player.id : undefined);
        } else if (modalAction.type === 'card') {
            // Handle unknown player for cards
            const cardPlayer = player || { id: 'unknown-' + Date.now(), name: 'Desconocido', number: '', isStarter: false };

            const cardPayload = {
                id: Date.now().toString(),
                teamId: modalAction.teamId,
                player: cardPlayer,
                type: modalAction.details.cardType,
                timestamp: Date.now(),
                remainingSeconds: modalAction.details.cardType === 'yellow' ? 600 : (modalAction.details.cardType === 'red-20' ? 1200 : 0)
            };
            console.log('[Dashboard] Calling addCard with:', cardPayload);

            addCard(cardPayload);
        }
        setIsModalOpen(false);
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const overlayUrl = serverPort ? `http://localhost:${serverPort}/#/overlay` : 'Loading...';



    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#1a1a1a', color: 'white', overflow: 'hidden' }}>
            {/* Header */}
            {/* Header */}
            <header style={{
                padding: '10px 20px',
                backgroundColor: '#252525',
                borderBottom: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '60px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h2 style={{ margin: 0, fontSize: '1.2rem' }}>
                        Controlador de Rugby para OBS
                        <span style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 'normal', marginLeft: '10px' }}>v{version}</span>
                        <span style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 'normal', marginLeft: '10px' }}>creado por naniorion</span>
                    </h2>
                    {serverPort && (
                        <div style={{
                            backgroundColor: '#333',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '0.85rem',
                            display: 'flex',
                            gap: '10px',
                            alignItems: 'center'
                        }}>
                            <span style={{ color: '#aaa' }}>Overlay URL:</span>
                            <code style={{ color: '#4caf50', userSelect: 'all' }}>{overlayUrl}</code>
                        </div>
                    )}
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ marginRight: 10, color: isConnected ? '#4caf50' : '#f44336' }}>
                        {isConnected ? '● Conectado' : '● Desconectado'}
                    </span>
                    <button
                        onClick={() => {
                            if (window.confirm('¿Estás seguro de que quieres REINICIAR el partido? Esto borrará puntuaciones, acciones y temporizador.')) {
                                if (resetMatch) resetMatch();
                            }
                        }}
                        style={{ background: '#d32f2f', color: 'white', border: 'none', padding: '5px 15px', borderRadius: 4, cursor: 'pointer', marginRight: 10, fontWeight: 'bold' }}
                    >
                        REINICIAR PARTIDO
                    </button>
                    <a
                        href={overlayUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: '#aaa', textDecoration: 'none', border: '1px solid #555', padding: '5px 10px', borderRadius: 4 }}
                    >
                        Abrir Overlay
                    </a>
                </div>
            </header>

            <Tabs>
                <Tab label="Control Partido">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr', gap: '20px' }}>

                        {/* Home Team */}
                        <div className="panel" style={{ borderTop: `5px solid ${home.info.color}` }}>
                            <div style={{ display: 'flex', gap: 10, marginBottom: 15, alignItems: 'center' }}>
                                <input
                                    className="input-field"
                                    value={home.info.name}
                                    onChange={(e) => updateTeamInfo('home', { name: e.target.value })}
                                    style={{ fontSize: '1.2em', fontWeight: 'bold' }}
                                    placeholder="Nombre Equipo"
                                />
                                <input
                                    className="input-field"
                                    value={home.info.initials || ''}
                                    onChange={(e) => updateTeamInfo('home', { initials: e.target.value.toUpperCase().slice(0, 3) })}
                                    style={{ width: 70, textAlign: 'center', fontWeight: 'bold' }}
                                    placeholder="ABC"
                                    maxLength={3}
                                />
                                <input
                                    type="color"
                                    value={home.info.color}
                                    onChange={(e) => updateTeamInfo('home', { color: e.target.value })}
                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', height: 40, width: 40, padding: 0 }}
                                    title="Color de Equipo"
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15 }}>
                                <label style={{ fontSize: '0.9em', color: '#aaa', whiteSpace: 'nowrap' }}>Logo:</label>
                                <input
                                    className="input-field"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => updateTeamInfo('home', { logoVal: reader.result as string });
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    style={{ fontSize: '0.8em', padding: 5 }}
                                />
                                {home.info.logoVal && <img src={home.info.logoVal} alt="Home Logo" style={{ height: 35, borderRadius: 4, background: 'white', padding: 2 }} />}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 15, margin: '20px 0' }}>
                                <button onClick={() => updateScore('home', 'manual', -1)} className="btn btn-secondary" style={{ width: 50, fontSize: '1.2em' }}>-</button>
                                <div style={{ fontSize: '4em', fontWeight: 'bold', textAlign: 'center', minWidth: 80, lineHeight: 1 }}>{home.score.total}</div>
                                <button onClick={() => updateScore('home', 'manual', 1)} className="btn btn-secondary" style={{ width: 50, fontSize: '1.2em' }}>+</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                                <button onClick={() => openSelector('home', 'score', { type: 'try', delta: 1 })} className="btn" style={{ background: '#2196f3', color: 'white', fontWeight: 'bold' }}>Ensayo (+5)</button>
                                <button onClick={() => openSelector('home', 'score', { type: 'conversion', delta: 1 })} className="btn" style={{ background: '#4caf50', color: 'white', fontWeight: 'bold' }}>Conv (+2)</button>
                                <button onClick={() => openSelector('home', 'score', { type: 'penalty', delta: 1 })} className="btn" style={{ background: '#ff9800', color: 'white', fontWeight: 'bold' }}>Golpe (+3)</button>
                                <button onClick={() => openSelector('home', 'score', { type: 'drop', delta: 1 })} className="btn" style={{ background: '#00bcd4', color: 'white', fontWeight: 'bold' }}>Drop (+3)</button>
                                <button onClick={() => updateScore('home', 'penaltyTry', 1)} className="btn" style={{ gridColumn: 'span 2', background: '#e91e63', color: 'white', fontWeight: 'bold' }}>E. Castigo (+7)</button>
                            </div>

                            <div style={{ borderTop: '1px solid #444', paddingTop: 10 }}>
                                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9em', color: '#aaa' }}>Tarjetas</h4>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={() => openSelector('home', 'card', { cardType: 'yellow' })} className="btn" style={{ background: '#ffeb3b', color: 'black', flex: 1 }}>Amarilla</button>
                                    <button onClick={() => openSelector('home', 'card', { cardType: 'red-20' })} className="btn" style={{ background: '#b71c1c', color: 'white', flex: 1 }}>Roja 20m</button>
                                    <button onClick={() => openSelector('home', 'card', { cardType: 'red' })} className="btn" style={{ background: '#f44336', color: 'white', flex: 1 }}>Roja</button>
                                </div>
                            </div>
                            {/* Home Active Cards */}
                            <div style={{ marginTop: 15 }}>
                                {cards.filter((c: any) => c.teamId === 'home').map((card: any) => (
                                    <div key={card.id} className="flex-between" style={{ padding: '5px 0', borderBottom: '1px solid #333', fontSize: '0.9em' }}>
                                        <span style={{ color: card.type === 'yellow' ? '#ffeb3b' : '#f44336' }}>
                                            {card.type === 'yellow' ? 'Amarilla' : 'Roja'} ({card.player?.number || '?'})
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <span style={{ fontFamily: 'monospace' }}>
                                                {card.type === 'yellow' ? formatTime(card.remainingSeconds) : ''}
                                            </span>
                                            <button onClick={() => removeCard(card.id)} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>


                        {/* Center Timer */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div className="panel" style={{ textAlign: 'center' }}>
                                <h3 className="section-title" style={{ borderBottom: 'none', marginBottom: 5 }}>TIEMPO</h3>
                                <div style={{ fontSize: '4em', fontWeight: 'bold', fontFamily: 'monospace' }}>{formatTime(timer.value)}</div>

                                {/* Half Controls */}
                                <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginBottom: 15 }}>
                                    <button
                                        onClick={() => !timer.isRunning && setHalf && setHalf(1)}
                                        disabled={timer.isRunning}
                                        className={`btn ${timer.half === 1 ? 'btn-primary' : 'btn-secondary'}`}
                                        style={{
                                            fontSize: '0.8em',
                                            padding: '5px 10px',
                                            opacity: timer.isRunning ? 0.5 : 1,
                                            cursor: timer.isRunning ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        1ª Parte
                                    </button>
                                    <button
                                        onClick={() => !timer.isRunning && setHalf && setHalf(2)}
                                        disabled={timer.isRunning}
                                        className={`btn ${timer.half === 2 ? 'btn-primary' : 'btn-secondary'}`}
                                        style={{
                                            fontSize: '0.8em',
                                            padding: '5px 10px',
                                            opacity: timer.isRunning ? 0.5 : 1,
                                            cursor: timer.isRunning ? 'not-allowed' : 'pointer'
                                        }}
                                    >
                                        2ª Parte
                                    </button>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
                                    {!timer.isRunning ? (
                                        <button onClick={() => updateTimer('start')} className="btn btn-success">Iniciar</button>
                                    ) : (
                                        <button onClick={() => updateTimer('stop')} className="btn btn-warning">Parar</button>
                                    )}
                                    <button onClick={() => updateTimer('reset')} className="btn btn-secondary">Reiniciar</button>
                                </div>
                            </div>

                            {/* Manual Time Adjustment */}
                            <div className="panel" style={{ textAlign: 'center', marginTop: -10, padding: 10 }}>
                                <div style={{ fontSize: '0.8em', color: '#aaa', marginBottom: 5 }}>Ajustar Tiempo</div>
                                <div className="flex-center" style={{ gap: 5 }}>
                                    <input className="input-field" id="adjust-min" type="number" placeholder="MM" style={{ width: 50, textAlign: 'center' }} />
                                    <span>:</span>
                                    <input className="input-field" id="adjust-sec" type="number" placeholder="SS" style={{ width: 50, textAlign: 'center' }} />
                                    <button
                                        onClick={() => {
                                            const min = parseInt((document.getElementById('adjust-min') as HTMLInputElement).value) || 0;
                                            const sec = parseInt((document.getElementById('adjust-sec') as HTMLInputElement).value) || 0;
                                            updateTimer('set', (min * 60) + sec);
                                        }}
                                        className="btn btn-primary"
                                        style={{ padding: '5px 10px', marginLeft: 5 }}
                                    >
                                        Fijar
                                    </button>
                                </div>
                            </div>



                            {/* Overlay Controls (New) */}
                            <div className="panel" style={{ padding: 15, marginTop: 10 }}>
                                <h4 style={{ margin: '0 0 10px 0', color: '#aaa', fontSize: '0.9em' }}>Controles Overlay</h4>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                                    <button
                                        onClick={() => setOverlayView(matchState.overlay.activeView === 'match_summary' ? 'scoreboard' : 'match_summary')}
                                        className="btn"
                                        style={{
                                            background: '#9c27b0',
                                            color: 'white',
                                            border: matchState.overlay.activeView === 'match_summary' ? '2px solid #4caf50' : 'none',
                                            padding: '8px',
                                            fontSize: '0.9em',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        Resumen
                                    </button>
                                    <button
                                        onClick={() => setOverlayView(matchState.overlay.activeView === 'stats_comparison' ? 'scoreboard' : 'stats_comparison')}
                                        className="btn btn-primary"
                                        style={{
                                            border: matchState.overlay.activeView === 'stats_comparison' ? '2px solid #4caf50' : 'none',
                                            padding: '8px',
                                            fontSize: '0.9em',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        Estadísticas
                                    </button>
                                    <button
                                        onClick={() => setOverlayView(matchState.overlay.activeView === 'stats_lower' ? 'scoreboard' : 'stats_lower')}
                                        className="btn"
                                        style={{
                                            background: '#00bcd4',
                                            color: 'white',
                                            border: matchState.overlay.activeView === 'stats_lower' ? '2px solid #4caf50' : 'none',
                                            padding: '8px',
                                            fontSize: '0.9em',
                                            boxSizing: 'border-box'
                                        }}
                                    >
                                        Stats Inf.
                                    </button>
                                    <button
                                        onClick={() => setOverlayView('scoreboard')}
                                        className="btn btn-secondary"
                                        style={{ padding: '8px', fontSize: '0.9em' }}
                                    >
                                        Ocultar
                                    </button>
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5, marginTop: 5 }}>
                                    <button
                                        onClick={() => setOverlayView(matchState.overlay.activeView === 'lineup_home' ? 'scoreboard' : 'lineup_home')}
                                        className="btn"
                                        style={{
                                            background: '#e91e63',
                                            color: 'white',
                                            boxSizing: 'border-box',
                                            border: matchState.overlay.activeView === 'lineup_home' ? '2px solid #4caf50' : 'none',
                                            padding: '8px',
                                            fontSize: '0.9em'
                                        }}
                                    >
                                        Alineación L
                                    </button>
                                    <button
                                        onClick={() => setOverlayView(matchState.overlay.activeView === 'lineup_away' ? 'scoreboard' : 'lineup_away')}
                                        className="btn"
                                        style={{
                                            background: '#e91e63',
                                            color: 'white',
                                            boxSizing: 'border-box',
                                            border: matchState.overlay.activeView === 'lineup_away' ? '2px solid #4caf50' : 'none',
                                            padding: '8px',
                                            fontSize: '0.9em'
                                        }}
                                    >
                                        Alineación V
                                    </button>
                                    <button
                                        onClick={() => setOverlayView(matchState.overlay.activeView === 'presentation' ? 'scoreboard' : 'presentation')}
                                        className="btn"
                                        style={{
                                            background: '#673ab7',
                                            color: 'white',
                                            border: matchState.overlay.activeView === 'presentation' ? '2px solid #4caf50' : 'none',
                                            padding: '8px',
                                            fontSize: '0.9em'
                                        }}
                                    >
                                        Presentación
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!matchState.sponsors?.image) {
                                                alert("Primero debes subir una imagen para los Patrocinadores (Pestaña 'Presentación').");
                                                return;
                                            }
                                            setSponsorsConfig && setSponsorsConfig({ ...(matchState.sponsors || {}), show: !matchState.sponsors?.show });
                                        }}
                                        className="btn"
                                        style={{
                                            background: matchState.sponsors?.show ? '#4caf50' : '#607d8b',
                                            color: 'white',
                                            padding: '8px',
                                            fontSize: '0.9em'
                                        }}
                                    >
                                        Patrocinadores
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Away Team */}
                        <div className="panel" style={{ borderTop: `5px solid ${away.info.color}` }}>
                            <div style={{ display: 'flex', gap: 10, marginBottom: 15, alignItems: 'center' }}>
                                <input
                                    className="input-field"
                                    value={away.info.name}
                                    onChange={(e) => updateTeamInfo('away', { name: e.target.value })}
                                    style={{ fontSize: '1.2em', fontWeight: 'bold', textAlign: 'right' }}
                                    placeholder="Nombre Equipo"
                                />
                                <input
                                    className="input-field"
                                    value={away.info.initials || ''}
                                    onChange={(e) => updateTeamInfo('away', { initials: e.target.value.toUpperCase().slice(0, 3) })}
                                    style={{ width: 70, textAlign: 'center', fontWeight: 'bold' }}
                                    placeholder="ABC"
                                    maxLength={3}
                                />
                                <input
                                    type="color"
                                    value={away.info.color}
                                    onChange={(e) => updateTeamInfo('away', { color: e.target.value })}
                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', height: 40, width: 40, padding: 0 }}
                                    title="Color de Equipo"
                                />
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 15, flexDirection: 'row-reverse' }}>
                                <label style={{ fontSize: '0.9em', color: '#aaa', whiteSpace: 'nowrap' }}>Logo:</label>
                                <input
                                    className="input-field"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            const reader = new FileReader();
                                            reader.onloadend = () => updateTeamInfo('away', { logoVal: reader.result as string });
                                            reader.readAsDataURL(file);
                                        }
                                    }}
                                    style={{ fontSize: '0.8em', padding: 5 }}
                                />
                                {away.info.logoVal && <img src={away.info.logoVal} alt="Away Logo" style={{ height: 35, borderRadius: 4, background: 'white', padding: 2 }} />}
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 15, margin: '20px 0' }}>
                                <button onClick={() => updateScore('away', 'manual', -1)} className="btn btn-secondary" style={{ width: 50, fontSize: '1.2em' }}>-</button>
                                <div style={{ fontSize: '4em', fontWeight: 'bold', textAlign: 'center', minWidth: 80, lineHeight: 1 }}>{away.score.total}</div>
                                <button onClick={() => updateScore('away', 'manual', 1)} className="btn btn-secondary" style={{ width: 50, fontSize: '1.2em' }}>+</button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                                <button onClick={() => openSelector('away', 'score', { type: 'try', delta: 1 })} className="btn" style={{ background: '#2196f3', color: 'white', fontWeight: 'bold' }}>Ensayo (+5)</button>
                                <button onClick={() => openSelector('away', 'score', { type: 'conversion', delta: 1 })} className="btn" style={{ background: '#4caf50', color: 'white', fontWeight: 'bold' }}>Conv (+2)</button>
                                <button onClick={() => openSelector('away', 'score', { type: 'penalty', delta: 1 })} className="btn" style={{ background: '#ff9800', color: 'white', fontWeight: 'bold' }}>Golpe (+3)</button>
                                <button onClick={() => openSelector('away', 'score', { type: 'drop', delta: 1 })} className="btn" style={{ background: '#00bcd4', color: 'white', fontWeight: 'bold' }}>Drop (+3)</button>
                                <button onClick={() => updateScore('away', 'penaltyTry', 1)} className="btn" style={{ gridColumn: 'span 2', background: '#e91e63', color: 'white', fontWeight: 'bold' }}>E. Castigo (+7)</button>
                            </div>

                            <div style={{ borderTop: '1px solid #444', paddingTop: 10 }}>
                                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9em', color: '#aaa' }}>Tarjetas</h4>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    <button onClick={() => openSelector('away', 'card', { cardType: 'yellow' })} className="btn" style={{ background: '#ffeb3b', color: 'black', flex: 1 }}>Amarilla</button>
                                    <button onClick={() => openSelector('away', 'card', { cardType: 'red-20' })} className="btn" style={{ background: '#b71c1c', color: 'white', flex: 1 }}>Roja 20m</button>
                                    <button onClick={() => openSelector('away', 'card', { cardType: 'red' })} className="btn" style={{ background: '#f44336', color: 'white', flex: 1 }}>Roja</button>
                                </div>
                            </div>
                            {/* Away Active Cards */}
                            <div style={{ marginTop: 15 }}>
                                {cards.filter((c: any) => c.teamId === 'away').map((card: any) => (
                                    <div key={card.id} className="flex-between" style={{ padding: '5px 0', borderBottom: '1px solid #333', fontSize: '0.9em' }}>
                                        <span style={{ color: card.type === 'yellow' ? '#ffeb3b' : '#f44336' }}>
                                            {card.type === 'yellow' ? 'Amarilla' : 'Roja'} ({card.player?.number || '?'})
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                                            <span style={{ fontFamily: 'monospace' }}>
                                                {card.type === 'yellow' ? formatTime(card.remainingSeconds) : ''}
                                            </span>
                                            <button onClick={() => removeCard(card.id)} style={{ background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Saved Labels (Full Width) */}
                    <div className="panel" style={{ marginTop: 20 }}>
                        <h4 style={{ margin: '0 0 15px 0', color: '#aaa', fontSize: '1em', textTransform: 'uppercase' }}>Rótulos Guardados</h4>
                        {(!matchState.savedLabels || matchState.savedLabels.length === 0) ? (
                            <div style={{ color: '#666', fontStyle: 'italic' }}>No hay rótulos guardados.</div>
                        ) : (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
                                {matchState.savedLabels.map((lbl: any) => {
                                    const isActive = matchState.overlay.activeView === 'custom_label' && matchState.overlay.customLabelText === lbl.text;
                                    return (
                                        <button
                                            key={lbl.id}
                                            onClick={() => setOverlayView(isActive ? 'scoreboard' : 'custom_label', lbl.text, lbl.subtext, lbl.color)}
                                            style={{
                                                ...btnStyle,
                                                background: '#333',
                                                textAlign: 'left',
                                                borderLeft: `6px solid ${lbl.color}`, // Always show the color strip
                                                boxShadow: isActive ? '0 0 0 3px #4caf50' : 'none', // Active ring
                                                fontSize: '0.9em',
                                                padding: '15px'
                                            }}
                                        >
                                            <div style={{ fontWeight: 'bold', marginBottom: 5 }}>{lbl.text}</div>
                                            {lbl.subtext && <div style={{ fontSize: '0.8em', color: '#aaa' }}>{lbl.subtext}</div>}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </Tab>
                <Tab label="Sustituciones">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                        <SubstitutionControl teamId="home" />
                        <SubstitutionControl teamId="away" />
                    </div>
                </Tab>
                <Tab label="Alineaciones">
                    <div className="panel">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <LineupEditor teamId="home" />
                            <LineupEditor teamId="away" />
                        </div>
                    </div>
                </Tab>
                <Tab label="Rótulos">
                    <LabelManager />
                </Tab>
                <Tab label="Presentación">
                    <div className="panel">
                        <h3 className="section-title">Vista de Presentación</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 5 }}>Título del Partido</label>
                                <input
                                    className="input-field"
                                    value={matchState.presentation?.title || ''}
                                    onChange={(e) => setPresentationConfig && setPresentationConfig({ ...(matchState.presentation || {}), title: e.target.value })}
                                    placeholder="MATCH DAY"
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 5 }}>Cartel del Partido</label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="input-field"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                                const reader = new FileReader();
                                                reader.onloadend = () => setPresentationConfig && setPresentationConfig({ ...(matchState.presentation || {}), posterImage: reader.result as string });
                                                reader.readAsDataURL(file);
                                            }
                                        }}
                                        style={{ width: '100%', fontSize: '0.8em' }}
                                    />
                                    {matchState.presentation?.posterImage && (
                                        <div style={{ position: 'relative' }}>
                                            <img src={matchState.presentation.posterImage} alt="Poster" style={{ height: 40, background: '#fff', padding: 2, borderRadius: 4 }} />
                                            <button
                                                onClick={() => setPresentationConfig && setPresentationConfig({ ...(matchState.presentation || {}), posterImage: '' })}
                                                style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', border: 'none', width: 20, height: 20, cursor: 'pointer', lineHeight: '18px', padding: 0 }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    )}
                                </div>
                                {/* Poster Config */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <div>
                                        <label style={{ fontSize: '0.8em', color: '#ccc' }}>Tamaño: {matchState.presentation?.posterConfig?.scale || 1}x</label>
                                        <input
                                            type="range"
                                            min="0.5" max="2" step="0.1"
                                            value={matchState.presentation?.posterConfig?.scale || 1}
                                            onChange={(e) => setPresentationConfig && setPresentationConfig({
                                                ...(matchState.presentation || {}),
                                                posterConfig: { ...(matchState.presentation?.posterConfig || { scale: 1, opacity: 1 }), scale: parseFloat(e.target.value) }
                                            })}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ fontSize: '0.8em', color: '#ccc' }}>Opacidad: {matchState.presentation?.posterConfig?.opacity || 1}</label>
                                        <input
                                            type="range"
                                            min="0.1" max="1" step="0.1"
                                            value={matchState.presentation?.posterConfig?.opacity || 1}
                                            onChange={(e) => setPresentationConfig && setPresentationConfig({
                                                ...(matchState.presentation || {}),
                                                posterConfig: { ...(matchState.presentation?.posterConfig || { scale: 1, opacity: 1 }), opacity: parseFloat(e.target.value) }
                                            })}
                                            style={{ width: '100%' }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Logos Config */}
                        <div style={{ marginTop: 20, padding: 15, background: 'rgba(255,255,255,0.05)', borderRadius: 4 }}>
                            <h4 style={{ margin: '0 0 10px 0', fontSize: '1em' }}>Configuración Logos Equipos</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                                <div>
                                    <label style={{ fontSize: '0.8em', color: '#ccc', display: 'block' }}>Tamaño: {matchState.presentation?.logosConfig?.scale || 1}x</label>
                                    <input
                                        type="range"
                                        min="0.5" max="2" step="0.1"
                                        value={matchState.presentation?.logosConfig?.scale || 1}
                                        onChange={(e) => setPresentationConfig && setPresentationConfig({
                                            ...(matchState.presentation || {}),
                                            logosConfig: { ...(matchState.presentation?.logosConfig || { scale: 1, opacity: 1 }), scale: parseFloat(e.target.value) }
                                        })}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.8em', color: '#ccc', display: 'block' }}>Opacidad: {matchState.presentation?.logosConfig?.opacity || 1}</label>
                                    <input
                                        type="range"
                                        min="0.1" max="1" step="0.1"
                                        value={matchState.presentation?.logosConfig?.opacity || 1}
                                        onChange={(e) => setPresentationConfig && setPresentationConfig({
                                            ...(matchState.presentation || {}),
                                            logosConfig: { ...(matchState.presentation?.logosConfig || { scale: 1, opacity: 1 }), opacity: parseFloat(e.target.value) }
                                        })}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>


                    {/* Additional Match Info Inputs - Replaced Sponsors here */}
                    <div className="panel" style={{ marginTop: 20 }}>
                        <h3 className="section-title">Información del Partido</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                            <div>
                                <label style={{ fontSize: '0.9em', color: '#aaa', display: 'block', marginBottom: 5 }}>Árbitro</label>
                                <input
                                    className="input-field"
                                    value={matchState.presentation?.referee || ''}
                                    onChange={(e) => setPresentationConfig && setPresentationConfig({ ...(matchState.presentation || {}), referee: e.target.value })}
                                    style={{ width: '100%', marginBottom: 10 }}
                                    placeholder="Nombre del Árbitro"
                                />
                                <label style={{ fontSize: '0.9em', color: '#aaa', display: 'block', marginBottom: 5 }}>Asistentes</label>
                                <input
                                    className="input-field"
                                    value={matchState.presentation?.assistants || ''}
                                    onChange={(e) => setPresentationConfig && setPresentationConfig({ ...(matchState.presentation || {}), assistants: e.target.value })}
                                    style={{ width: '100%', marginBottom: 10 }}
                                    placeholder="Asistente 1, Asistente 2"
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.9em', color: '#aaa', display: 'block', marginBottom: 5 }}>Comentaristas</label>
                                <input
                                    className="input-field"
                                    value={matchState.presentation?.commentators || ''}
                                    onChange={(e) => setPresentationConfig && setPresentationConfig({ ...(matchState.presentation || {}), commentators: e.target.value })}
                                    style={{ width: '100%', marginBottom: 10 }}
                                    placeholder="Comentaristas..."
                                />
                                <label style={{ fontSize: '0.9em', color: '#aaa', display: 'block', marginBottom: 5 }}>Campo de Juego</label>
                                <input
                                    className="input-field"
                                    value={matchState.presentation?.field || ''}
                                    onChange={(e) => setPresentationConfig && setPresentationConfig({ ...(matchState.presentation || {}), field: e.target.value })}
                                    style={{ width: '100%', marginBottom: 10 }}
                                    placeholder="Estadio / Ciudad"
                                />
                            </div>
                        </div>
                    </div>
                </Tab>
                <Tab label="Resumen">
                    <ActionLog />
                </Tab>

                <Tab label="Configuración">
                    <div className="panel">
                        <h3 className="section-title">Conexión OBS</h3>
                        <div style={{ display: 'grid', gap: 10, maxWidth: 400 }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: 5 }}>Dirección OBS WebSocket</label>
                                <input
                                    className="input-field"
                                    id="obs-address"
                                    defaultValue={matchState.obsConfig?.address || 'ws://localhost:4455'}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: 5 }}>Contraseña</label>
                                <input
                                    className="input-field"
                                    id="obs-password"
                                    type="password"
                                    defaultValue={matchState.obsConfig?.password || ''}
                                />
                            </div>
                            <button
                                onClick={() => {
                                    const address = (document.getElementById('obs-address') as HTMLInputElement).value;
                                    const password = (document.getElementById('obs-password') as HTMLInputElement).value;
                                    // Use 'any' cast to avoid TS error if connectOBS is optional in type
                                    (useMatch() as any).connectOBS({ address, password });
                                }}
                                className={`btn ${matchState.obsConfig?.isConnected ? 'btn-success' : 'btn-primary'}`}
                            >
                                {matchState.obsConfig?.isConnected ? 'Conectado' : 'Conectar a OBS'}
                            </button>
                        </div>

                        <h3 className="section-title" style={{ marginTop: 30 }}>Personalización del Overlay</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                            {/* League Logo Group */}
                            <div className="panel" style={{ background: 'rgba(255,255,255,0.05)', padding: 15 }}>
                                <h4 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #444', paddingBottom: 5 }}>Logo de la Liga</h4>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: 'block', marginBottom: 5 }}>Imagen</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="input-field"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setLeagueLogo && setLeagueLogo(reader.result as string);
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            style={{ width: '100%', fontSize: '0.8em' }}
                                        />
                                        {matchState.leagueLogo && (
                                            <div style={{ position: 'relative' }}>
                                                <img src={matchState.leagueLogo} alt="League Logo" style={{ height: 40, background: '#fff', padding: 2, borderRadius: 4 }} />
                                                <button
                                                    onClick={() => setLeagueLogo && setLeagueLogo('')}
                                                    style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', border: 'none', width: 20, height: 20, cursor: 'pointer', lineHeight: '18px', padding: 0 }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* League Logo Config Sliders */}
                                <div style={{ marginBottom: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <label style={{ fontSize: '0.8em', color: '#ccc' }}>Tamaño: {matchState.leagueLogoConfig?.scale || 1}x</label>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.5" max="2.0" step="0.1"
                                        value={matchState.leagueLogoConfig?.scale || 1}
                                        onChange={(e) => setLeagueLogoConfig && setLeagueLogoConfig({ ...(matchState.leagueLogoConfig || { scale: 1, opacity: 1 }), scale: parseFloat(e.target.value) })}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <label style={{ fontSize: '0.8em', color: '#ccc' }}>Opacidad: {matchState.leagueLogoConfig?.opacity || 1}</label>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.1" max="1.0" step="0.1"
                                        value={matchState.leagueLogoConfig?.opacity || 1}
                                        onChange={(e) => setLeagueLogoConfig && setLeagueLogoConfig({ ...(matchState.leagueLogoConfig || { scale: 1, opacity: 1 }), opacity: parseFloat(e.target.value) })}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>

                            {/* Sponsors Config Group */}
                            <div className="panel" style={{ background: 'rgba(255,255,255,0.05)', padding: 15 }}>
                                <h4 style={{ margin: '0 0 15px 0', borderBottom: '1px solid #444', paddingBottom: 5 }}>Patrocinadores</h4>
                                <div style={{ marginBottom: 20 }}>
                                    <label style={{ display: 'block', marginBottom: 5 }}>Imagen</label>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <input
                                            className="input-field"
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const reader = new FileReader();
                                                    reader.onloadend = () => setSponsorsConfig && setSponsorsConfig({ ...(matchState.sponsors || { show: false, scale: 1, opacity: 1 }), image: reader.result as string });
                                                    reader.readAsDataURL(file);
                                                }
                                            }}
                                            style={{ width: '100%', fontSize: '0.8em' }}
                                        />
                                        {matchState.sponsors?.image && (
                                            <div style={{ position: 'relative' }}>
                                                <img src={matchState.sponsors.image} alt="Sponsors" style={{ height: 40, borderRadius: 4, background: 'white', padding: 2 }} />
                                                <button
                                                    onClick={() => setSponsorsConfig && setSponsorsConfig({ ...(matchState.sponsors || {}), image: '' })}
                                                    style={{ position: 'absolute', top: -5, right: -5, background: 'red', color: 'white', borderRadius: '50%', border: 'none', width: 20, height: 20, cursor: 'pointer', lineHeight: '18px', padding: 0 }}
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {/* Sliders */}
                                <div style={{ marginBottom: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <label style={{ fontSize: '0.8em', color: '#ccc' }}>Tamaño: {matchState.sponsors?.scale || 1}x</label>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.5" max="2" step="0.1"
                                        value={matchState.sponsors?.scale || 1}
                                        onChange={(e) => setSponsorsConfig && setSponsorsConfig({ ...(matchState.sponsors || { image: '', show: false, opacity: 1 }), scale: parseFloat(e.target.value) })}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <label style={{ fontSize: '0.8em', color: '#ccc' }}>Opacidad: {matchState.sponsors?.opacity || 1}</label>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.1" max="1" step="0.1"
                                        value={matchState.sponsors?.opacity || 1}
                                        onChange={(e) => setSponsorsConfig && setSponsorsConfig({ ...(matchState.sponsors || { image: '', show: false, scale: 1 }), opacity: parseFloat(e.target.value) })}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>

                            {/* Scoreboard Config */}
                            <div>
                                <label style={{ display: 'block', marginBottom: 5 }}>Configuración Marcador</label>
                                <div style={{ marginBottom: 10 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <label style={{ fontSize: '0.9em', color: '#aaa' }}>Tamaño (Escala): {matchState.scoreboardConfig?.scale || 1}x</label>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.5"
                                        max="1.5"
                                        step="0.1"
                                        value={matchState.scoreboardConfig?.scale || 1}
                                        onChange={(e) => setScoreboardConfig && setScoreboardConfig({ ...(matchState.scoreboardConfig || { scale: 1, opacity: 1 }), scale: parseFloat(e.target.value) })}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <label style={{ fontSize: '0.9em', color: '#aaa' }}>Opacidad: {matchState.scoreboardConfig?.opacity || 1}</label>
                                    </div>
                                    <input
                                        type="range"
                                        min="0.1"
                                        max="1.0"
                                        step="0.1"
                                        value={matchState.scoreboardConfig?.opacity || 1}
                                        onChange={(e) => setScoreboardConfig && setScoreboardConfig({ ...(matchState.scoreboardConfig || { scale: 1, opacity: 1 }), opacity: parseFloat(e.target.value) })}
                                        style={{ width: '100%' }}
                                    />
                                </div>
                            </div>
                        </div>

                        <h3 className="section-title" style={{ marginTop: 30 }}>Uso de la Aplicación</h3>
                        <p>1. Abrir OBS Studio.</p>
                        <p>2. Añadir Fuente de Navegador.</p>
                        <p>3. Establecer URL a: <code>http://localhost:3000/overlay</code> (o IP local).</p>
                        <p>4. Establecer Ancho: 1920, Alto: 1080.</p>
                        <p>5. Usa este panel para controlar el partido.</p>
                        <p>6. Configura OBS WebSocket arriba para funciones avanzadas.</p>
                    </div>
                </Tab>
            </Tabs >
            {
                isModalOpen && modalAction && (
                    <PlayerSelectorModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSelect={handlePlayerSelect}
                        team={modalAction.teamId === 'home' ? home.info : away.info}
                        players={matchState[modalAction.teamId].lineup}
                        title={
                            modalAction.type === 'score'
                                ? (
                                    modalAction.details.type === 'try' ? '¿Quién marcó el ensayo?' :
                                        modalAction.details.type === 'conversion' ? '¿Quién transformó?' :
                                            modalAction.details.type === 'penalty' ? '¿Quién metió el golpe?' :
                                                modalAction.details.type === 'drop' ? '¿Quién metió el drop?' :
                                                    '¿Quién marcó?'
                                )
                                : `¿Quién recibió la tarjeta ${modalAction.details.cardType === 'yellow' ? 'amarilla' : (modalAction.details.cardType === 'red-20' ? 'roja (20m)' : 'roja')}?`
                        }
                        cards={matchState.cards}
                    />
                )
            }
        </div >
    );
};
