import React from 'react';
import { Player, Team } from '../types';

interface PlayerSelectorModalProps {
    isOpen: boolean;        // Si el modal está visible
    onClose: () => void;    // Función para cerrar modal
    onSelect: (player: Player | null) => void; // Callback al elegir jugador
    team: Team;             // Equipo del que se muestran jugadores
    players: Player[];      // Lista de jugadores a mostrar
    title?: string;         // Título opcional
}

/**
 * Componente: PlayerSelectorModal
 * Ventana emergente para seleccionar un jugador de una lista.
 * Se usa al asignar tries, tarjetas o conversiones a un jugador específico.
 */
export const PlayerSelectorModal: React.FC<PlayerSelectorModalProps> = ({ isOpen, onClose, onSelect, team, players, title }) => {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                background: '#222',
                padding: 20,
                borderRadius: 8,
                width: 500,
                maxHeight: '80vh',
                display: 'flex',
                flexDirection: 'column',
                border: `2px solid ${team.color}`
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <h2 style={{ margin: 0 }}>{title || `Select ${team.name} Player`}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', fontSize: '1.5em', cursor: 'pointer' }}>×</button>
                </div>

                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Botón para seleccionar "Desconocido" o ninguno */}
                    <button
                        onClick={() => onSelect(null)}
                        style={{
                            padding: 15,
                            background: '#444',
                            border: '1px dashed #666',
                            borderRadius: 4,
                            color: '#aaa',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            textAlign: 'left',
                            fontStyle: 'italic'
                        }}
                    >
                        <span style={{ fontWeight: 'bold', fontSize: '1.2em', width: 30 }}>?</span>
                        <span>Jugador/a desconocido/a</span>
                    </button>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                        {players.sort((a, b) => parseInt(a.number) - parseInt(b.number)).map(player => {
                            const isActive = player.isOnField !== undefined ? player.isOnField : player.isStarter;
                            return (
                                <button
                                    key={player.id}
                                    onClick={() => onSelect(player)}
                                    style={{
                                        padding: 15,
                                        background: isActive ? '#333' : '#222',
                                        border: isActive ? '1px solid #666' : '1px solid #333',
                                        borderRadius: 4,
                                        color: isActive ? 'white' : '#666',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 10,
                                        textAlign: 'left'
                                    }}
                                >
                                    <span style={{ fontWeight: 'bold', fontSize: '1.2em', width: 30 }}>{player.number}</span>
                                    <span>{player.name}</span>
                                    {!isActive && <span style={{ fontSize: '0.8em', color: '#555', marginLeft: 'auto' }}>(Banquillo)</span>}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};
