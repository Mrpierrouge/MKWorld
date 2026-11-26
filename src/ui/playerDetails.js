/** Portage de ui/composables/PlayerDetailsComposable.kt. */

function buildStatTile(iconFn, value, label, color) {
  return h('div', { class: 'pd-stat' }, [
    h('div', { style: { color } }, iconFn()),
    h('div', { class: 'value' }, String(value)),
    h('div', { class: 'label' }, label),
  ]);
}

function buildMapCard(top3Map) {
  const track = TRACKS_BY_ID.get(top3Map.trackId);
  if (!track) return null;
  return h('div', { class: 'map-card' }, [
    h('img', { src: track.large, alt: track.name }),
    h('div', { class: 'badge' }, `${top3Map.timeInTop3}x in Top3`),
  ]);
}

function openPlayerDetails(player, { onEditProfile } = {}) {
  const avatarWrap = h('div', { class: 'pd-avatar-wrap' }, [
    (() => {
      const found = AVATARS.find((a) => a.id === player.avatar);
      return h('img', { src: found ? found.img : DEFAULT_AVATAR.img, alt: '' });
    })(),
  ]);
  if (onEditProfile) {
    const badge = h('div', { class: 'pd-edit-badge', onclick: () => { onEditProfile(); modal.close(); } }, Icons.edit());
    avatarWrap.append(badge);
  }

  const sortedMaps = player.top3Maps.slice().sort((a, b) => b.timeInTop3 - a.timeInTop3);
  const mapsRow = h('div', { class: 'pd-maps-row' });
  if (sortedMaps.length === 0) {
    mapsRow.append(h('span', { style: { color: 'gray', fontSize: '13px' } }, 'Aucun podium pour le moment'));
  } else {
    sortedMaps.forEach((m) => {
      const card = buildMapCard(m);
      if (card) mapsRow.append(card);
    });
  }

  const eloRow = h('div', { class: 'pd-elo-row' });
  ELO_SYSTEM_ORDER.forEach((systemId) => {
    eloRow.append(h('div', { class: 'pd-elo' }, [
      h('div', { class: 'value' }, String(ScoreState.scoreOf(player, systemId))),
      h('div', { class: 'label' }, ELO_SYSTEMS[systemId].shortLabel),
    ]));
  });

  const content = h('div', {}, [
    avatarWrap,
    h('div', { class: 'pd-name' }, player.name),
    eloRow,
    h('div', { class: 'pd-stats' }, [
      buildStatTile(Icons.flag, player.runNumbers, 'Courses', 'gray'),
      buildStatTile(Icons.trophy, player.victoryNumbers, 'Victoires', '#FFD700'),
      buildStatTile(Icons.medal, player.timesInPodium, 'Podiums', '#C0C0C0'),
    ]),
    h('div', { class: 'pd-maps-title' }, 'Circuits favoris'),
    mapsRow,
  ]);

  const modal = openModal(content);
  return modal;
}
