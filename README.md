# Rugby OBS Controller

Controlador profesional para transmisiones de Rugby en OBS, desarrollado con Electron, React y TypeScript.

## Características Principales

*   **Marcador en tiempo real**: Gestión de puntos (Ensayo, Transformación, Golpe, Drop) con cálculo automático.
*   **Cronómetro**: Control de tiempo con soporte para 1ª y 2ª parte, parada y ajuste manual.
*   **Gestión de Equipos**: Nombres, iniciales, colores y logos personalizables.
*   **Alineaciones**: Editor de alineaciones y gestión de sustituciones en tiempo real.
*   **Tarjetas**: Control de tarjetas amarillas (con temporizador de 10 min) y rojas.
*   **Overlay Dinámico**:
    *   Diseño moderno y limpio.
    *   Animaciones de entrada/salida.
    *   Resumen del partido (Log de acciones).
    *   Muestra de alineaciones y estadísticas.
    *   Textos en Español.
*   **Conexión OBS**: Integración vía Browser Source (Fuente de Navegador).

## Instrucciones de Instalación

### Opción A: Usar el Ejecutable (Portable)
Si ya tienes la carpeta `dist/win-unpacked` o el archivo `.exe` generado:
1.  No requiere instalación.
2.  Copia la carpeta entera donde quieras.
3.  Ejecuta `rugby-obs-controller.exe`.

### Opción B: Desarrollo (Código Fuente)
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

## Instrucciones de Uso

1.  **Abrir la Aplicación**: Ejecuta el programa. Se abrirá el **Panel de Control**.
2.  **Configurar OBS**:
    *   En el Panel de Control, busca el recuadro verde que dice **Overlay URL** (ej. `http://localhost:3000/#/overlay`).
    *   En OBS Studio, añade una **Fuente de Navegador (Browser Source)**.
    *   Pega la URL en el campo correspondiente.
    *   Establece el tamaño en **1920x1080**.
3.  **Gestionar el Partido**:
    *   Usa las pestañas para cambiar entre Puntuación, Sustituciones, Alineaciones, etc.
    *   Los cambios se reflejan inmediatamente en OBS.

## Cómo subir a GitHub

Para subir este proyecto a tu repositorio de GitHub:

1.  Crea un **nuevo repositorio** vacío en GitHub.
2.  Abre la terminal en la carpeta de este proyecto.
3.  Inicializa git (si no lo has hecho):
    ```bash
    git init
    ```
4.  Asegúrate de tener un archivo `.gitignore` (ver abajo).
5.  Añade los archivos:
    ```bash
    git add .
    ```
6.  Haz el primer commit:
    ```bash
    git commit -m "Versión inicial 1.0.0"
    ```
7.  Conecta con tu repositorio (cambia la URL por la tuya):
    ```bash
    git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
    ```
8.  Sube los cambios:
    ```bash
    git push -u origin master
    ```

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

    

---
*Creado por naniorion*
