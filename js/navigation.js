export function sceneIndexFromHash(hash, count) {
  const match = /^#scene-(\d+)$/.exec(hash);
  const index = match ? Number(match[1]) - 1 : 0;
  return Math.max(0, Math.min(count - 1, index));
}

export function isShortcutBlocked(event, { menuOpen = false, dialogOpen = false } = {}) {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || menuOpen || dialogOpen) return true;
  const target = event.target;
  if (target?.closest?.('button, a') && [' ', 'Enter'].includes(event.key)) return true;
  return Boolean(target?.closest?.('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [role="slider"], [role="textbox"], canvas, .leaflet-container, [data-keyboard-capture]'));
}

export function createNavigator({ count, initial = 0, render, update }) {
  let index = -1;
  let cleanup = () => {};
  function goTo(value) {
    if (!Number.isInteger(value)) return false;
    const next = Math.max(0, Math.min(count - 1, value));
    if (next === index) return false;
    cleanup();
    index = next;
    update(index, count);
    cleanup = render(index) || (() => {});
    return true;
  }
  return { get index() { return index; }, start: () => goTo(initial), goTo, next: () => goTo(index + 1), previous: () => goTo(index - 1), dispose: () => cleanup() };
}

export function bindControls({ document, window, navigator, state, onInfo, onFullscreenError }) {
  const el = id => document.getElementById(id);
  const sidebar = el('sidebar');
  let menuReturnFocus;
  function closeMenu(restoreFocus = true) {
    sidebar.hidden = true;
    el('menu').setAttribute('aria-expanded', 'false');
    if (restoreFocus) menuReturnFocus?.focus();
  }
  function toggleMenu() {
    if (!sidebar.hidden) { closeMenu(); return; }
    menuReturnFocus = document.activeElement;
    sidebar.hidden = false;
    el('menu').setAttribute('aria-expanded', 'true');
    (sidebar.querySelector('[aria-current="step"]') || el('close-menu')).focus();
  }
  function togglePause() { state.paused = !state.paused; syncPause(); }
  function syncPause() {
    document.documentElement.classList.toggle('is-paused', state.paused);
    el('play').textContent = state.paused ? '▶' : 'Ⅱ';
    el('play').setAttribute('aria-label', state.paused ? 'Reanudar animación' : 'Pausar animación');
    el('play').setAttribute('aria-pressed', String(state.paused));
    el('play').title = state.paused ? 'Reanudar animación' : 'Pausar animación';
  }
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else throw new Error('El navegador no ofrece la API de pantalla completa.');
    } catch (error) { onFullscreenError(error); }
  }
  function syncFullscreen() {
    const active = Boolean(document.fullscreenElement);
    el('fullscreen').setAttribute('aria-pressed', String(active));
    el('fullscreen').setAttribute('aria-label', active ? 'Salir de pantalla completa' : 'Pantalla completa');
  }
  // Delegación: el botón de portada se recrea al volver a ella.
  el('stage').addEventListener('click', event => {
    if (event.target.closest('#begin')) navigator.goTo(1);
  });
  el('next').addEventListener('click', () => navigator.next());
  el('prev').addEventListener('click', () => navigator.previous());
  el('menu').addEventListener('click', toggleMenu);
  el('close-menu').addEventListener('click', () => closeMenu());
  sidebar.addEventListener('click', event => {
    const button = event.target.closest('[data-scene]');
    if (!button) return;
    closeMenu(false);
    navigator.goTo(Number(button.dataset.scene));
    el('stage').querySelector('h1, h2')?.focus({ preventScroll: true });
  });
  el('play').addEventListener('click', togglePause);
  el('fullscreen').addEventListener('click', toggleFullscreen);
  el('info').addEventListener('click', onInfo);
  document.addEventListener('fullscreenchange', syncFullscreen);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !sidebar.hidden) { event.preventDefault(); closeMenu(); return; }
    if (!sidebar.hidden && event.key === 'Tab') {
      const buttons = [...sidebar.querySelectorAll('button')];
      const first = buttons[0], last = buttons.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      return;
    }
    if (isShortcutBlocked(event, { menuOpen: !sidebar.hidden, dialogOpen: el('dialog').open })) return;
    if (['ArrowRight', 'ArrowLeft', 'Home', 'End', ' '].includes(event.key)) {
      event.preventDefault();
      if (event.repeat) return;
      if (event.key === 'ArrowRight') navigator.next();
      if (event.key === 'ArrowLeft') navigator.previous();
      if (event.key === 'Home') navigator.goTo(0);
      if (event.key === 'End') navigator.goTo(16);
      if (event.key === ' ') togglePause();
    }
  });
  window.addEventListener('hashchange', () => navigator.goTo(sceneIndexFromHash(window.location.hash, 17)));
  syncPause();
  syncFullscreen();
}
