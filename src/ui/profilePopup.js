/** Portage de ui/screens/ProfileCreationPopup.kt (création ET édition de profil). */

function openProfilePopup(profile, { onSave, onDismiss }) {
  let tempName = profile.name;
  let tempAvatar = profile.avatar;
  let tempColor = profile.color || DEFAULT_PROFILE_COLOR;

  const nameInput = h('input', {
    class: 'pp-field',
    type: 'text',
    placeholder: 'Ex: Mario, Luig, Birdo..',
    value: tempName,
    oninput: (e) => {
      tempName = e.target.value;
      saveBtn.disabled = !tempName.trim();
    },
  });

  const avatarGrid = h('div', { class: 'pp-avatar-grid' });
  function renderAvatarGrid() {
    clearChildren(avatarGrid);
    AVATARS.forEach((a) => {
      const img = h('img', {
        src: a.img,
        class: 'pp-avatar' + (tempAvatar === a.id ? ' selected' : ''),
        onclick: () => { tempAvatar = a.id; renderAvatarGrid(); },
      });
      avatarGrid.append(img);
    });
  }
  renderAvatarGrid();

  const colorRow = h('div', { class: 'pp-color-row' });
  function renderColorRow() {
    clearChildren(colorRow);
    AVATAR_COLORS.forEach((c) => {
      colorRow.append(h('div', {
        class: 'pp-color' + (tempColor.toLowerCase() === c.toLowerCase() ? ' selected' : ''),
        style: { background: c },
        onclick: () => { tempColor = c; renderColorRow(); },
      }));
    });
  }
  renderColorRow();

  const saveBtn = h('button', {
    class: 'btn btn-primary',
    onclick: () => {
      onSave({ ...profile, name: tempName.trim(), avatar: tempAvatar, color: tempColor });
      modal.close();
    },
  }, 'Sauvegarder');
  saveBtn.disabled = !tempName.trim();

  const content = h('div', {}, [
    h('div', { class: 'pp-title' }, 'Créer ton pilote'),
    nameInput,
    h('div', { class: 'pp-label' }, 'Choisis ton personnage'),
    avatarGrid,
    h('div', { class: 'pp-label' }, 'Couleur de fond'),
    colorRow,
    h('div', { class: 'pp-actions' }, [
      h('button', { class: 'btn btn-text', onclick: () => modal.close() }, 'Annuler'),
      saveBtn,
    ]),
  ]);

  const modal = openModal(content);
  modal.backdrop.addEventListener('click', (e) => {
    if (e.target === modal.backdrop && onDismiss) onDismiss();
  });
  return modal;
}
