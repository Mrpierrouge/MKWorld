/** Petites briques de dialogues réutilisées par les écrans (AlertDialog / Dialog / ModalBottomSheet). */

function openOverlay(innerEl, { onBackdrop } = {}) {
  const backdrop = h('div', {
    class: 'overlay-backdrop',
    onclick: (e) => {
      if (e.target === backdrop) (onBackdrop || close)();
    },
  }, innerEl);
  document.body.append(backdrop);
  function close() {
    backdrop.remove();
  }
  return { close, backdrop };
}

function openModal(contentEl) {
  const card = h('div', { class: 'modal-card' }, contentEl);
  return openOverlay(card);
}

function openBottomSheet(contentEl) {
  const sheet = h('div', { class: 'bottom-sheet' }, [
    h('div', { class: 'bottom-sheet-handle' }),
    contentEl,
  ]);
  const backdrop = h('div', {
    class: 'overlay-backdrop bottom',
    onclick: (e) => { if (e.target === backdrop) close(); },
  }, sheet);
  document.body.append(backdrop);
  requestAnimationFrame(() => sheet.classList.add('open'));
  function close() {
    sheet.classList.remove('open');
    setTimeout(() => backdrop.remove(), 200);
  }
  return { close };
}

function confirmDialog({ title, message, confirmText = 'Confirmer', cancelText = 'Annuler', danger = true, onConfirm }) {
  let modal;
  const content = h('div', { class: 'alert-dialog' }, [
    h('h3', {}, title),
    h('p', {}, message),
    h('div', { class: 'alert-actions' }, [
      h('button', { class: 'btn btn-text', onclick: () => modal.close() }, cancelText),
      h('button', {
        class: 'btn btn-text' + (danger ? ' danger' : ''),
        onclick: () => { onConfirm(); modal.close(); },
      }, confirmText),
    ]),
  ]);
  modal = openModal(content);
  return modal;
}
