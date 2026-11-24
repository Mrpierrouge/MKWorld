/** Portage de ui/screens/MonthlyScoreScreen.kt. */

const ScoresScreen = {
  render(container) {
    clearChildren(container);

    const activeSystem = SettingsState.activeEloSystem;
    const players = ScoreState.sortedPlayers(activeSystem);
    const hasPlayers = players.length > 0;

    const header = h('div', { class: 'ms-header' }, [
      titleEl('CLASSEMENT', 26),
      hasPlayers ? h('div', { class: 'ms-header-actions' }, [
        h('button', {
          class: 'icon-btn',
          title: 'Réinitialiser les scores',
          onclick: () => confirmDialog({
            title: 'Réinitialiser le mois ?',
            message: 'Tous les scores seront remis à zéro. Cette action est irréversible.',
            onConfirm: () => { ScoreState.resetMonthlyScores(); rerender(); },
          }),
        }, Icons.delete()),
        h('button', {
          class: 'icon-btn',
          title: 'Supprimer tous les joueurs',
          onclick: () => confirmDialog({
            title: 'Réinitialiser les joueurs ?',
            message: 'Tous les joueurs seront remis à zéro. Cette action est irréversible.',
            onConfirm: () => { ScoreState.resetUsers(); rerender(); },
          }),
        }, Icons.groupOff()),
      ]) : null,
    ]);
    container.append(header);

    this.activeSystem = activeSystem;
    container.append(this.buildEloSwitcher(activeSystem));

    if (!hasPlayers) {
      container.append(h('div', { class: 'ms-empty' }, [
        h('p', {}, "Aucun pilote pour l'instant..."),
        h('p', { style: { fontSize: '13px', color: 'gray' } }, 'Clique sur le + pour créer ton profil !'),
      ]));
    } else {
      const allDefault = players.every((p) => ScoreState.scoreOf(p, activeSystem) === 3000);
      const list = h('div', { class: 'ms-list' });

      if (allDefault) {
        players.forEach((p, i) => list.append(this.buildScoreRow(i + 1, p)));
      } else {
        container.append(buildPodium(players.slice(0, 3), {
          onClick: (p) => this.openDetails(p),
          onLongClick: (p) => this.confirmDelete(p),
          getScore: (p) => ScoreState.scoreOf(p, activeSystem),
        }));
        players.slice(3).forEach((p, i) => list.append(this.buildScoreRow(i + 4, p)));
      }
      container.append(list);
    }

    const fab = h('button', {
      class: 'fab',
      onclick: () => {
        ScoreState.startCreatingProfile();
        openProfilePopup(ScoreState.editingProfile, {
          onSave: (profile) => { ScoreState.saveProfile(profile); rerender(); },
          onDismiss: () => ScoreState.closeEditPopup(),
        });
      },
    }, Icons.add());
    container.append(fab);
  },

  /** Chips pour choisir le système d'ELO affiché (les 3 sont calculés en parallèle à chaque course). */
  buildEloSwitcher(activeSystem) {
    const wrap = h('div', { class: 'settings-section' }, [
      h('div', { class: 'chip-row' }),
      h('p', { class: 'settings-desc', style: { margin: '6px 0 0' } }, ELO_SYSTEMS[activeSystem].description),
    ]);
    const chipRow = wrap.querySelector('.chip-row');
    ELO_SYSTEM_ORDER.forEach((systemId) => {
      chipRow.append(h('button', {
        class: 'chip' + (activeSystem === systemId ? ' selected' : ''),
        onclick: () => { SettingsState.setActiveEloSystem(systemId); rerender(); },
      }, ELO_SYSTEMS[systemId].shortLabel));
    });
    return wrap;
  },

  buildScoreRow(rank, player) {
    const row = h('div', { class: 'score-row' }, [
      h('div', { class: 'score-rank' }, `#${rank}`),
      playerAvatarEl(player, 45, { borderColor: player.color }),
      h('div', { class: 'score-name' }, player.name),
      h('div', { class: 'score-value' }, String(ScoreState.scoreOf(player, this.activeSystem))),
    ]);
    attachLongPress(row, () => this.openDetails(player), () => this.confirmDelete(player));
    return row;
  },

  openDetails(player) {
    openPlayerDetails(player, {
      onEditProfile: () => {
        ScoreState.startEditingProfile(player);
        openProfilePopup(player, {
          onSave: (updated) => { ScoreState.saveProfile(updated); rerender(); },
          onDismiss: () => ScoreState.closeEditPopup(),
        });
      },
    });
  },

  confirmDelete(player) {
    confirmDialog({
      title: 'Supprimer le joueur ?',
      message: `Voulez-vous vraiment supprimer ${player.name} ? Cette action est irréversible.`,
      confirmText: 'Oui',
      onConfirm: () => { ScoreState.deletePlayer(player); rerender(); },
    });
  },
};
