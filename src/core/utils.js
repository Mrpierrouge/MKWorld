/** Utilitaires génériques partagés par l'app. */

function uuid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function pickRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/** Couleur pastel aléatoire (HSL) — portage de TrackSelectionScreen.kt randomPastel. */
function randomPastelColor() {
  const hue = Math.floor(Math.random() * 360);
  return `hsl(${hue}, 50%, 85%)`;
}

/** Mini hyperscript : construit un élément DOM avec attributs/enfants. */
function h(tag, attrs, children) {
  const el = document.createElement(tag);
  attrs = attrs || {};
  for (const key of Object.keys(attrs)) {
    const value = attrs[key];
    if (value === false || value == null) continue;
    if (key === 'class') el.className = value;
    else if (key === 'style' && typeof value === 'object') Object.assign(el.style, value);
    else if (key === 'html') el.innerHTML = value;
    else if (key.startsWith('on') && typeof value === 'function') el.addEventListener(key.slice(2).toLowerCase(), value);
    else if (key === 'ref' && typeof value === 'function') value(el);
    else if (value === true) el.setAttribute(key, '');
    else el.setAttribute(key, value);
  }
  const kids = children == null ? [] : Array.isArray(children) ? children : [children];
  for (const kid of kids.flat(Infinity)) {
    if (kid == null || kid === false) continue;
    el.append(kid instanceof Node ? kid : document.createTextNode(String(kid)));
  }
  return el;
}

function clearChildren(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Simule le `combinedClickable(onClick, onLongClick)` de Compose : un clic court déclenche
 * onClick, un appui maintenu ~500ms déclenche onLongPress (et annule le onClick).
 */
function attachLongPress(el, onClick, onLongPress, delay = 500) {
  let timer = null;
  let longFired = false;
  const start = () => {
    longFired = false;
    timer = setTimeout(() => {
      longFired = true;
      onLongPress();
    }, delay);
  };
  const cancel = () => {
    if (timer) clearTimeout(timer);
  };
  el.addEventListener('pointerdown', start);
  el.addEventListener('pointerup', () => {
    cancel();
  });
  el.addEventListener('click', (e) => {
    if (longFired && e.detail !== 0) {
      longFired = false;
      e.preventDefault();
      return;
    }
    onClick();
  });
  el.addEventListener('pointerleave', cancel);
  el.addEventListener('contextmenu', (e) => e.preventDefault());
}

/** Petit titre "Minecraft" avec ombre rouge + texte jaune (TitleComposable.kt). */
function titleEl(text, fontSize) {
  return h('div', { class: 'mk-title', style: { fontSize: fontSize + 'px' } }, [
    h('span', { class: 'mk-title-shadow' }, text),
    h('span', { class: 'mk-title-front' }, text),
  ]);
}
