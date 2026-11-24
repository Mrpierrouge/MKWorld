/** Écran Historique : liste des circuits tirés, avec le résultat de course associé s'il existe. */

function formatHistoryTimestamp(ts) {
  return new Date(ts).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
  });
}

const HistoryScreen = {
  render(container) {
    clearChildren(container);
    container.append(titleEl('HISTORIQUE', 32));

    const entries = HistoryState.sortedEntries();

    if (entries.length === 0) {
      container.append(h('div', { class: 'ms-empty' }, [
        h('p', {}, 'Aucune course tirée pour le moment...'),
        h('p', { style: { fontSize: '13px', color: 'gray' } }, "Les circuits tirés depuis l'onglet Aléatoire apparaîtront ici."),
      ]));
      return;
    }

    const list = h('div', { class: 'ts-list' });
    entries.forEach((entry) => {
      const card = this.buildCard(entry);
      if (card) list.append(card);
    });
    container.append(list);
  },

  winnerOf(entry) {
    if (!entry.result || entry.result.positions.length === 0) return null;
    const best = entry.result.positions.reduce((min, p) => (p.position < min.position ? p : min));
    return ScoreState.players.find((p) => p.id === best.playerId) || null;
  },

  buildCard(entry) {
    const track = TRACKS_BY_ID.get(entry.trackId);
    if (!track) return null; // circuit introuvable (défensif, ne devrait pas arriver)
    const endTrack = entry.endTrackId ? TRACKS_BY_ID.get(entry.endTrackId) : null;
    const displayName = endTrack ? `${track.name} → ${endTrack.name}` : track.name;
    const winner = this.winnerOf(entry);

    const thumb = h('div', { class: 'ts-thumb' }, [h('img', { src: track.large, alt: track.name })]);

    const row = h('div', {
      class: 'ts-card-row',
      onclick: () => this.openEntryDetails(entry),
    }, [
      thumb,
      h('div', { class: 'hist-info' }, [
        h('div', { class: 'ts-name' }, displayName),
        h('div', { class: 'hist-date' }, formatHistoryTimestamp(entry.timestamp)),
      ]),
      winner
        ? playerAvatarEl(winner, 36, { initialsFallback: true, borderColor: winner.color })
        : h('div', { style: { width: '36px', flex: 'none' } }),
    ]);

    return h('div', { class: 'ts-card' }, [row]);
  },

  buildResultRow(positionEntry, deltas) {
    const player = ScoreState.players.find((p) => p.id === positionEntry.playerId);
    const name = player ? player.name : 'Joueur supprimé';
    const avatar = player
      ? playerAvatarEl(player, 40, { initialsFallback: true })
      : h('div', { class: 'avatar-fallback', style: { width: '40px', height: '40px', background: 'gray' } }, '?');

    const deltaRow = h('div', { class: 'hist-delta-row' });
    ELO_SYSTEM_ORDER.forEach((systemId) => {
      const delta = (deltas[systemId] && deltas[systemId][positionEntry.playerId]) || 0;
      const sign = delta > 0 ? 'pos' : delta < 0 ? 'neg' : 'zero';
      deltaRow.append(h('div', { class: `hist-delta ${sign}` }, [
        h('div', { class: 'value' }, (delta > 0 ? '+' : '') + delta),
        h('div', { class: 'label' }, ELO_SYSTEMS[systemId].shortLabel),
      ]));
    });

    return h('div', { class: 'hist-player-card' }, [
      h('div', { class: 'hist-player-top' }, [
        avatar,
        h('span', { class: 'hist-player-name' }, name),
        h('span', { class: 'hist-player-pos' }, positionLabel(positionEntry.position)),
      ]),
      deltaRow,
    ]);
  },

  openEntryDetails(entry) {
    const track = TRACKS_BY_ID.get(entry.trackId);
    const endTrack = entry.endTrackId ? TRACKS_BY_ID.get(entry.endTrackId) : null;
    const titleText = endTrack ? `${track.name} → ${endTrack.name}` : track.name;

    const body = [
      h('h3', { style: { margin: '0 0 4px' } }, titleText),
      h('p', { style: { margin: '0 0 12px', color: 'gray', fontSize: '13px' } }, formatHistoryTimestamp(entry.timestamp)),
    ];

    if (!entry.result) {
      body.push(h('p', {}, "Aucun résultat n'a été enregistré pour cette course."));
    } else {
      const sortedPositions = entry.result.positions.slice().sort((a, b) => a.position - b.position);
      const list = h('div', { class: 'hist-result-list' });
      sortedPositions.forEach((p) => list.append(this.buildResultRow(p, entry.result.deltas)));
      body.push(list);
    }

    openModal(h('div', {}, body));
  },
};
