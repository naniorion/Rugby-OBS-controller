import React, { useState } from 'react';
import { useMatch } from '../context/MatchContext';
import { Player } from '../types';

interface LineupEditorProps {
    teamId: 'home' | 'away'; // Equipo al que pertenece
}

/**
 * Componente: LineupEditor
 * Gestiona la lista de jugadores (Titulares vs Banquillo).
 * Permite agregar, eliminar y listar jugadores.
 */
export const LineupEditor: React.FC<LineupEditorProps> = ({ teamId }) => {
    const { matchState, updateTeamInfo, setOverlayView } = useMatch();
    const team = matchState[teamId];
    // Estado local para el formulario de nuevo jugador
    const [newName, setNewName] = useState('');
    const [newNumber, setNewNumber] = useState('');
    const [isStarter, setIsStarter] = useState(true);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const [showBulkInput, setShowBulkInput] = useState(false);
    const [bulkText, setBulkText] = useState('');

    /**
     * Añade un nuevo jugador a la lista.
     * Valida que no exista el número duplicado.
     */
    const addPlayer = () => {
        if (!newName || !newNumber) return;

        // Validación: Revisar número duplicado
        const exists = (team.lineup || []).some((p: Player) => p.number === newNumber);
        if (exists) {
            setErrorMsg(`Player #${newNumber} already exists!`);
            setTimeout(() => setErrorMsg(null), 3000);
            return;
        }

        const newPlayer: Player = {
            id: Date.now().toString(),
            name: newName,
            number: newNumber,
            isStarter
        };
        const newLineup = [...(team.lineup || []), newPlayer];
        updateTeamInfo(teamId, { lineup: newLineup });
        setNewName('');
        setNewNumber('');
        setErrorMsg(null);
    };

    /**
     * Importación Masiva (Bulk Import)
     */
    const handleBulkImport = () => {
        if (!bulkText.trim()) return;

        const lines = bulkText.split('\n').map(l => l.trim()).filter(l => l);
        const currentLineup = [...(team.lineup || [])];
        let addedCount = 0;

        for (const line of lines) {
            // Regex match: Number followed by spaces/hyphens followed by the rest
            const match = line.match(/^(\d+)[-\s]+(.+)$/);
            if (match) {
                const num = match[1];
                const name = match[2].trim();

                if (!currentLineup.some(p => p.number === num)) {
                    const currentStarters = currentLineup.filter(p => p.isStarter).length;
                    
                    currentLineup.push({
                        id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
                        name: name,
                        number: num,
                        isStarter: currentStarters < 15
                    });
                    addedCount++;
                }
            }
        }

        if (addedCount > 0) {
            updateTeamInfo(teamId, { lineup: currentLineup });
            setBulkText('');
            setShowBulkInput(false);
            setErrorMsg(null);
        } else {
            setErrorMsg("No se pudieron importar jugadores. Formato válido: '15 Juan Pérez'");
            setTimeout(() => setErrorMsg(null), 3500);
        }
    };

    const removePlayer = (id: string) => {
        const newLineup = team.lineup.filter((p: Player) => p.id !== id);
        updateTeamInfo(teamId, { lineup: newLineup });
    };

    return (
        <div className="panel">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `3px solid ${matchState[teamId].info.color}`, paddingBottom: 10, marginBottom: 15 }}>
                <h3 style={{ margin: 0, color: 'white' }}>{matchState[teamId].info.name}</h3>
                {/* Botón para mostrar la alineación en pantalla */}
                <button
                    onClick={() => {
                        const isShowing = matchState.overlay?.activeView === `lineup_${teamId}`;
                        if (isShowing) {
                            setOverlayView('scoreboard');
                        } else {
                            setOverlayView(`lineup_${teamId}`);
                        }
                    }}
                    className={`btn ${matchState.overlay?.activeView === `lineup_${teamId}` ? 'btn-secondary' : 'btn-primary'}`}
                    style={{ background: matchState.overlay?.activeView === `lineup_${teamId}` ? '#555' : '#e91e63' }}
                >
                    {matchState.overlay?.activeView === `lineup_${teamId}` ? 'Ocultar Alineación' : 'Mostrar Alineación'}
                </button>
            </div>

            {/* Formulario de Input */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 15, alignItems: 'center' }}>
                <input
                    className="input-field"
                    value={newNumber}
                    onChange={(e) => setNewNumber(e.target.value)}
                    placeholder="#"
                    style={{ width: 60, textAlign: 'center' }}
                />
                <input
                    className="input-field"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Nombre"
                    style={{ flex: 1 }}
                />
                <label style={{ fontSize: '0.9em', display: 'flex', alignItems: 'center', gap: 5, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    <input
                        type="checkbox"
                        checked={isStarter}
                        onChange={(e) => setIsStarter(e.target.checked)}
                        style={{ width: 18, height: 18 }}
                    />
                    Titular
                </label>
                <button onClick={addPlayer} className="btn btn-success" style={{ padding: '0 20px', fontSize: '1.2em' }}>+</button>
                <button 
                    onClick={() => setShowBulkInput(!showBulkInput)} 
                    className={`btn ${showBulkInput ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ fontSize: '0.9em', marginLeft: 10 }}
                >
                    Pegar Lista
                </button>
            </div>

            {/* Panel de Importación Masiva */}
            {showBulkInput && (
                <div style={{ marginBottom: 15, background: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 5 }}>
                    <p style={{ margin: '0 0 10px 0', fontSize: '0.9em', color: '#ccc' }}>
                        Pega una lista desde Excel o Notas. Formato por línea: <code>[Número] [Nombre]</code> (ej. <i>15 Juan Pérez</i>).
                        Los 15 primeros ingresarán como titulares.
                    </p>
                    <textarea 
                        className="input-field" 
                        rows={6} 
                        style={{ width: '100%', marginBottom: 10, resize: 'vertical' }}
                        value={bulkText}
                        onChange={(e) => setBulkText(e.target.value)}
                        placeholder="1 Juan&#10;2 Carlos&#10;3 Pedro..."
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                        <button onClick={() => setShowBulkInput(false)} className="btn btn-secondary">Cancelar</button>
                        <button onClick={handleBulkImport} className="btn btn-success">Importar</button>
                    </div>
                </div>
            )}

            {/* Mensaje de Error en línea */}
            {errorMsg && (
                <div style={{
                    background: '#ffcdd2',
                    color: '#c62828',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    marginBottom: '10px',
                    fontSize: '0.9em',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    animation: 'fadeIn 0.3s ease-in-out'
                }}>
                    <span style={{ fontWeight: 'bold' }}>⚠</span>
                    {errorMsg}
                </div>
            )}

            <div style={{ maxHeight: 400, overflowY: 'auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                {/* Columna Titulares */}
                <div>
                    <h4 style={{ margin: '10px 0 10px', color: '#aaa', borderBottom: '1px solid #444', paddingBottom: 5 }}>Titulares</h4>
                    {matchState[teamId].lineup.filter((p: any) => p.isStarter).map((p: any) => (
                        <div key={p.id} className="flex-between" style={{ padding: '8px 10px', borderBottom: '1px solid #444', background: 'rgba(0,0,0,0.1)', marginBottom: 2, borderRadius: 4 }}>
                            <span style={{ fontSize: '1.1em' }}><b style={{ color: matchState[teamId].info.color, marginRight: 8 }}>{p.number}</b> {p.name}</span>
                            <button onClick={() => removePlayer(p.id)} style={{ color: '#f44336', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em', padding: '0 5px' }}>×</button>
                        </div>
                    ))}
                </div>

                {/* Columna Suplentes */}
                <div>
                    <h4 style={{ margin: '10px 0 10px', color: '#aaa', borderBottom: '1px solid #444', paddingBottom: 5 }}>Finalizadores/as</h4>
                    {matchState[teamId].lineup.filter((p: any) => !p.isStarter).map((p: any) => (
                        <div key={p.id} className="flex-between" style={{ padding: '8px 10px', borderBottom: '1px solid #444', background: 'rgba(0,0,0,0.1)', marginBottom: 2, borderRadius: 4 }}>
                            <span style={{ fontSize: '1.1em' }}><b style={{ color: '#aaa', marginRight: 8 }}>{p.number}</b> {p.name}</span>
                            <button onClick={() => removePlayer(p.id)} style={{ color: '#f44336', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2em', padding: '0 5px' }}>×</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
