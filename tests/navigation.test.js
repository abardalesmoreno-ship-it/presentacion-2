import { test } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { mountApp } from '../js/app.js';
import { sceneIndexFromHash } from '../js/navigation.js';

function setup(hash = '', reducedMotion = false) {
  const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url: `http://localhost:5173/${hash}` });
  const { window } = dom, { document } = window;
  window.matchMedia = () => ({ matches: reducedMotion });
  const cities = [];
  document.querySelector('body').tabIndex = -1;
  const app = mountApp({ document, window, createCity(host, state) {
    const canvas = document.createElement('canvas');
    host.append(canvas);
    const city = { state, disposed: false };
    cities.push(city);
    return () => { city.disposed = true; canvas.remove(); };
  } });
  const key = (value, target = document.body, options = {}) => {
    const event = new window.KeyboardEvent('keydown', { key: value, bubbles: true, cancelable: true, ...options });
    target.dispatchEvent(event);
    return event;
  };
  return { ...app, document, window, cities, key, close() { app.navigator.dispose(); window.close(); } };
}

test('comenzar, siguiente y anterior usan los botones reales y actualizan progreso', () => {
  const app = setup();
  try {
    const { document: d, navigator } = app;
    assert.equal(navigator.index, 0);
    assert.equal(d.querySelector('#prev').disabled, true);
    // El clic en el icono también debe llegar al botón por delegación.
    d.querySelector('#begin b').click();
    assert.equal(navigator.index, 1);
    assert.match(d.querySelector('#counter').textContent, /02.*17/);
    assert.equal(d.querySelector('#progress').getAttribute('aria-valuenow'), '2');
    assert.ok(Math.abs(Number.parseFloat(d.querySelector('#progress').style.width) - 2 / 17 * 100) < .0001);
    assert.equal(d.querySelector('[data-lesson]').dataset.lesson, '2');
    d.querySelector('#next').click();
    assert.equal(navigator.index, 2);
    d.querySelector('#prev').click();
    assert.equal(navigator.index, 1);
    d.querySelector('#prev').click();
    assert.equal(navigator.index, 0);
    assert.equal(app.cities[0].disposed, true);
    assert.equal(app.cities.length, 2);
    d.querySelector('#begin').click();
    assert.equal(navigator.index, 1, 'comenzar funciona después de recrear portada');
  } finally { app.close(); }
});

test('se recorren los 17 destinos y los límites no salen del catálogo', () => {
  const app = setup();
  try {
    for (let index = 0; index < 17; index++) {
      assert.equal(app.navigator.index, index);
      assert.equal(app.document.querySelector('#progress').getAttribute('aria-valuenow'), String(index + 1));
      if (index < 16) app.document.querySelector('#next').click();
    }
    assert.equal(app.document.querySelector('#next').disabled, true);
    app.navigator.next();
    assert.equal(app.navigator.index, 16);
    for (let index = 15; index >= 0; index--) {
      app.document.querySelector('#prev').click();
      assert.equal(app.navigator.index, index);
    }
    app.navigator.previous();
    assert.equal(app.navigator.index, 0);
    assert.equal(app.document.querySelectorAll('[data-scene]').length, 17);
    assert.equal(app.document.querySelectorAll('canvas').length, 1);
  } finally { app.close(); }
});

test('menú selecciona escena, marca selección, cierra y devuelve foco con Escape', () => {
  const app = setup();
  try {
    const d = app.document, menu = d.querySelector('#menu');
    menu.focus(); menu.click();
    assert.equal(d.querySelector('#sidebar').hidden, false);
    assert.equal(menu.getAttribute('aria-expanded'), 'true');
    d.querySelector('[data-scene="7"]').click();
    assert.equal(app.navigator.index, 7);
    assert.equal(d.querySelector('#sidebar').hidden, true);
    assert.equal(d.querySelector('[aria-current="step"]').dataset.scene, '7');
    menu.focus(); menu.click(); app.key('Escape');
    assert.equal(d.querySelector('#sidebar').hidden, true);
    assert.equal(d.activeElement, menu);
    menu.click(); d.querySelector('#close-menu').click();
    assert.equal(d.querySelector('#sidebar').hidden, true);
  } finally { app.close(); }
});

test('teclado navega, respeta controles, mapas, WebGL, diálogo y menú', () => {
  const app = setup();
  try {
    app.key('ArrowRight'); assert.equal(app.navigator.index, 1);
    app.key('ArrowLeft'); assert.equal(app.navigator.index, 0);
    app.key('End'); assert.equal(app.navigator.index, 16);
    app.key('Home'); assert.equal(app.navigator.index, 0);
    for (const markup of ['<input>', '<textarea></textarea>', '<select></select>', '<div contenteditable="true"></div>', '<div class="leaflet-container"></div>', '<canvas></canvas>']) {
      const host = app.document.createElement('div'); host.innerHTML = markup; app.document.body.append(host);
      const event = app.key('ArrowRight', host.firstElementChild);
      assert.equal(app.navigator.index, 0, markup);
      assert.equal(event.defaultPrevented, false);
      host.remove();
    }
    app.key('ArrowRight', app.document.querySelector('#city'));
    assert.equal(app.navigator.index, 0);
    app.key('ArrowRight', app.document.body, { ctrlKey: true });
    assert.equal(app.navigator.index, 0);
    app.document.querySelector('#menu').click(); app.key('ArrowRight');
    assert.equal(app.navigator.index, 0);
    app.key('Escape');
    app.document.querySelector('#dialog').open = true; app.key('ArrowRight');
    assert.equal(app.navigator.index, 0);
    app.document.querySelector('#dialog').open = false;
    app.key('ArrowRight', app.document.querySelector('#next'));
    assert.equal(app.navigator.index, 1, 'las flechas siguen disponibles desde el footer');
  } finally { app.close(); }
});

test('pausa comparte estado con la ciudad y persiste al regresar a portada', () => {
  const app = setup();
  try {
    const play = app.document.querySelector('#play');
    play.click();
    assert.equal(app.state.paused, true);
    assert.equal(app.cities[0].state.paused, true);
    assert.equal(play.getAttribute('aria-pressed'), 'true');
    assert.equal(app.document.documentElement.classList.contains('is-paused'), true);
    app.navigator.next(); app.navigator.previous();
    assert.equal(app.cities.at(-1).state.paused, true);
    app.key(' ');
    assert.equal(app.state.paused, false);
    // El espacio sobre botón conserva su activación nativa (sin alternar dos veces).
    app.key(' ', play);
    assert.equal(app.state.paused, false);
  } finally { app.close(); }
});

test('pantalla completa solicita entrar/salir y sincroniza estado; errores se explican', async () => {
  const app = setup();
  try {
    const d = app.document, button = d.querySelector('#fullscreen');
    let requests = 0, exits = 0;
    d.documentElement.requestFullscreen = async () => { requests++; d.fullscreenElement = d.documentElement; d.dispatchEvent(new app.window.Event('fullscreenchange')); };
    d.exitFullscreen = async () => { exits++; d.fullscreenElement = null; d.dispatchEvent(new app.window.Event('fullscreenchange')); };
    button.click(); await Promise.resolve();
    assert.equal(requests, 1); assert.equal(button.getAttribute('aria-pressed'), 'true');
    button.click(); await Promise.resolve();
    assert.equal(exits, 1); assert.equal(button.getAttribute('aria-pressed'), 'false');
    d.querySelector('#dialog').showModal = () => { d.querySelector('#dialog').open = true; };
    d.documentElement.requestFullscreen = async () => { throw new Error('NotAllowedError'); };
    button.click(); await new Promise(resolve => setImmediate(resolve));
    assert.match(d.querySelector('#dialog-title').textContent, /no disponible/);
    assert.equal(d.querySelector('#dialog').open, true);
  } finally { app.close(); }
});

test('información abre y cierra el diálogo con los controles registrados', () => {
  const app = setup();
  try {
    const d = app.document, dialog = d.querySelector('#dialog');
    dialog.showModal = () => { dialog.open = true; };
    dialog.close = () => { dialog.open = false; };
    d.querySelector('#info').click(); assert.equal(dialog.open, true);
    assert.match(d.querySelector('#dialog-body').textContent, /JavaScript propios/);
    d.querySelector('#close-dialog').click(); assert.equal(dialog.open, false);
  } finally { app.close(); }
});

test('enlaces directos son válidos y movimiento reducido inicia en pausa', () => {
  assert.equal(sceneIndexFromHash('#scene-99', 17), 16);
  assert.equal(sceneIndexFromHash('#scene-0', 17), 0);
  assert.equal(sceneIndexFromHash('#invalido', 17), 0);
  const app = setup('#scene-8', true);
  try {
    assert.equal(app.navigator.index, 7);
    assert.equal(app.state.paused, true);
    app.navigator.previous();
    assert.equal(app.window.location.hash, '#scene-7');
  } finally { app.close(); }
});
