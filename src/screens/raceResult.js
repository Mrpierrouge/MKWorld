/** Portage de ui/screens/RaceResultScreen.kt. */

const RaceResultScreen = {
  participants: [], // PlayerProfile[], nombre illimité
  positions: new Map(), // playerId -> place réelle d'arrivée (bots compris), 1 = premier

  render(container) {
    clearChildren(container);
    // Nettoie les participants qui auraient été supprimés entre-temps
    this.participants = this.participants.filter((p) => ScoreState.players.some((pl) => pl.id === p.id));
    for (const id of Array.from(this.positions.keys())) {
      if (!this.participants.some((p) => p.id === id)) this.positions.delete(id);
    }

    container.append(h('h2', { style: { margin: '8px 0' } }, 'Résultats de la course'));
    container.append(h('p', {}, `1. Sélectionnez les participants (${this.participants.length})`));

    const chipRow = h('div', { class: 'rr-chip-row' });
    ScoreState.players.forEach((player) => {
      const selected = this.participants.some((p) => p.id === player.id);
      const chip = h('div', {
        class: 'rr-chip' + (selected ? ' selected' : ''),
        onclick: () => {
          if (selected) {
            this.participants = this.participants.filter((p) => p.id !== player.id);
            this.positions.delete(player.id);
          } else {
            this.participants.push(player);
          }
          rerender();
        },
      }, [playerAvatarEl(player, 24, { initialsFallback: true }), h('span', {}, player.name)]);
      chipRow.append(chip);
    });
    container.append(chipRow);
    container.append(h('hr', { style: { width: '100%', margin: '12px 0', border: 'none', borderTop: '1px solid var(--mk-outline)' } }));
    container.append(h('p', {}, "2. Place réelle d'arrivée de chaque joueur"));
    container.append(h('p', { class: 'settings-desc' },
      "Indique la place exacte dans la course, bots compris (ex : 1er, puis 4ème s'il y a 2 bots "
      + 'entre les deux). Le classement « sans les bots » et le barème de points sont déduits '
      + 'automatiquement pour comparer les 3 ELO.'));

    const rankList = h('div', { class: 'rr-rank-list' });
    const badgeEls = new Map();
    let submitBtn = null;

    const computeCanSubmit = () => {
      const filledCount = this.participants.filter((p) => this.positions.has(p.id)).length;
      return this.participants.length >= 2 && filledCount === this.participants.length;
    };

    const refreshDerived = () => {
      const entries = this.participants
        .filter((p) => this.positions.has(p.id))
        .map((p) => ({ playerId: p.id, realPosition: this.positions.get(p.id) }));
      const ranks = computeRelativeRanks(entries);
      badgeEls.forEach((el, playerId) => {
        const rank = ranks.get(playerId);
        el.textContent = rank != null ? `→ ${positionLabel(rank)} sans les bots` : '';
      });
      if (submitBtn) submitBtn.disabled = !computeCanSubmit();
    };

    this.participants.forEach((player) => {
      const value = this.positions.get(player.id);
      const badge = h('span', { class: 'rr-derived-badge' }, '');
      badgeEls.set(player.id, badge);

      const input = h('input', {
        class: 'rr-position-input',
        type: 'number',
        min: '1',
        step: '1',
        inputmode: 'numeric',
        placeholder: '—',
        value: value != null ? String(value) : '',
        oninput: (e) => {
          const n = parseInt(e.target.value, 10);
          if (Number.isFinite(n) && n >= 1) this.positions.set(player.id, n);
          else this.positions.delete(player.id);
          refreshDerived();
        },
      });

      const setValue = (n) => {
        const next = Math.max(1, n);
        this.positions.set(player.id, next);
        input.value = String(next);
        refreshDerived();
      };

      const stepper = h('div', { class: 'rr-stepper' }, [
        h('button', {
          type: 'button', class: 'rr-stepper-btn',
          onclick: () => setValue((this.positions.get(player.id) || 1) - 1),
        }, '−'),
        input,
        h('button', {
          type: 'button', class: 'rr-stepper-btn',
          onclick: () => setValue((this.positions.get(player.id) || 0) + 1),
        }, '+'),
      ]);

      const card = h('div', { class: 'rr-rank-card' }, [
        playerAvatarEl(player, 40, { initialsFallback: true }),
        h('div', { class: 'rr-rank-info' }, [
          h('span', {}, player.name),
          badge,
        ]),
        stepper,
      ]);
      rankList.append(card);
    });
    container.append(rankList);

    submitBtn = h('button', {
      class: 'btn btn-primary',
      style: { width: '100%', padding: '14px' },
      onclick: () => {
        if (!computeCanSubmit()) return;
        const trackId = TrackState.selectedTrack ? TrackState.selectedTrack.start : null;
        const deltasBySystem = ScoreState.submitRaceResults(this.positions, trackId);
        if (deltasBySystem) HistoryState.recordResults(this.positions, deltasBySystem);
        this.participants = [];
        this.positions = new Map();
        navigate('home');
      },
    }, 'Enregistrer les scores');
    container.append(h('div', { class: 'rr-cta' }, [submitBtn]));

    refreshDerived();
  },
};

function positionLabel(position) {
  if (position === 1) return '1er 🏆';
  if (position === 2) return '2nd 🥈';
  if (position === 3) return '3ème 🥉';
  return `${position}ème`;
}
