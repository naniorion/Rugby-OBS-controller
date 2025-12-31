import React, { useState } from 'react';
import { useMatch } from '../context/MatchContext';

/**
 * Componente: LabelManager
 * Permite crear, guardar y mostrar rótulos personalizados (lower thirds) en el overlay.
 * Gestiona una lista de colores recientes y rótulos guardados.
 */
export const LabelManager: React.FC = () => {
    const { matchState, setOverlayView, saveLabel, deleteLabel } = useMatch() as any;

    // Estado local para los campos del creador de rótulos
    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [color, setColor] = useState('#2196f3');
    // Historial de colores recientes (mock, podría persistirse)
    const [recentColors, setRecentColors] = useState<string[]>(['#2196f3', '#f44336', '#4caf50', '#ffeb3b', '#9c27b0']);

    /**
     * Guarda el rótulo actual en la lista de persistentes.
     */
    const handleSave = () => {
        if (!title) return;
        const newLabel = { id: Date.now().toString(), text: title, subtext: subtitle, color };
        if (saveLabel) saveLabel(newLabel);

        // Añadir a recientes si no existe
        if (!recentColors.includes(color)) {
            setRecentColors(prev => [color, ...prev].slice(0, 10)); // Mantiene los últimos 10
        }

        setTitle('');
        setSubtitle('');
    };



    return (
        <div style={{ padding: 20 }}>
            {/* Panel de Creación */}
            <div className="panel" style={{ marginBottom: 20 }}>
                <h3 className="section-title">Crear Rótulo Personalizado</h3>
                <div style={{ display: 'grid', gap: 15 }}>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ flex: 1 }}>
                            <label style={{ display: 'block', color: '#aaa', fontSize: '0.9em', marginBottom: 5 }}>Título Principal</label>
                            <input
                                className="input-field"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Ej. Descanso"
                                style={{ fontSize: '1.1em', fontWeight: 'bold' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', color: '#aaa', fontSize: '0.9em', marginBottom: 5 }}>Color</label>
                            <input
                                type="color"
                                value={color}
                                onChange={(e) => setColor(e.target.value)}
                                style={{ height: 42, width: 60, border: 'none', cursor: 'pointer', padding: 0, background: 'none' }}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', color: '#aaa', fontSize: '0.9em', marginBottom: 5 }}>Subtítulo (Opcional)</label>
                        <input
                            className="input-field"
                            value={subtitle}
                            onChange={(e) => setSubtitle(e.target.value)}
                            placeholder="Ej. Volvemos en 10 minutos"
                        />
                    </div>

                    {/* Presets de Color */}
                    <div>
                        <label style={{ display: 'block', color: '#aaa', fontSize: '0.9em', marginBottom: 5 }}>Colores Recientes / Predeterminados</label>
                        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                            {['#e91e63', '#9c27b0', '#2196f3', '#00bcd4', '#4caf50', '#ff9800', '#f44336', ...recentColors].filter((c, i, a) => a.indexOf(c) === i).slice(0, 10).map(c => (
                                <div
                                    key={c}
                                    onClick={() => setColor(c)}
                                    style={{
                                        width: 30, height: 30,
                                        background: c,
                                        cursor: 'pointer',
                                        borderRadius: '50%',
                                        border: color === c ? '2px solid white' : '2px solid transparent',
                                        boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                                        transition: 'transform 0.2s'
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Botones de Acción */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                        <button
                            onClick={() => setOverlayView('custom_label', title, subtitle, color)}
                            className="btn btn-primary"
                        >
                            Mostrar
                        </button>
                        <button
                            onClick={() => setOverlayView('scoreboard')}
                            className="btn btn-secondary"
                        >
                            Ocultar
                        </button>
                        <button
                            onClick={handleSave}
                            className="btn btn-success"
                        >
                            Guardar Rótulo
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista de Rótulos Guardados */}
            {matchState.savedLabels && matchState.savedLabels.length > 0 && (
                <div>
                    <h3 style={{ color: '#aaa' }}>Rótulos Guardados</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 15 }}>
                        {matchState.savedLabels.map((lbl: any) => (
                            <div key={lbl.id} style={{ background: '#333', borderRadius: 6, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                                <div style={{ display: 'flex', alignItems: 'stretch' }}>
                                    <div style={{ width: 6, background: lbl.color, flexShrink: 0 }} />
                                    <div
                                        onClick={() => { setTitle(lbl.text); setSubtitle(lbl.subtext); setColor(lbl.color); }}
                                        style={{ padding: '15px 20px', cursor: 'pointer', flex: 1 }}
                                    >
                                        <div style={{ fontWeight: 'bold', fontSize: '1.1em', marginBottom: 4 }}>{lbl.text}</div>
                                        {lbl.subtext && <div style={{ fontSize: '0.9em', color: '#aaa' }}>{lbl.subtext}</div>}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', borderTop: '1px solid #444' }}>
                                    <button
                                        onClick={() => {
                                            const isActive = matchState.overlay.activeView === 'custom_label' && matchState.overlay.customLabelText === lbl.text;
                                            setOverlayView(isActive ? 'scoreboard' : 'custom_label', lbl.text, lbl.subtext, lbl.color);
                                        }}
                                        style={{
                                            flex: 1,
                                            padding: 10,
                                            background: (matchState.overlay.activeView === 'custom_label' && matchState.overlay.customLabelText === lbl.text) ? '#4caf50' : 'none',
                                            color: (matchState.overlay.activeView === 'custom_label' && matchState.overlay.customLabelText === lbl.text) ? 'white' : '#2196f3',
                                            border: 'none',
                                            cursor: 'pointer',
                                            borderRight: '1px solid #444',
                                            fontWeight: 'bold'
                                        }}
                                    >
                                        {(matchState.overlay.activeView === 'custom_label' && matchState.overlay.customLabelText === lbl.text) ? 'Ocultar' : 'Mostrar'}
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteLabel && deleteLabel(lbl.id); }}
                                        style={{ width: 50, padding: 10, background: 'none', border: 'none', color: '#f44336', cursor: 'pointer', fontWeight: 'bold' }}
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
