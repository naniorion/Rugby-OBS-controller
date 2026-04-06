# Rugby OBS Controller

Controlador profesional para transmisiones de Rugby en OBS, desarrollado con Electron, React y TypeScript.

## Características Principales

*   **Marcador en tiempo real**: Gestión de puntos (Ensayo, Transformación, Golpe, Drop) con cálculo automático.
*   **Cronómetro**: Control de tiempo con soporte para 1ª y 2ª parte, parada y ajuste manual.
*   **Gestión de Equipos**: Nombres, iniciales, colores y logos personalizables.
*   **Gestión de Partidos**: Guardar y cargar configuraciones completas (.json) para dejar los partidos preparados.
*   **Alineaciones**: Importación masiva automática (pegar desde Excel/Notas), editor manual y gestión de sustituciones en tiempo real.
*   **Tarjetas**: 
    *   Amarilla (temporizador 10 min).
    *   Roja (convencional).
    *   **Roja 20 Minutos**: Regla específica con temporizador de 20 min y notificación diferenciada.
*   **Overlay Dinámico**:
    *   Diseño moderno y limpio.
    *   **Presentación de Partido**: Cartel (Poster) configurable, logos de equipos con animaciones y datos del encuentro (Árbitro, Estadio, etc.).
    *   **Controles de Escala y Opacidad**: Ajuste en directo de logos, poster y patrocinadores.
    *   Animaciones de entrada/salida mejoradas.
    *   Resumen del partido (Log de acciones).
    *   Muestra de alineaciones y estadísticas comparativas.
    *   Textos en Español.
*   **Conexión OBS**: Integración vía Browser Source (Fuente de Navegador).

## Instrucciones de Instalación

### Descargar e Instalar (Recomendado)
La manera más sencilla de utilizar la aplicación es usar el instalador precompilado:

1.  Ve a la sección **[Releases](../../releases)** del repositorio (a la derecha en la página principal).
2.  Descarga el archivo `.exe` correspondiente a la última versión (ej. `rugby-obs-controller Setup 1.0.5.exe`).
3.  Ejecuta el archivo descargado para instalarlo y abrir la aplicación.

### Desarrollo (Código Fuente)
Si quieres modificar el código:
1.  Asegúrate de tener **Node.js** instalado.
2.  Clona este repositorio o descomprime el código.
3.  Abre una terminal en la carpeta del proyecto.
4.  Instala las dependencias:
    ```bash
    npm install
    ```
5.  Inicia en modo desarrollo:
    ```bash
    npm run dev
    ```

## Guía Básica de Uso

1.  **Abrir la Aplicación**: Tras instalar, ejecuta el programa para abrir el **Panel de Control** principal.
2.  **Preparar tu Partido**:
    *   En la pestaña superior ve a **Control Partido** y establece los nombres, iniciales y colores de los equipos (Local y Visitante). Puedes subir también logotipos de cada equipo.
    *   En **Configuración** puedes añadir una imagen de patrocinadores y un logo de la liga.
    *   En **Presentación** puedes añadir información sobre el partido (Cartel, árbitros, comentaristas, campo de juego...).
    *   Ve a la sección de **Alineaciones**, donde puedes añadir jugadores individualmente o utilizar el botón **Pegar Lista** para importar masivamente todo tu equipo de golpe copiando el texto desde Excel o Bloc de Notas.
    *   Puedes crear rótulos con un título y un subtítulo para mostrar información adicional durante el partido y guardarlos para más tarde o mostrarlos directamente.
    *   *(Recomendado)*: Una vez que hayas preparado los nombres, logos y gráficos, utiliza el botón **Exportar Config.** del cabezal. Esto creará un archivo `.json` en tu ordenador. Para próximos partidos, solamente tendrás que darle a **Importar Config.** para cargar todos los gráficos al momento.
3.  **Configurar OBS Studio**:
    *   En el Panel de Control, arriba a la izquierda, copia la ruta que aparece como señal en verde **Overlay URL** (ej. `http://localhost:3000/#/overlay`).
    *   Abre OBS Studio y añade desde las opciones una **Fuente de Navegador (Browser Source)**.
    *   Pega la URL que has copiado y define un tamaño de **1920 (Ancho)** y **1080 (Alto)**.
4.  **Durante el Partido**:
    *   Maneja el temporizador en vivo. Al sumar ensayos, conversiones o golpes, el programa actualizará el cálculo total y disparará las gráficas automáticamente en el lienzo de tu OBS.

## Estructura del Proyecto

*   `src/`: Código fuente de la interfaz (React).
    *   `pages/Dashboard.tsx`: Panel de control principal.
    *   `pages/Overlay.tsx`: Diseño gráfico que sale en OBS.
    *   `context/MatchContext.tsx`: "Cerebro" de la app, gestiona toda la lógica.
*   `electron/`: Código del proceso principal de escritorio.
*   `main.ts`: Configuración de ventanas y servidor. 

## Capturas de pantalla

<img width="1920" height="1032" alt="rugby-obs-controller (3)" src="https://github.com/user-attachments/assets/d74c0387-b192-4074-9dce-e4109b03408c" />
<img width="1920" height="1032" alt="rugby-obs-controller (2)" src="https://github.com/user-attachments/assets/19e60ddb-9ce4-44aa-8493-5c5ebd0ee314" />
<img width="1920" height="1140" alt="rugby-obs-controller (1)" src="https://github.com/user-attachments/assets/2f06cd9c-1d42-488f-ada2-04b443f0eacd" />
<img width="722" height="612" alt="rugby-obs-controller" src="https://github.com/user-attachments/assets/1bf2b3d8-bdac-4912-b05c-459961b5b17b" />
<img width="1920" height="1140" alt="rugby-obs-controller (18)" src="https://github.com/user-attachments/assets/1e12137c-fdb8-4abd-a4e5-a352c9381250" />
<img width="1920" height="1140" alt="rugby-obs-controller (16)" src="https://github.com/user-attachments/assets/abcc98f5-51cd-4cf3-b85d-edd61cbbbcf3" />
<img width="1920" height="1009" alt="rugby-obs-controller (15)" src="https://github.com/user-attachments/assets/25b8079f-f9db-4098-87b3-7619004a25d5" />
<img width="1920" height="1009" alt="rugby-obs-controller (14)" src="https://github.com/user-attachments/assets/c8b47a87-b6a0-477b-9e85-99782eaae725" />
<img width="1920" height="1140" alt="rugby-obs-controller (13)" src="https://github.com/user-attachments/assets/80ece464-bddb-49ab-8c6e-d401332f7a9d" />
<img width="1920" height="1140" alt="rugby-obs-controller (12)" src="https://github.com/user-attachments/assets/e3e594f1-5f82-4e5b-9c49-202317472dea" />
<img width="1920" height="1140" alt="rugby-obs-controller (11)" src="https://github.com/user-attachments/assets/f32f5c0c-6917-463a-95bf-df15d9c111d8" />
<img width="1920" height="1140" alt="rugby-obs-controller (10)" src="https://github.com/user-attachments/assets/cecf71fc-3ade-43fd-9247-b045d2c46b78" />
<img width="1920" height="1140" alt="rugby-obs-controller (9)" src="https://github.com/user-attachments/assets/4fa8b7c8-abda-4df5-90d3-df4ad35d7774" />
<img width="1920" height="1140" alt="rugby-obs-controller (8)" src="https://github.com/user-attachments/assets/72f5ebca-4d4e-4e24-bd5b-70a0105288d3" />
<img width="1920" height="1140" alt="rugby-obs-controller (7)" src="https://github.com/user-attachments/assets/9debd87d-495e-4bda-98a5-b027e6dd7302" />
<img width="1920" height="1140" alt="rugby-obs-controller (5)" src="https://github.com/user-attachments/assets/6471c29a-d252-4aa8-b5e0-9c770c35771a" />
<img width="1920" height="1140" alt="rugby-obs-controller (4)" src="https://github.com/user-attachments/assets/3ab90f3c-1807-4b8e-959d-158acf114ed1" />
<img width="1920" height="1079" alt="rugby-obs-controller (6)" src="https://github.com/user-attachments/assets/4a8e86c2-a5a5-4b0d-8097-5e6345e37110" />
<img width="1920" height="1009" alt="rugby-obs-controller (17)" src="https://github.com/user-attachments/assets/36ab0f06-e5d6-4a37-94a6-492eb21b24c7" />


    

---
*Creado por naniorion*
