/** Portage de ui/screens/TrackSelectionScreen.kt. */

const TracksScreen = {
  searchQuery: '',
  expanded: new Set(), // ids de circuits dont le menu de trajets est déplié
  pastelByTrack: new Map(),

  pastel(trackId) {
    if (!this.pastelByTrack.has(trackId)) this.pastelByTrack.set(trackId, randomPastelColor());
    return this.pastelByTrack.get(trackId);
  },

  render(container) {
    clearChildren(container);

    const totalConnectionsCount = Object.values(CONNECTIONS).reduce((sum, list) => sum + list.length, 0);
    const hasConnections = TrackState.includeRoutes || TrackState.selectedConnections.size > 0;
    const selectedCount = hasConnections ? TrackState.selectedTracks.size + TrackState.selectedConnections.size : TrackState.selectedTracks.size;
    const totalPoolCount = hasConnections ? TRACKS.length + totalConnectionsCount : TRACKS.length;
    const progress = totalPoolCount > 0 ? selectedCount / totalPoolCount : 0;

    container.append(titleEl('CIRCUITS', 32));

    const progressWrap = h('div', { class: 'ts-progress-wrap' }, [
      h('div', { class: 'ts-progress-label' }, [
        h('b', {}, `${selectedCount} / ${totalPoolCount}`),
        h('span', {}, hasConnections ? 'circuits + trajets dans le tirage' : 'circuits dans le tirage'),
      ]),
      h('div', { class: 'ts-progress-bar' }, h('div', { class: 'ts-progress-fill', style: { width: `${progress * 100}%` } })),
    ]);
    container.append(progressWrap);

    const searchInput = h('input', {
      class: 'ts-search',
      type: 'text',
      placeholder: 'Rechercher un circuit',
      value: this.searchQuery,
      oninput: (e) => { this.searchQuery = e.target.value; rerender(); },
    });
    container.append(searchInput);
    searchInput.focus();
    searchInput.selectionStart = searchInput.selectionEnd = this.searchQuery.length;

    const list = h('div', { class: 'ts-list' });
    container.append(list);

    list.append(h('div', { class: 'ts-toggle-row' }, [
      h('button', {
        class: 'btn',
        style: { background: '#E3F2FD', color: 'blue' },
        onclick: () => { TrackState.selectAllTracks(TrackState.includeRoutes); rerender(); },
      }, 'Tout activer'),
      h('button', {
        class: 'btn',
        style: { background: '#FFEBEE', color: 'red' },
        onclick: () => { TrackState.clearAllTracks(); rerender(); },
      }, 'Tout désactiver'),
    ]));

    const query = this.searchQuery.toLowerCase();
    const filtered = TRACKS.filter((t) => t.name.toLowerCase().includes(query));

    filtered.forEach((track) => list.append(this.buildCard(track)));

    list.append(h('div', { class: 'ts-footer-switch' }, [
      switchEl(TrackState.includeRoutes, (v) => {
        TrackState.setIncludeRoutes(v);
        TrackState.selectAllTracks(v);
        rerender();
      }),
      h('span', {}, 'Inclure les trajets'),
    ]));
  },

  buildCard(track) {
    const isSelected = TrackState.selectedTracks.has(track.id);
    const connections = getConnectionsForTrack(track.id);
    const isExpanded = this.expanded.has(track.id);
    const pastel = this.pastel(track.id);

    const card = h('div', {
      class: 'ts-card',
      style: { borderColor: isSelected ? pastel : undefined, background: isSelected ? pastel : undefined },
    });

    const thumb = h('div', { class: 'ts-thumb' }, [
      h('img', { src: track.large, alt: track.name }),
      !isSelected ? h('div', { class: 'cross' }, Icons.close()) : null,
    ]);

    const row = h('div', {
      class: 'ts-card-row',
      onclick: () => this.openTrackStats(track),
    }, [
      thumb,
      h('div', { class: 'ts-name' + (isSelected ? '' : ' off') }, track.name),
      switchEl(isSelected, () => { TrackState.toggleTrack(track.id); rerender(); }),
    ]);
    row.querySelector('.mk-switch').addEventListener('click', (e) => e.stopPropagation());

    if (connections.length > 0) {
      const btn = h('button', {
        class: 'ts-dropdown-btn' + (isExpanded ? ' open' : ''),
        onclick: (e) => {
          e.stopPropagation();
          if (isExpanded) this.expanded.delete(track.id); else this.expanded.add(track.id);
          rerender();
        },
      }, Icons.chevronDown());
      row.append(btn);
    } else {
      row.append(h('div', { style: { width: '32px' } }));
    }

    card.append(row);

    if (isExpanded && connections.length > 0) {
      const connWrap = h('div', { class: 'ts-connections' }, [
        h('div', { class: 'ts-connections-title' }, 'Trajets:'),
      ]);
      connections.forEach((destId) => {
        const destTrack = TRACKS_BY_ID.get(destId);
        const active = TrackState.isConnectionSelected(track.id, destId);
        connWrap.append(h('div', {
          class: 'ts-conn-tile' + (isSelected ? '' : ' disabled'),
          style: {
            borderColor: active ? pastel : undefined,
            background: active ? pastel : 'rgba(255,255,255,.4)',
            color: active && isSelected ? 'black' : 'gray',
          },
          onclick: () => {
            if (!isSelected) return;
            TrackState.toggleConnection(track.id, destId);
            rerender();
          },
        }, [
          h('span', {}, `-> ${destTrack.name}`),
          active && isSelected ? Icons.check() : null,
        ]));
      });
      card.append(connWrap);
    }

    return card;
  },

  openTrackStats(track) {
    const stats = Persistence.trackStats.filter((stat) => stat.trackId === track.id);
    const content = h('div', { class: 'track-stats-modal' }, [
      h('img', { class: 'track-stats-image', src: track.large, alt: track.name }),
      h('h2', { class: 'track-stats-title' }, track.name),
    ]);

    if (stats.length === 0) {
      content.append(h('p', { class: 'track-stats-empty' }, 'Aucun résultat enregistré pour ce circuit.'));
    } else {
      content.append(this.buildTrackStatSection(stats, 'Plus haut % de premières places', 'firstPlaceCount', true));
      content.append(this.buildTrackStatSection(stats, 'Plus haut % de podiums', 'podiumCount', true));
      content.append(this.buildTrackStatSection(stats, 'Plus bas % de podiums', 'podiumCount', false));
    }

    openModal(content);
  },

  buildTrackStatSection(stats, title, countKey, highest) {
    const availableStats = stats.filter((stat) => ScoreState.players.some((player) => player.id === stat.playerId));
    const section = h('section', { class: 'track-stats-section' }, [
      h('h3', {}, title),
    ]);

    if (availableStats.length === 0) {
      section.append(h('p', { class: 'track-stats-empty' }, 'Aucun joueur disponible.'));
      return section;
    }

    const percentages = availableStats.map((stat) => stat[countKey] / stat.raceCount);
    const target = highest ? Math.max(...percentages) : Math.min(...percentages);
    const leaders = availableStats.filter((stat) => stat[countKey] / stat.raceCount === target);

    leaders.forEach((stat) => {
      const player = ScoreState.players.find((candidate) => candidate.id === stat.playerId);
      if (!player) return;
      const percentage = Math.round((stat[countKey] / stat.raceCount) * 100);
      section.append(h('div', { class: 'track-stats-player' }, [
        playerAvatarEl(player, 36, { initialsFallback: true }),
        h('span', { class: 'track-stats-player-name' }, player.name),
        h('span', { class: 'track-stats-value' }, `${percentage} % (${stat[countKey]}/${stat.raceCount})`),
      ]));
    });

    return section;
  },
};
