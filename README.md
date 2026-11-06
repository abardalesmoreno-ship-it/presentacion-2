# NEXO Urban Intelligence

Presentación académica interactiva de 17 escenas para la Universidad de San Martín de Porres, Algoritmos y Estructura de Datos II, Grupo 02. Integrantes: Antezana Vargas Jorge Jose, Bardales Moreno Andres y Guerrero Yañez Vanessa.

## Ejecutar y compilar

Requiere Node.js compatible con Vite 7 (20.19+ o 22.12+).

```powershell
cd D:\presentacion
npm.cmd install
npm.cmd run dev
```

Abrir `http://127.0.0.1:5173/`. `strictPort` evita abrir accidentalmente otro servidor si el puerto está ocupado. Si ya está sirviendo este proyecto, basta recargarlo. Alternativa: `npm.cmd run dev -- --port 5180`.

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run preview
npm.cmd run measure:node
```

La compilación genera `dist/`. No abrir `index.html` con `file://`. En PowerShell se usa `npm.cmd` para evitar el bloqueo de `npm.ps1`.

## Escenas y controles

| Escenas | Herramientas |
| --- | --- |
| 1 | Portada con ciudad geométrica Three.js y cámara orbital |
| 2–5 | Solicitudes variables, arquitectura inspeccionable, Leaflet/OSM y Quadtree editable |
| 6–9 | Calculadora Haversine, max-heap top-K, Dijkstra paso a paso y ETA editable |
| 10–13 | Despacho integrado, flota 3D con índice coherente, clic cartográfico y benchmark real |
| 14–17 | Curvas Big-O, pruebas ejecutables, comparación tecnológica y conclusiones con evidencia de sesión |

Comenzar abre la escena 2. Anterior/siguiente respetan los límites 1–17. Menú selecciona cualquier escena. Flechas navegan, Inicio/Fin van a los extremos, Espacio pausa. Los atajos respetan campos, mapas, cámara y ventanas modales. Sobre botones, Espacio conserva su activación nativa.

La pausa global detiene animaciones automáticas de ciudad, arquitectura, solicitudes, Heap, Dijkstra y flota. Se permite inspección manual y pasos explícitos. Cada escena libera timers, mapas, gráficos y recursos WebGL al salir. Pantalla completa depende de la autorización del navegador.

## Arquitectura

- `js/main.js`: entrada Vite, cinco CSS propios más Leaflet y KaTeX.
- `js/app.js`, `js/navigation.js`: DOM inicial, estado, selección y ciclo de vida.
- `js/scenes/block-a.js` a `block-d.js`: contenido y controles de las escenas 2–17; `shared.js` reúne utilidades visuales.
- `js/algorithms/`: Quadtree, Heap, Haversine, Dijkstra y ETA propios.
- `js/simulation/fleet.js`: generación reproducible, grafo y despachador.
- `js/simulation/model.js`: movimiento, coordenadas e índice espacial actualizado.
- `js/simulation/city.js`, `fleet-3d.js`: ciudad y flota con InstancedMesh.
- `js/maps/leaflet.js`, `js/runtime.js`: adaptadores reales de Leaflet, Chart.js, KaTeX, descarga y WebGL.
- `js/validation/checks.js`: 14 comprobaciones compartidas entre la presentación y Node Test Runner.
- `tests/`: pruebas de algoritmos, controles, integración, navegación, parsers y benchmarks.

## Datos y precisión académica

El mapa base es cartografía real de OpenStreetMap y requiere Internet. Las posiciones de vehículos, pasajeros, cuadrícula y rutas son **simuladas**. No existe una red vial local procesada. La escena 4 explica cómo descargarla con OSMnx, sin ejecutar Python ni sustituir Dijkstra propio.

El despachador consulta una región, filtra disponibilidad y conserva K candidatos con Heap/Haversine. Dijkstra usa 49 nodos sintéticos. Se suman conectores rectos entre cada punto y su nodo. El menor ETA solo es óptimo dentro de esos candidatos; no se garantiza el óptimo global ni se modela tráfico real.

Quadtree limita la profundidad a 18 para admitir coincidencias. Eliminar y actualizar recorren por ID; no se les atribuye coste logarítmico. Dijkstra puede omitir la traza para evitar sus copias al despachar. Las complejidades y el coste adicional educativo se explican en las escenas 5, 7, 8 y 14.

Los tres archivos de referencia originales no están disponibles: `Proyecto_2_Conductor_Cercano.docx`, `01 · Portada — Event Hubs vs. Service Bus.html` y `Texto pegado.txt`. No se ha comprobado una implementación Python ni sus restricciones originales.

## Benchmark e importaciones

Escena 13 mide JavaScript con `performance.now()`: 300, 3 000 y 30 000 puntos; 24 regiones idénticas para ambos métodos, calentamiento y cinco lotes de orden alternado. Se muestra mediana por consulta, construcción aparte y puntos examinados. Antes de medir se verifica igualdad de resultados. Los valores pequeños están sujetos a resolución del reloj, JIT y carga del equipo.

Admite archivos JSON/CSV de hasta 1 MB con columnas `n,linearMs,quadMs,linearExamined,quadExamined` y `environment` opcional. JSON acepta un arreglo o `{ "results": [...] }`. Los resultados importados se etiquetan como Python declarado por el usuario, **no ejecutado aquí**. La escena 17 exporta la evidencia acumulada en JSON.

## Validación y límites

`npm.cmd test` ejecuta los algoritmos y dispara eventos de controles en jsdom. La escena 15 ejecuta realmente sus 14 pruebas JavaScript al pulsar el botón; antes muestra “Sin ejecutar”. Los resultados se conservan durante la sesión y se incorporan a conclusiones. No hay resultados pytest ni Python preaprobados.

Las pruebas de DOM sustituyen Leaflet, Chart.js y WebGL con adaptadores: comprueban cambios de datos, eventos y liberación de recursos, **no píxeles, teselas externas ni GPU**. El acceso automatizado al navegador no está disponible en esta sesión. Queda revisión manual de consola, carga externa, pantalla completa y diseño en 1920×1080, 1366×768, 1024×768, 390×844, 320×568 y 844×390.

`measure:node` genera `assets/validation-node.json` con comprobaciones y benchmark realmente ejecutados en Node.js. Es un reporte independiente del benchmark del navegador y de Python; puede regenerarse en el equipo de exposición. Las pruebas de reproducción también ejecutan callbacks de animación con un reloj controlado para verificar pausa global/local y liberación de timers.

La estructura utiliza `100dvh`, filas reservadas para encabezado/footer y scroll solo dentro de paneles. La portada aumenta información académica y reequilibra el título; en ventanas excepcionalmente pequeñas se permite desplazamiento interno para conservar acceso al contenido.

Dependencias: Vite, Three.js/OrbitControls, Leaflet, Chart.js, KaTeX y jsdom para pruebas. Fuentes Google con alternativas locales. Sin credenciales ni backend.

## Referencias técnicas

- [H3: celdas globales, hexágonos y pentágonos](https://h3geo.org/docs/core-library/overview/)
- [S2: jerarquía de celdas](https://s2geometry.io/devguide/s2cell_hierarchy.html)
- [PostGIS: índices espaciales](https://postgis.net/workshops/en/postgis-intro/indexing.html)
- [OSMnx: descarga de redes](https://osmnx.readthedocs.io/en/stable/user-reference.html)
- [Leaflet](https://leafletjs.com/reference.html), [Three.js](https://threejs.org/docs/), [Vite](https://vite.dev/guide/)
