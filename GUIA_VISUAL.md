# 📘 Guía Visual de Uso - Rugby OBS Controller

Esta guía explica de forma visual cómo funciona el sistema y cómo operarlo durante un partido.

## 1. ¿Cómo funciona el sistema?

El sistema tiene dos partes que se comunican entre sí: el **Panel de Control** (lo que tú usas) y el **Overlay** (lo que ve la audiencia en OBS).

```mermaid
graph LR
    A[🧑‍💻 TÚ] -->|Controlas| B(Panel de Control de Escritorio)
    B -->|Envía datos| C{Servidor Interno}
    C -->|Actualiza en tiempo real| D[📺 OBS Studio]
    D -->|Muestra| E(Overlay Gráfico)
    
    style B fill:#252525,stroke:#4caf50,stroke-width:2px,color:#fff
    style D fill:#1a1a1a,stroke:#9c27b0,stroke-width:2px,color:#fff
    style E fill:#fff,stroke:#333,stroke-width:1px,color:#000
```

---

## 2. Conexión con OBS (Paso a Paso)

Sigue este diagrama para conectar tu controlador con OBS Studio antes del partido.

```mermaid
sequenceDiagram
    participant User as Tu
    participant App as Controlador Rugby
    participant OBS as OBS Studio
    
    User->>App: 1. Abre el Programa
    App-->>User: Muestra "Overlay URL" (Verde)
    Note over User, App: Ej: http://localhost:3000/#/overlay
    
    User->>OBS: 2. Abre OBS Studio
    User->>OBS: 3. Añade Fuente "Navegador"
    User->>OBS: 4. Copia la URL del Controlador
    OBS->>App: Conecta al Servidor
    App-->>OBS: Envía Diseño Gráfico
    OBS-->>User: ¡Listo para transmitir!
```

**📸 Captura de Ayuda:**
*(Haz una captura del encabezado de tu Panel de Control donde sale la URL verde y pégala aquí o guárdala en una carpeta `img`)*
`![URL Verde](./img/url_ejemplo.png)`

---<img width="1920" height="235" alt="rugby-obs-controller_5Rwb0jERRk" src="https://github.com/user-attachments/assets/f77ba8dd-9a20-467a-bb15-552a9887ce11" />


## 3. Flujo de Trabajo en un Partido

Así es como debes operar el sistema durante la retransmisión.

```mermaid
stateDiagram-v2
    [*] --> Configuración
    
    state Configuración {
        [*] --> NombresEquipos
        NombresEquipos --> Colores
        Colores --> Logos
        Logos --> Alineaciones
    }
    
    Configuración --> Partido : Todo Listo
    
    state Partido {
        [*] --> 1a_Parte
        1a_Parte --> Descanso : Fin 40min
        Descanso --> 2a_Parte : Iniciar
        2a_Parte --> Fin : Fin 80min
        
        state Acciones_En_Juego {
            Ensayos
            Transformaciones
            Tarjetas
            Cambios
        }
    }
    
    Partido --> [*]
```

### 3.1 Gestión de Puntos
Usa los botones grandes de colores.
*   **Ensayo (Try)**: +5 Puntos.
*   **Conversión**: +2 Puntos.
*   **Golpe (Penalty)**: +3 Puntos.

### 3.2 Gestión de Tarjetas 🟨🟥
El sistema gestiona el tiempo de sanción automáticamente.

```mermaid
flowchart TD
    A[Falta Cometida] --> B{¿Tarjeta?}
    B -- Amarilla --> C[Click 'Amarilla']
    C --> D[Aparece en Overlay]
    C --> E[Cuenta Atrás 10:00]
    E --> F{¿Tiempo Agotado?}
    F -- Sí --> G[Desaparece Automáticamente]
    
    B -- Roja --> H[Click 'Roja']
    H --> I[Permanente en Pantalla]
```

---

## 4. Personalización Avanzada (Rótulos)

Puedes crear rótulos personalizados para mostrar información extra (ej. "Descanso", "Lesión", "Estadística").

1.  Ve a la pestaña **Rótulos**.
2.  Escribe Título y Subtítulo.
3.  Elige un color.
4.  Pulsa **MOSTRAR AHORA** para enviarlo al aire inmediatamente.
5.  O pulsa **GUARDAR** para tenerlo listo para después.

---

_Documento generado para Rugby OBS Controller v1.0.1_
