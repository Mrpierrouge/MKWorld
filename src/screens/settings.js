/** Portage de ui/screens/SettingsScreen.kt. */

const SNES_MAX_LABELS = { ZERO: '0', ONE: '1', TWO: '2', THREE: '3', FOUR: '4', RANDOM: 'Aléatoire' };
const SNES_REMOVAL_LABELS = { OFF: 'Désactivé', SERIES: 'Activé', ALL_SNES: 'Toutes les SNES' };
const SNES_REMOVAL_ORDER = ['OFF', 'SERIES', 'ALL_SNES'];

const SettingsScreen = {
  render(container) {
    clearChildren(container);

    container.append(h('div', { class: 'settings-topbar' }, [
      h('button', { onclick: () => navigate('home') }, Icons.arrowBack()),
      h('h2', {}, 'Paramètres'),
    ]));

    // --- Thème ---
    const themeSection = h('div', { class: 'settings-section' }, [
      h('h3', {}, 'Thème'),
      h('div', { class: 'chip-row' }),
    ]);
    const chipRow = themeSection.querySelector('.chip-row');
    [['SYSTEM', 'Système'], ['LIGHT', 'Clair'], ['DARK', 'Sombre']].forEach(([mode, label]) => {
      chipRow.append(h('button', {
        class: 'chip' + (SettingsState.themeMode === mode ? ' selected' : ''),
        onclick: () => { SettingsState.setThemeMode(mode); rerender(); },
      }, label));
    });
    container.append(themeSection);

    // --- Biais de génération ---
    container.append(h('div', { class: 'settings-section' }, [
      h('h3', {}, 'Biais de génération'),
      h('p', { class: 'settings-desc' }, 'Glisse vers Circuits ou Connexions pour orienter le tirage.'),
      this.buildBiasSlider(),
    ]));

    // --- Popup circuit ---
    container.append(this.toggleRow(
      'Voir la popup de circuit', 'Afficher ou pas la popup de circuit',
      TrackState.popupEnabled,
      (v) => { TrackState.setPopupEnabled(v); rerender(); },
    ));

    // --- Maps SNES ---
    container.append(this.toggleRow(
      'Activer les maps SNES',
      "Désactivé, les 10 circuits SNES restent visibles dans la liste Circuits mais décochés, donc jamais tirés. Tu peux ensuite les réactiver une par une. Revient à chaque lancement de l'app.",
      TrackState.snesEnabled,
      (v) => { TrackState.setSnesEnabled(v); rerender(); },
    ));

    // --- Courses par coupe ---
    const coupeIndex = RACES_PER_COUPE_OPTIONS.indexOf(TrackState.racesPerCoupe);
    container.append(h('div', { class: 'settings-section' }, [
      h('div', { class: 'slider-value-row' }, [
        h('div', { class: 'settings-text' }, [
          h('div', {}, 'Courses par coupe'),
          h('p', { class: 'settings-desc' }, 'Une map SNES est tirée au plus 1 fois par coupe. Augmente la coupe pour espacer les circuits SNES.'),
        ]),
        h('div', { class: 'value' }, String(TrackState.racesPerCoupe)),
      ]),
      h('input', {
        class: 'mk-slider', type: 'range', min: 0, max: RACES_PER_COUPE_OPTIONS.length - 1, step: 1, value: coupeIndex,
        oninput: (e) => { TrackState.updateRacesPerCoupe(RACES_PER_COUPE_OPTIONS[Number(e.target.value)]); rerender(); },
      }),
    ]));

    // --- Max SNES par coupe ---
    const maxSnesIndex = SNES_MAX_ORDER.indexOf(TrackState.maxSnesPerCoupe);
    container.append(h('div', { class: 'settings-section' }, [
      h('div', { class: 'slider-value-row' }, [
        h('div', { class: 'settings-text' }, [
          h('div', {}, 'Max de maps SNES par coupe'),
          h('p', { class: 'settings-desc' }, 'Limite le nombre de circuits SNES tirés par coupe (0 = aucun). « Aléatoire » : aucun filtrage.'),
        ]),
        h('div', { class: 'value' }, SNES_MAX_LABELS[TrackState.maxSnesPerCoupe]),
      ]),
      h('input', {
        class: 'mk-slider', type: 'range', min: 0, max: SNES_MAX_ORDER.length - 1, step: 1, value: maxSnesIndex,
        oninput: (e) => { TrackState.updateMaxSnesPerCoupe(SNES_MAX_ORDER[Number(e.target.value)]); rerender(); },
      }),
    ]));

    // --- Suppression SNES en bloc ---
    const removalIndex = SNES_REMOVAL_ORDER.indexOf(TrackState.snesRemovalMode);
    container.append(h('div', { class: 'settings-section' }, [
      h('h3', {}, 'Suppression des circuits SNES'),
      h('p', { class: 'settings-desc' }, "Désactivé : seul le circuit tiré est retiré. Activé : tirer un circuit SNES retire aussi ses variantes, sans toucher aux autres circuits SNES. Toutes les SNES : tirer une map SNES supprime toutes les autres maps SNES du tirage."),
      h('input', {
        class: 'mk-slider', type: 'range', min: 0, max: 2, step: 1, value: removalIndex,
        oninput: (e) => { TrackState.updateSnesRemovalMode(SNES_REMOVAL_ORDER[Number(e.target.value)]); rerender(); },
      }),
      h('div', { style: { textAlign: 'center', fontWeight: 'bold' } }, SNES_REMOVAL_LABELS[TrackState.snesRemovalMode]),
    ]));

    container.append(h('div', { class: 'settings-footer' }, 'Version 1.0 - Mario Kart World App - web'));
  },

  buildBiasSlider() {
    return h('div', {}, [
      h('input', {
        class: 'mk-slider', type: 'range', min: 0, max: 100, step: 1, value: TrackState.generationBias,
        oninput: (e) => { TrackState.updateGenerationBias(Number(e.target.value)); },
      }),
      h('div', { class: 'bias-labels' }, [h('span', {}, 'Circuits'), h('span', {}, '50 / 50'), h('span', {}, 'Connexions')]),
    ]);
  },

  toggleRow(title, desc, checked, onChange) {
    return h('div', { class: 'settings-section settings-row' }, [
      h('div', { class: 'settings-text' }, [
        h('div', {}, title),
        h('p', { class: 'settings-desc' }, desc),
      ]),
      switchEl(checked, onChange),
    ]);
  },
};
