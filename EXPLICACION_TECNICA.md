# Explicación Técnica: Controlador de Rugby para OBS

## Introducción
Esta aplicación es un sistema de control de gráficos en tiempo real para retransmisiones de Rugby en OBS Studio. Está construida utilizando **Electron** y **React**, lo que permite ejecutarla como una aplicación de escritorio nativa mientras sirve una interfaz web local para que OBS la incruste.

## Arquitectura General
El proyecto sigue una arquitectura **Cliente-Servidor (Local)**:

1.  **Backend (Electron/Main)**:
    *   Actúa como el servidor central autoritativo ("Source of Truth").
    *   Ejecuta un servidor **Express** y **Socket.IO** en el puerto 3000 (o superior).
    *   Mantiene el `MatchState` (estado del partido) global en memoria.
    *   Gestiona el **Cronómetro** de forma independiente para asegurar precisión.
    *   Maneja la conexión con **OBS WebSocket**.

2.  **Frontend (React/Renderer)**:
    *   Tiene dos vistas principales:
        *   **Dashboard**: Panel de control para el operador.
        *   **Overlay**: Vista limpia diseñada para ser capturada por OBS.
    *   Se conecta al Backend mediante **Socket.IO**.
    *   Utiliza `MatchContext` para distribuir el estado a los componentes de React.

## Flujo de Datos

El flujo de datos es **unidireccional y centralizado**:

1.  **Acción del Usuario**: El operador hace clic en un botón (ej. "Ensayo +5") en el `Dashboard`.
2.  **Contexto**: La función correspondiente en `MatchContext` (ej. `updateScore`) calcula el nuevo estado provisional o envía un comando.
3.  **Comunicación**: Se emite un evento Socket.IO (ej. `update-state` o comando específico `timer-start`) al proceso Main.
4.  **Procesamiento en Servidor**: `electron/main.ts` recibe el evento, actualiza el objeto `matchState` global y valida lógica si es necesario (ej. temporizadores).
5.  **Difusión (Broadcast)**: El servidor emite el evento `state-update` con el estado completo actualizado a **todos** los clientes conectados (Dashboard y Overlay).
6.  **Actualización UI**:
    *   El **Dashboard** actualiza los marcadores y listas.
    *   El **Overlay** recibe el nuevo estado y renderiza automáticamente la animación o cambio de gráfico correspondiente.

## Componentes Clave

### `src/types.ts`
Define las interfaces TypeScript que garantizan la consistencia de los datos en toda la app (`MatchState`, `Team`, `Score`, `MatchAction`, etc.).

### `src/context/MatchContext.tsx`
El "cerebro" del frontend. Envuelve la aplicación y provee funciones fáciles de usar (`addCard`, `performSub`) que abstraen la complejidad de la comunicación por Sockets.

### `src/hooks/useSocket.ts`
Hook personalizado que gestiona la conexión WebSocket. Detecta automáticamente si la app corre en Electron (usando IPC para obtener el puerto) o en navegador.

### `src/pages/Dashboard.tsx`
Interfaz de administración. Usa pestañas para organizar las diferentes tareas (Puntuación, Sustituciones, Alineaciones, Rótulos).

### `src/pages/Overlay.tsx`
Interfaz visual para la audiencia. Renderiza condicionalmente diferentes vistas (`scoreboard`, `lineup`, `summary`) basándose en la propiedad `activeView` del estado.

### `electron/main.ts`
Punto de entrada del backend. Inicializa la ventana, el servidor HTTP, el Socket.IO y el gestor de tiempo `TimerManager`.

## Estructura de Archivos

*   `/electron`: Código del proceso principal (Backend, Timer, Preload).
*   `/src`: Código del proceso de renderizado (Frontend React).
    *   `/components`: Componentes UI reutilizables (ActionLog, LineupEditor, etc.).
    *   `/context`: Gestión de estado (MatchContext).
    *   `/hooks`: Lógica reutilizable (useSocket).
    *   `/pages`: Vistas principales (Dashboard, Overlay).
    *   `/types.ts`: Definiciones de tipos.

## Notas sobre OBS
La integración con OBS se realiza de dos formas:
1.  **Fuente de Navegador**: OBS carga `http://localhost:3000/#/overlay`.
2.  **WebSocket (Opcional)**: La app puede conectarse a OBS para cambiar escenas automáticamente (funcionalidad preparada en `obsConfig`).
