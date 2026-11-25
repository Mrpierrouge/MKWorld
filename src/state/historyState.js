/**
 * Historique des circuits tirés (écran Historique). Chaque tirage (circuit seul ou trajet
 * départ -> arrivée) devient une entrée, horodatée, éventuellement complétée d'un résultat de
 * course (place réelle de chaque joueur + variation des 3 ELO) une fois les scores saisis via
 * RaceResultScreen. Une entrée sans résultat reste affichée sans avatar de vainqueur.
 */

const HistoryState = {
  entries: [],
  pendingEntryId: null, // dernière course tirée, en attente d'un résultat éventuel

  /** Appelé dès qu'un circuit (ou trajet) est tiré et affiché, résultat ou non. */
  recordDraw(combo) {
    const entry = {
      id: uuid(),
      trackId: combo.start,
      endTrackId: combo.type === 'CONNECTION' ? combo.end : null,
      timestamp: Date.now(),
      result: null, // { positions: [{playerId, position}], deltas: { rank: {...}, bots: {...}, points: {...} } }
    };
    this.entries.push(entry);
    this.pendingEntryId = entry.id;
    this.persist();
    return entry.id;
  },

  /**
   * Attache un résultat à la dernière course tirée (ou à défaut la plus récente de l'historique,
   * si `pendingEntryId` a été perdu entre-temps, par ex. après un rechargement de page).
   * realPositions: Map<playerId, place réelle>. roundedDeltasBySystem: { rank, bots, points } de
   * Map<playerId, delta arrondi> (retour de ScoreState.submitRaceResults).
   */
  recordResults(realPositions, roundedDeltasBySystem) {
    const entry = this.entries.find((e) => e.id === this.pendingEntryId) || this.sortedEntries()[0];
    if (!entry) return;
    entry.result = {
      positions: Array.from(realPositions.entries()).map(([playerId, position]) => ({ playerId, position })),
      deltas: ELO_SYSTEM_ORDER.reduce((acc, systemId) => {
        acc[systemId] = Object.fromEntries(roundedDeltasBySystem[systemId] || []);
        return acc;
      }, {}),
    };
    this.pendingEntryId = null;
    this.persist();
  },

  sortedEntries() {
    return this.entries.slice().sort((a, b) => b.timestamp - a.timestamp);
  },

  persist() {
    Persistence.saveHistory(this.entries);
  },

  deleteEntry(entryId) {
    this.entries = this.entries.filter((e) => e.id !== entryId);
    this.persist();
  },

  clearAll() {
    this.entries = [];
    this.pendingEntryId = null;
    this.persist();
  },
};
