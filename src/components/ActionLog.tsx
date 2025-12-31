import React from 'react';
import { useMatch } from '../context/MatchContext';

/**
 * Componente: ActionLog
 * Muestra el historial de eventos del partido (puntos, tarjetas, cambios).
 * Permite eliminar acciones (deshacer) y cambiar vistas del overlay.
 */
export const ActionLog: React.FC = () => {
    // Consumimos el estado global y función de deleteAction
    const { matchState, setOverlayView, deleteAction } = useMatch() as any;
    const actions = matchState.actions || [];

    return (
        <div style={{ height: '100%', padding: 20 }}>
            <div className="panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h3 className="section-title" style={{ margin: 0, borderBottom: 'none' }}>Registro del Partido</h3>
                    <div style={{ display: 'flex', gap: 10 }}>
                        {/* Botones para cambiar la vista del Overlay (Resumen, Estadísticas, Marcador) */}
                        <button
                            onClick={() => setOverlayView(matchState.overlay.activeView === 'match_summary' ? 'scoreboard' : 'match_summary')}
                            className="btn"
                            style={{
                                background: '#9c27b0',
                                color: 'white',
                                border: matchState.overlay.activeView === 'match_summary' ? '3px solid #4caf50' : 'none',
                                boxSizing: 'border-box'
                            }}
                        >
                            Mostrar Resumen
                        </button>
                        <button
                            onClick={() => setOverlayView(matchState.overlay.activeView === 'stats_comparison' ? 'scoreboard' : 'stats_comparison')}
                            className="btn btn-primary"
                            style={{
                                border: matchState.overlay.activeView === 'stats_comparison' ? '3px solid #4caf50' : 'none',
                                boxSizing: 'border-box'
                            }}
                        >
                            Ver Estadísticas
                        </button>
                        <button
                            onClick={() => setOverlayView(matchState.overlay.activeView === 'stats_lower' ? 'scoreboard' : 'stats_lower')}
                            className="btn"
                            style={{
                                background: '#00bcd4',
                                color: 'white',
                                border: matchState.overlay.activeView === 'stats_lower' ? '3px solid #4caf50' : 'none',
                                boxSizing: 'border-box'
                            }}
                        >
                            Estadísticas Inf.
                        </button>
                        <button onClick={() => setOverlayView('scoreboard')} className="btn btn-secondary">
                            Ocultar (Ver Marcador)
                        </button>
                    </div>
                </div>

                {/* Lista de Acciones con Scroll */}
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {actions.length === 0 && <div style={{ color: '#666', fontStyle: 'italic' }}>No hay acciones registradas.</div>}

                    {actions.map((act: any) => (
                        <div key={act.id} style={{ display: 'flex', background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden', alignItems: 'stretch' }}>
                            {/* Indicador de color del equipo */}
                            <div style={{ width: 4, background: act.teamId === 'home' ? matchState.home.info.color : act.teamId === 'away' ? matchState.away.info.color : '#777', flexShrink: 0 }} />

                            <div style={{ display: 'flex', gap: 10, padding: '10px 15px', flex: 1, justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                                    <span style={{ fontFamily: 'monospace', color: '#aaa', fontSize: '0.9em' }}>{act.timestamp}</span>
                                    <span style={{ fontWeight: 'bold' }}>{act.type.toUpperCase()}</span>
                                    <span style={{ color: '#ddd' }}>{act.description}</span>
                                </div>
                                {/* Botón para eliminar/deshacer acción */}
                                <button
                                    onClick={() => deleteAction(act.id)}
                                    style={{ background: 'transparent', border: 'none', color: '#ff4444', cursor: 'pointer', fontWeight: 'bold', padding: '0 5px', fontSize: '1.2em' }}
                                    title="Eliminar Acción"
                                >
                                    ×
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
