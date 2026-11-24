/**
 * Portage de ui/screens/MainScreen.kt + HomeUI/SelectionCubePhase/SpinningTrackPhase/DualSpinnerPhase.
 *
 * Gère les 3 phases (SELECTION_CUBE, SPINNING_TRACK, DUAL_SPINNER). Pour ne pas interrompre
 * l'animation de la roue à chaque re-rendu global (cf. core/utils + app.js), ce module ne
 * reconstruit la roue que lorsque TrackState.spinGeneration / destGeneration changent.
 */

const HomeScreen = {
  mountedContainer: null,
  mountedPhase: null,
  wheelGen: -1,
  destGen: -1,
  showResultActions: false,
  wheelControllerA: null,
  wheelControllerB: null,

  render(container) {
    const needsRebuild = this.mountedContainer !== container || this.mountedPhase !== TrackState.phase;
    if (needsRebuild) {
      if (this.wheelControllerA) this.wheelControllerA.cancel();
      if (this.wheelControllerB) this.wheelControllerB.cancel();
      this.wheelControllerA = this.wheelControllerB = null;
      this.showResultActions = false;
      this.wheelGen = -1;
      this.destGen = -1;
      this.popupSignature = undefined;
      clearChildren(container);
      this.buildShell(container);
      this.mountedContainer = container;
      this.mountedPhase = TrackState.phase;
    }

    this.updateResultPopup();

    if (TrackState.phase === Phase.SELECTION_CUBE) return;

    if (this.wheelGen !== TrackState.spinGeneration) {
      this.wheelGen = TrackState.spinGeneration;
      this.mountFirstWheel();
    }
    if (TrackState.phase === Phase.DUAL_SPINNER && TrackState.isSecondSpinnerReady && this.destGen !== TrackState.destGeneration) {
      this.destGen = TrackState.destGeneration;
      this.mountSecondWheel();
    }
    this.updateResultActions();
  },

  buildShell(container) {
    const gear = h('div', { class: 'home-top-bar', onclick: () => navigate('settings') }, Icons.settings());
    container.append(gear);

    if (TrackState.phase === Phase.SELECTION_CUBE) {
      container.append(this.buildSelectionCube());
      return;
    }

    const wrap = h('div', { class: 'phase-wrap' });
    const center = h('div', { class: 'phase-center', ref: (el) => (this.centerEl = el) });
    wrap.append(center);

    if (TrackState.phase === Phase.DUAL_SPINNER) {
      this.firstWheelSlot = h('div', { style: { width: '100%' } });
      this.versText = h('div', { class: 'vers-text' }, 'vers');
      this.secondWheelSlot = h('div', { style: { width: '100%' } });
      center.append(this.firstWheelSlot, this.versText, this.secondWheelSlot);
    } else {
      this.firstWheelSlot = h('div', { style: { width: '100%' } });
      center.append(this.firstWheelSlot);
    }

    this.resultActionsEl = h('div', { class: 'result-actions' });
    wrap.append(this.resultActionsEl);
    container.append(wrap);
  },

  buildSelectionCube() {
    const wrap = h('div', { class: 'home-wrap' });

    const shaker = h('div', { class: 'home-block', onclick: () => this.onPickRandomMap() }, Icons.questionMark());

    const stars = h('div', { class: 'home-stars' });
    for (let i = 0; i < 5; i++) stars.append(Icons.star());

    wrap.append(
      titleEl('MARIO KART', 42),
      h('div', { class: 'home-subtitle' }, 'CIRCUIT ALÉATOIRE'),
      h('div', { class: 'home-pool-banner' }, [Icons.flag(), h('span', {}, `${TrackState.totalPool()} courses disponibles`)]),
      shaker,
      h('div', { class: 'home-tap-text' }, 'TAPE LE BLOC POUR RÉVÉLER'),
      stars,
      h('div', { class: 'home-delete-switch' }, [
        switchEl(TrackState.deleteTrackAfterCompletion, (v) => {
          TrackState.updateDeleteTrackAfterCompletion(v);
          rerender();
        }),
        h('span', {}, 'Supp. les trajets faits'),
      ]),
    );
    return wrap;
  },

  onPickRandomMap() {
    TrackState.pickRandomMap();
    TrackState.spinGeneration += 1;
    rerender();
  },

  mountFirstWheel() {
    const pool = TrackState.poolTracks();
    const combo = TrackState.selectedTrack;
    const selectedTrack = combo ? TRACKS_BY_ID.get(combo.start) : null;
    const simple = TrackState.phase === Phase.SPINNING_TRACK;

    this.wheelControllerA = mountSpinWheel(this.firstWheelSlot, {
      items: pool,
      targetIndex: TrackState.selectedTrackIndex,
      selectedItem: selectedTrack,
      simple,
      onFinished: () => {
        if (TrackState.phase === Phase.DUAL_SPINNER) {
          TrackState.pickRandomDestination();
          TrackState.destGeneration += 1;
          rerender();
        } else {
          this.finishRace();
        }
      },
    });
  },

  mountSecondWheel() {
    const destTracks = TrackState.destinationItems.map((id) => TRACKS_BY_ID.get(id));
    const combo = TrackState.selectedTrack;
    const endTrack = combo && combo.end ? TRACKS_BY_ID.get(combo.end) : null;

    this.wheelControllerB = mountSpinWheel(this.secondWheelSlot, {
      items: destTracks,
      targetIndex: TrackState.destinationTargetIndex,
      selectedItem: endTrack,
      simple: false,
      compact: true,
      onFinished: () => this.finishRace(),
    });
  },

  finishRace() {
    this.showResultActions = true;
    const combo = TrackState.selectedTrack;
    if (combo) {
      TrackState.setPopupDisplay(combo);
      TrackState.completeRace(combo);
      HistoryState.recordDraw(combo);
    }
    fireConfetti();
    rerender();
  },

  updateResultActions() {
    if (!this.resultActionsEl) return;
    clearChildren(this.resultActionsEl);
    if (!this.showResultActions) return;
    const hasPlayers = ScoreState.players.length > 0;
    if (hasPlayers) {
      this.resultActionsEl.append(h('button', {
        class: 'btn-score',
        onclick: () => navigate('race-result'),
      }, 'Saisir les scores'));
    }
    this.resultActionsEl.append(h('button', {
      class: 'btn-restart',
      onclick: () => {
        if (TrackState.deleteTrackAfterCompletion) TrackState.deleteCircuit(TrackState.selectedTrack);
        TrackState.resetCourse();
        rerender();
      },
    }, 'RECOMMENCER'));
  },

  updateResultPopup() {
    const combo = TrackState.showResultPopup;
    const signature = combo && TrackState.popupEnabled ? `${combo.start}>${combo.end || ''}` : null;
    if (signature === this.popupSignature) return; // évite de fermer/rouvrir le même dialogue à chaque rerender
    this.popupSignature = signature;

    if (this.popupModal) {
      this.popupModal.close();
      this.popupModal = null;
    }
    if (!combo || !TrackState.popupEnabled) return;

    const startTrack = TRACKS_BY_ID.get(combo.start);
    const endTrack = combo.end ? TRACKS_BY_ID.get(combo.end) : null;
    const body = h('div', { class: 'result-popup-body' }, [
      h('div', {}, [
        h('img', { src: startTrack.large, alt: startTrack.name, style: { width: endTrack ? '110px' : '220px', height: endTrack ? '70px' : '140px', borderRadius: '8px' } }),
        h('div', { style: { fontSize: endTrack ? '12px' : '16px', textAlign: 'center', marginTop: '4px' } }, startTrack.name),
      ]),
      endTrack ? h('div', { class: 'result-popup-arrow' }, '>') : null,
      endTrack ? h('div', {}, [
        h('img', { src: endTrack.large, alt: endTrack.name, style: { width: '110px', height: '70px', borderRadius: '8px' } }),
        h('div', { style: { fontSize: '12px', textAlign: 'center', marginTop: '4px' } }, endTrack.name),
      ]) : null,
    ]);

    const content = h('div', { style: { textAlign: 'center' } }, [
      h('h3', {}, 'Sélectionné !'),
      body,
      h('div', { style: { marginTop: '16px' } }, [
        h('button', {
          class: 'btn btn-primary',
          onclick: () => { TrackState.setPopupDisplay(null); this.popupModal.close(); this.popupModal = null; },
        }, 'Fermer'),
      ]),
    ]);
    this.popupModal = openModal(content);
  },
};

/** Switch Material-like minimal (input checkbox stylé). */
function switchEl(checked, onChange) {
  const input = h('input', { type: 'checkbox', checked, onchange: (e) => onChange(e.target.checked) });
  return h('label', { class: 'mk-switch' }, [input, h('span', { class: 'track' }), h('span', { class: 'thumb' })]);
}
