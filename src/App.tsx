// import React from 'react'; // React 17+ doesn't need this
import { Routes, Route } from 'react-router-dom';
import { MatchProvider } from './context/MatchContext';
import { Dashboard } from './pages/Dashboard';
import { Overlay } from './pages/Overlay';

/**
 * Componente Raíz de la Aplicación.
 * Configura el enrutamiento (Routes) y provee el contexto global (MatchProvider)
 * a todas las vistas (Dashboard y Overlay).
 */
function App() {
    return (
        <MatchProvider>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/overlay" element={<Overlay />} />
            </Routes>
        </MatchProvider>
    );
}

export default App;
