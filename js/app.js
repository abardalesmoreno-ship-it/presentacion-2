import { renderers } from './scenes/index.js';
import { createSession } from './scenes/shared.js';
import { scenes } from './scenes/catalog.js';
import { bindControls, createNavigator, sceneIndexFromHash } from './navigation.js';

export function mountApp({ document, window, createCity, services = {} }) {
const { history, location } = window;
const session = createSession();
document.querySelector('#app').innerHTML=`<header><div class="brand"><span class="brand-icon">◈</span><div>NEXO<small>URBAN INTELLIGENCE</small></div></div><div class="top-meta">USMP &nbsp; / &nbsp; ALGORITMOS Y ESTRUCTURA DE DATOS II</div><div class="status"><i></i>SISTEMA INTERACTIVO</div></header><main id="stage"></main><footer><div class="progress" id="progress"></div><div class="footer-left"><button id="menu" class="icon-btn" aria-label="Abrir escenas">☰</button><div class="counter" id="counter">01 <span>/ 17</span></div><span class="scene-name" id="scene-name">Portada cinematográfica</span></div><span class="kbd">← → NAVEGAR &nbsp; · &nbsp; ESPACIO PAUSAR</span><div class="footer-right"><button id="play" class="icon-btn" aria-label="Pausar animación">Ⅱ</button><button id="fullscreen" class="icon-btn" aria-label="Pantalla completa">⛶</button><button id="info" class="icon-btn" aria-label="Información">ⓘ</button><button id="prev" aria-label="Escena anterior">←</button><button id="next">Siguiente <span>→</span></button></div></footer><aside id="sidebar" hidden></aside><dialog id="dialog"><h3 id="dialog-title"></h3><div id="dialog-body"></div><button id="close-dialog">Cerrar</button></dialog>`;
const state={paused:window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false};
function showInfo(title,body){document.querySelector('#dialog-title').textContent=title;document.querySelector('#dialog-body').innerHTML=body;document.querySelector('#dialog').showModal();}
document.querySelector('#close-dialog').onclick=()=>document.querySelector('#dialog').close();
function renderCover(){document.querySelector('#stage').innerHTML=`<section class="scene hero"><div class="hero-visual" id="city"></div><div class="hero-copy"><div class="eyebrow">Inteligencia que conecta la ciudad</div><h1>La ruta más corta.<br>La decisión<br><span>más inteligente.</span></h1><p class="subtitle">Asignación del conductor más cercano.<br>De un punto en el mapa a una decisión en tiempo real: descubre los algoritmos que mueven la ciudad.</p><button class="primary" id="begin">COMENZAR EXPERIENCIA <b>↗</b></button><div class="academic"><strong>Universidad de San Martín de Porres</strong><br>Algoritmos y Estructura de Datos II &nbsp; · &nbsp; Grupo 02</div><div class="members"><span>Antezana Vargas<br>Jorge Jose</span><span>Bardales Moreno<br>Andres</span><span>Guerrero Yañez<br>Vanessa</span></div><div class="hero-footer"><span>COMAS, LIMA · PERÚ</span><span>17 ESCENAS / UNA DECISIÓN</span></div></div><div class="hero-tag">LIVE CITY MODEL &nbsp; / &nbsp; 3D SIMULADO</div><div class="hero-hint">ARRASTRA PARA EXPLORAR &nbsp; · &nbsp; SCROLL PARA ACERCAR</div></section>`;return createCity(document.querySelector('#city'),state);}
const stage = document.querySelector('#stage');
stage.setAttribute('aria-label', 'Escena de la presentación');
document.querySelector('#sidebar').innerHTML = `<h3>Explorar escenas <button id="close-menu" aria-label="Cerrar menú">×</button></h3><p class="note">Explora los algoritmos y ejecuta los laboratorios de NEXO.</p><nav aria-label="Escenas">${scenes.map((scene, index) => `<button class="scene-link" data-scene="${index}">${String(scene.id).padStart(2, '0')} · ${scene.title}</button>`).join('')}</nav>`;
document.querySelector('#menu').setAttribute('aria-controls', 'sidebar');
document.querySelector('#menu').setAttribute('aria-expanded', 'false');
document.querySelector('#sidebar').setAttribute('role', 'dialog');
document.querySelector('#sidebar').setAttribute('aria-modal', 'true');
document.querySelector('#sidebar').setAttribute('aria-label', 'Seleccionar escena');
document.querySelector('#counter').setAttribute('aria-live', 'polite');
document.querySelector('#progress').setAttribute('role', 'progressbar');
document.querySelector('#progress').setAttribute('aria-label', 'Progreso de la presentación');
document.querySelector('#progress').setAttribute('aria-valuemin', '1');
document.querySelector('#progress').setAttribute('aria-valuemax', String(scenes.length));
document.querySelector('#next').innerHTML = '<span class="desktop-label">Siguiente </span><span aria-hidden="true">→</span>';
document.querySelector('#next').setAttribute('aria-label', 'Escena siguiente');

function renderScene(index) {
  if (index === 0) {
    const cleanup = renderCover();
    stage.querySelector('h1').tabIndex = -1;
    const city = document.querySelector('#city');
    city.tabIndex = 0;
    city.setAttribute('aria-label', 'Ciudad 3D. Arrastra para rotar y usa la rueda para acercar.');
    city.setAttribute('data-keyboard-capture', '');
    return cleanup;
  }
  const renderer = renderers[index + 1];
  if (!renderer) throw new Error(`No existe renderer para la escena ${index + 1}`);
  return renderer({ document, window, stage, state, session, services, createCity, showInfo, navigate: id => navigator.goTo(id - 1) });
}

const navigator = createNavigator({
  count: scenes.length,
  initial: sceneIndexFromHash(location.hash, scenes.length),
  render: renderScene,
  update(index, count) {
    document.querySelector('#counter').innerHTML = `${String(index + 1).padStart(2, '0')} <span>/ ${count}</span>`;
    document.querySelector('#scene-name').textContent = scenes[index].title;
    document.querySelector('#progress').style.width = `${(index + 1) / count * 100}%`;
    document.querySelector('#progress').setAttribute('aria-valuenow', String(index + 1));
    document.querySelector('#prev').disabled = index === 0;
    document.querySelector('#next').disabled = index === count - 1;
    document.querySelectorAll('[data-scene]').forEach(button => {
      const active = Number(button.dataset.scene) === index;
      button.classList.toggle('active', active);
      if (active) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });
    history.replaceState(null, '', `#scene-${index + 1}`);
  },
});

// Los controles se registran antes de iniciar WebGL.
bindControls({
  document, window, navigator, state,
  onInfo: () => showInfo('Acerca de NEXO', '<p>Universidad de San Martín de Porres · Algoritmos y Estructura de Datos II · Grupo 02.</p><p>Flechas: cambiar escena. Inicio / Fin: primera y última. Espacio: pausar o reanudar. Los atajos se suspenden al editar, usar controles, abrir el menú o interactuar con la ciudad 3D.</p><p>Los laboratorios ejecutan algoritmos JavaScript propios sobre datos simulados. La cartografía base proviene de OpenStreetMap; los grafos de rutas son demostrativos. Los resultados Python solo se muestran si se importan.</p>'),
  onFullscreenError: () => showInfo('Pantalla completa no disponible', '<p>El navegador no permitió activar la pantalla completa. Puedes usar la opción de pantalla completa de su menú. La navegación sigue disponible.</p>'),
});
navigator.start();
window.__nexo = { state, navigator };

return { state, navigator, session };
}
