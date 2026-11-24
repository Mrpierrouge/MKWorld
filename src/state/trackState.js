/**
 * Portage de viewmodels/TrackViewModel.kt.
 *
 * Représentation simplifiée par rapport au Kotlin d'origine : les circuits sont désignés par
 * leur `id` stable (voir data/tracks.js) plutôt que par une ressource Android. Un "combo"
 * (équivalent de TrackCombo) est un objet `{ type: 'TRACK'|'CONNECTION', start, end }`.
 */

const Phase = Object.freeze({
  SELECTION_CUBE: 'SELECTION_CUBE',
  SPINNING_TRACK: 'SPINNING_TRACK',
  DUAL_SPINNER: 'DUAL_SPINNER',
});

const SnesMaxPerCoupe = Object.freeze({
  ZERO: 'ZERO', ONE: 'ONE', TWO: 'TWO', THREE: 'THREE', FOUR: 'FOUR', RANDOM: 'RANDOM',
});
const SNES_MAX_ORDER = ['ZERO', 'ONE', 'TWO', 'THREE', 'FOUR', 'RANDOM'];

const RACES_PER_COUPE_OPTIONS = [3, 4, 5, 6, 8, 12, 16, 32];

function connKey(start, end) {
  return `${start}=>${end}`;
}

const TrackState = {
  selectedTracks: new Set(TRACKS.map((t) => t.id)), // pool de circuits activés
  selectedConnections: new Set(), // pool de trajets activés ("start=>end")
  deleteTrackAfterCompletion: true,
  selectedTrack: null, // combo courant choisi par la roue
  generationBias: 0,
  snesEnabled: true,
  racesPerCoupe: 4,
  racesInCoupe: 0,
  snesDrawnInCoupe: 0,
  maxSnesPerCoupe: SnesMaxPerCoupe.ONE,
  snesRemovalMode: SnesRemovalMode.ALL_SNES,
  phase: Phase.SELECTION_CUBE,
  includeRoutes: false,
  destinationItems: [], // tableau d'ids, candidats pour la 2e roue
  isSecondSpinnerReady: false,
  selectedTrackIndex: -1,
  destinationTargetIndex: -1,
  showResultPopup: null,
  pendingDestinations: null, // ids en attente entre pickRandomMap et pickRandomDestination
  popupEnabled: false,
  spinGeneration: 0, // incrémenté à chaque pickRandomMap() : signale à l'UI qu'une nouvelle roue doit démarrer
  destGeneration: 0, // incrémenté à chaque pickRandomDestination()

  // --- Lecture dérivée ---
  poolTracks() {
    return TRACKS.filter((t) => this.selectedTracks.has(t.id));
  },
  totalPool() {
    return this.selectedTracks.size + (this.includeRoutes ? this.selectedConnections.size : 0);
  },
  getConnectionsForTrack(trackId) {
    return getConnectionsForTrack(trackId);
  },
  isConnectionSelected(start, end) {
    return this.selectedConnections.has(connKey(start, end));
  },

  // --- Actions ---
  setPopupDisplay(combo) {
    this.showResultPopup = combo;
  },

  setPopupEnabled(enabled) {
    this.popupEnabled = enabled;
    Persistence.saveSettings({ popupEnabled: enabled });
  },

  toggleTrack(trackId) {
    if (this.selectedTracks.has(trackId)) {
      this.selectedTracks.delete(trackId);
      for (const key of Array.from(this.selectedConnections)) {
        if (key.startsWith(trackId + '=>')) this.selectedConnections.delete(key);
      }
    } else {
      this.selectedTracks.add(trackId);
    }
  },

  setIncludeRoutes(value) {
    this.includeRoutes = value;
  },

  toggleConnection(startId, endId) {
    if (!this.selectedTracks.has(startId)) return; // circuit parent désactivé : ignoré
    const key = connKey(startId, endId);
    if (this.selectedConnections.has(key)) this.selectedConnections.delete(key);
    else this.selectedConnections.add(key);
  },

  /** Retire du pool le circuit joué, selon le mode de suppression SNES courant. */
  removeSeriesFromPool(combo) {
    const members = new Set(removalTargets(combo.start, this.snesRemovalMode));
    for (const id of Array.from(this.selectedTracks)) {
      if (members.has(id)) this.selectedTracks.delete(id);
    }
    for (const key of Array.from(this.selectedConnections)) {
      const start = key.split('=>')[0];
      if (members.has(start)) this.selectedConnections.delete(key);
    }
  },

  /** Après un délai de 3s (comme completeRace de l'app Android), retire la course du pool. */
  completeRace(combo) {
    this.racesInCoupe += 1;
    if (isSnes(combo.start)) this.snesDrawnInCoupe += 1;
    if (this.racesInCoupe % this.racesPerCoupe === 0) this.snesDrawnInCoupe = 0;

    setTimeout(() => {
      if (!this.deleteTrackAfterCompletion) return;
      if (combo.type === 'CONNECTION') {
        this.selectedConnections.delete(connKey(combo.start, combo.end));
      } else {
        this.removeSeriesFromPool(combo);
      }
      rerender();
    }, 3000);
  },

  setSnesEnabled(enabled) {
    this.snesEnabled = enabled;
    if (enabled) {
      for (const t of TRACKS) if (isSnes(t.id)) this.selectedTracks.add(t.id);
    } else {
      for (const t of TRACKS) if (isSnes(t.id)) this.selectedTracks.delete(t.id);
    }
  },

  pickRandomMap() {
    const pool = this.poolTracks();
    if (pool.length === 0) return;

    const shouldAttemptRoute = this.generationBias === 0 ? false
      : this.generationBias === 100 ? true
      : Math.random() < 0.5;

    this.pendingDestinations = null;

    const maxSnes = this.maxSnesPerCoupe;
    const snesQuotaReached = maxSnes === SnesMaxPerCoupe.RANDOM ? false
      : maxSnes === SnesMaxPerCoupe.ZERO ? true
      : this.snesDrawnInCoupe >= SNES_MAX_ORDER.indexOf(maxSnes);

    const available = snesQuotaReached ? pool.filter((t) => !isSnes(t.id)) : pool;
    if (available.length === 0) return;

    const randomTrack = pickRandom(available);

    if (shouldAttemptRoute) {
      const allPossible = getConnectionsForTrack(randomTrack.id);
      const enabled = allPossible.filter((destId) => this.isConnectionSelected(randomTrack.id, destId));
      if (enabled.length > 0) this.pendingDestinations = enabled;
    }

    const displayIndex = pool.findIndex((t) => t.id === randomTrack.id);
    this.selectedTrackIndex = displayIndex;
    this.selectedTrack = { type: 'TRACK', start: randomTrack.id, end: null };
    this.destinationTargetIndex = -1;

    if (this.pendingDestinations) {
      this.destinationItems = this.pendingDestinations.slice();
    } else {
      this.destinationItems = [];
    }

    this.phase = this.pendingDestinations ? Phase.DUAL_SPINNER : Phase.SPINNING_TRACK;
  },

  pickRandomDestination() {
    const dests = this.pendingDestinations || [];
    this.pendingDestinations = null;
    if (dests.length === 0) return false;
    const startId = this.selectedTrack ? this.selectedTrack.start : null;
    if (!startId) return false;

    const randomDest = pickRandom(dests);
    this.selectedTrack = { type: 'CONNECTION', start: startId, end: randomDest };
    this.destinationTargetIndex = this.destinationItems.findIndex((id) => id === randomDest);
    this.isSecondSpinnerReady = true;
    return true;
  },

  resetCourse() {
    this.selectedTrackIndex = -1;
    this.destinationTargetIndex = -1;
    this.pendingDestinations = null;
    this.destinationItems = [];
    this.isSecondSpinnerReady = false;
    this.showResultPopup = null;
    this.phase = Phase.SELECTION_CUBE;
  },

  selectAllTracks(includeRoutes) {
    this.selectedTracks = new Set(TRACKS.map((t) => t.id));
    this.racesInCoupe = 0;
    this.snesDrawnInCoupe = 0;
    this.selectedConnections = new Set();
    if (includeRoutes) {
      for (const [start, ends] of Object.entries(CONNECTIONS)) {
        for (const end of ends) this.selectedConnections.add(connKey(start, end));
      }
    }
  },

  clearAllTracks() {
    this.selectedTracks = new Set();
    this.selectedConnections = new Set();
    this.racesInCoupe = 0;
    this.snesDrawnInCoupe = 0;
  },

  deleteCircuit(combo) {
    if (!combo || !this.deleteTrackAfterCompletion) return;
    if (combo.type === 'CONNECTION') {
      this.selectedConnections.delete(connKey(combo.start, combo.end));
    } else {
      this.selectedTracks.delete(combo.start);
      for (const key of Array.from(this.selectedConnections)) {
        if (key.startsWith(combo.start + '=>')) this.selectedConnections.delete(key);
      }
    }
  },

  updateDeleteTrackAfterCompletion(value) {
    this.deleteTrackAfterCompletion = value;
  },
  updateGenerationBias(value) {
    this.generationBias = value;
  },
  updateRacesPerCoupe(value) {
    if (RACES_PER_COUPE_OPTIONS.includes(value)) this.racesPerCoupe = value;
  },
  updateMaxSnesPerCoupe(value) {
    this.maxSnesPerCoupe = value;
  },
  updateSnesRemovalMode(value) {
    this.snesRemovalMode = value;
  },
};
