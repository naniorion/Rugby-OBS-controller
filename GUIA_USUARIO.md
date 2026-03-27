# Manual de Usuario - Rugby OBS Controller

Este documento sirve como guía completa para el uso de la aplicación **Rugby OBS Controller**.

## 1. Introducción
**Rugby OBS Controller** es una aplicación diseñada para gestionar los gráficos y el marcador de una transmisión de rugby en tiempo real utilizando OBS Studio. Permite controlar el tiempo, los puntos, las tarjetas y las alineaciones desde un panel de control fácil de usar.

## 2. Instalación y Puesta en Marcha

### 2.1 Requisitos Previos
*   Ordenador con Windows.
*   OBS Studio instalado.
*   La carpeta de la aplicación (entregada como `.zip`).

### 2.2 Ejecución
1.  Abra la carpeta de la aplicación.
2.  Ejecute el archivo `rugby-obs-controller.exe`.
3.  Se abrirá la ventana principal de control.

### 2.3 Conexión con OBS
Para que los gráficos aparezcan en su transmisión:

1.  En el panel de control, localice la dirección URL de **Overlay** (de color verde), ej: `http://localhost:3000/#/overlay`.
2.  Abra **OBS Studio**.
3.  Añada una nueva fuente de tipo **Navegador** (Browser Source).
4.  En el campo URL, pegue la dirección que copió del controlador.
5.  Establezca el Ancho en **1920** y el Alto en **1080**.
6.  Acepte. Debería ver el marcador en pantalla.
7.  Esta fuente debe estar por encima de la fuente de captura de vídeo.

---

## 3. Interfaz de Usuario

### 3.1 Panel Principal (Dashboard)
Desde aquí se controla el desarrollo del partido.

![Panel Principal](./img/screenshots/dashboard.png)

*   **Control de Tiempo**: Botones Play/Pause para el cronómetro. Permite ajustar el tiempo manualmente si es necesario.
*   Los botones de **1ª** y **2ª parte** sólo se activan con el tiempo detenido. Al pulsarlos reiniciarán la cuenta a 00:00 ó 40:00 respectivamente.
*   **Puntuación**: Botones grandes para sumar puntos rápidamente:
    *   **Ensayo (Try)**: +5 Puntos.
    *   **Conversión/Transf**: +2 Puntos.
    *   **Golpe (Penalty)**: +3 Puntos.
    *   **Drop**: +3 Puntos
    *   **Ensayo de castigo**: +7 Puntos

    *   *Una vez pulsado el botón de puntuación, el programa pregunta qué jugador/a ha anotado y mostrará en el overlay un rótulo con la información de la anotación.*

<img width="1920" height="1140" alt="rugby-obs-controller (16)" src="https://github.com/user-attachments/assets/14127f3f-1322-4bb3-96ae-874c03fb526f" />
![rugby-obs-controller (1)](https://github.com/user-attachments/assets/04e3d4f8-017c-486e-a609-61cdd44b56bb)



*   **Tarjetas**: Gestión de amonestaciones. Al hacer clic en una tarjeta amarilla, se inicia una cuenta atrás de 10 minutos automáticamente en el overlay. En el caso de tarjeta roja se quedará marcada durante todo el partido.
*   **Guardar/Cargar Partido**: En la parte superior derecha, junto al botón de reiniciar, encontrará las opciones de:
    *   **Exportar Config.**: Guarda un archivo `.json` en su equipo con todos los nombres, logos, plantillas y opciones visuales actuales.
    *   **Importar Config.**: Permite cargar un archivo `.json` previo para recuperar al instante toda la configuración guardada de un partido.

### 3.2 Editor de Alineaciones
Permite configurar personas titulares y suplentes de cada equipo.

![Alineaciones](./img/screenshots/lineups.png)

*   Seleccione el equipo (Local o Visitante).
*   **Ingreso individual**: Rellene los nombres y dorsales, indique si está en el XV titular y haga clic en el botón "+" para actualizar la información.
*   **Ingreso masivo (Pegar Lista)**: Pulse el botón "Pegar Lista" para revelar una caja de texto. Aquí podrá pegar directamente desde Excel o un bloc de notas su lista de jugadores (usando el formato `[Número] [Nombre]`, un jugador por línea). El sistema detectará a los 15 primeros como titulares y al resto como finalizadores.
*   En caso de error, puede borrar pulsando la “x” roja.

### 3.3 Gestor de Rótulos (Labels)
Utilice esta sección para mostrar mensajes personalizados en pantalla, como "Descanso", "Estadísticas", quién está pateando…

![Gestor de Rótulos](./img/screenshots/labels.png)

1.  Escriba el Título y Subtítulo.
2.  Seleccione un color de fondo.
3.  Pulse **Mostrar** para lanzar el rótulo al aire o **Guardar rótulo** para utilizarlo más tarde.
4.  Los rótulos guardados se pueden activar también desde la pestaña **Control Partido**.

### 3.4 Gestor de sustituciones
Permite realizar cambios entre titulares y suplentes de cada equipo.

![Sustituciones](./img/screenshots/substitutions.png)

*   Seleccione jugador/a titular del equipo que quiera cambiar.
*   Seleccione jugador/a suplente.
*   Haga clic en el botón flechas y vuelva a pulsar para confirmar el cambio.
*   El programa mostrará en el overlay un rótulo con la información del cambio.

### 3.5 Pestaña Resumen
En esta pestaña se muestra el registro de acciones del partido.

![Resumen](./img/screenshots/summary.png)

*   Puede pulsar los botones **Mostrar Resumen**, **Ver estadísticas** y **Estadísticas Inf.** para mostrar en el overlay la información recogida en este registro, de diferentes maneras.
*   El botón **Ocultar (Ver Marcador)** oculta todos los rótulos.
*   Estos botones también se encuentran disponibles en la pestaña **Control Partido** para mayor comodidad.

### 3.6 Pestaña Configuración
En esta pestaña se encuentra la configuración del programa.

<img width="1920" height="983" alt="rugby-obs-controller (20)" src="https://github.com/user-attachments/assets/1fadcc99-0a9a-4911-9d8c-c578483a0879" />

*   Puede configurar la conexión de OBS con WebSocket. (Para futuras mejoras)
*   Puede agregar un **Logotipo y una imagen de patrocinadores** personalizados, que se verá en la esquina superior derecha y centrado en la parte inferior, respectivamente.
*   Puede ajustar el tamaño y la opacidad del logotipo y del resto del overlay con las barras de configuración.

### 3.7 Pestaña Presentación
En esta pestaña se encuentra la configuración de lo que se verá en el overlay cuando se pulse en “Presentación”. 

<img width="1920" height="1079" alt="rugby-obs-controller (6)" src="https://github.com/user-attachments/assets/a1857633-5c9d-4cff-8957-8036d05dd31d" />

*   Puede cambiar el título del partido / **nombre de la liga**.
*   Puede agregar un **cartel** y editar su tamaño y opacidad.
*   Puede modificar el tamaño y opacidad de los logos en la vista de presentación.
*   Puede añadir los nombres de las personas que arbitran y comentan el partido, y el nombre del estadio donde se juega.

### 3.8 Vista de Overlay (Salida)
Esta es la imagen que verá la audiencia. No tiene controles, solo muestra la información que usted envía desde el panel.

![Overlay](./img/screenshots/overlay.png)
<img width="1920" height="1009" alt="rugby-obs-controller (17)" src="https://github.com/user-attachments/assets/f4d15890-139a-485c-855f-f7c649a8c2d7" />

---

## 4. Preguntas Frecuentes

**¿Cómo cambio los nombres de los equipos?**
En la pestaña de configuración del Panel Principal, puede editar los nombres, siglas, colores y subir los logos de cada equipo.

**¿Qué pasa si me equivoco en el marcador?**
Puede restar puntos utilizando los botones de ajuste (-) o eliminar el registro en la pestaña Resumen.

**¿Qué pasa si se me ha olvidado poner el tiempo o quiero empezar desde un minuto distinto a 00:00?**
Puede fijar un tiempo determinado en la tarjeta **Ajustar tiempo** y pulsar en **Fijar**.
