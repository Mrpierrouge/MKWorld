/**
 * Portage de viewmodels/ScoreViewModel.kt.
 *
 * Différences volontaires par rapport à l'original (corrections listées dans AGENTS.md) :
 *  - `deletePlayer()` persiste désormais correctement.
 *  - `Top3Maps` utilise l'id stable du circuit (`trackId`) plutôt qu'un ex-R.string fragile.
 *  - 3 systèmes de score coexistent (voir core/eloSystems.js) au lieu d'un seul barème ELO :
 *    chaque joueur a un score indépendant par système (`eloRank`, `eloBots`, `eloPoints`).
 */

function newPlayerProfile() {
  return {
    id: uuid(),
    name: '',
    avatar: null, // id dans AVATARS, ou null -> fallback "mario" + initiale
    color: DEFAULT_PROFILE_COLOR,
    eloRank: 3000, // ELO "classement, sans les bots"
    eloBots: 3000, // ELO "position réelle, bots comptés"
    eloPoints: 3000, // ELO "points barème Mario Kart World"
    runNumbers: 0,
    victoryNumbers: 0,
    timesInPodium: 0,
    top3Maps: [], // [{ trackId, timeInTop3 }]
  };
}

/** Migration douce : les joueurs sauvegardés avant l'introduction des 3 ELO n'ont qu'un
 * `currentMonthScore` (ancien système "classement, sans les bots"). On le reprend tel quel pour
 * `eloRank` (l'algorithme n'a pas changé) et on démarre `eloBots`/`eloPoints` à 3000, faute de
 * données historiques pour ces 2 nouveaux barèmes. */
function migratePlayer(p) {
  return {
    ...p,
    eloRank: p.eloRank != null ? p.eloRank : (p.currentMonthScore != null ? p.currentMonthScore : 3000),
    eloBots: p.eloBots != null ? p.eloBots : 3000,
    eloPoints: p.eloPoints != null ? p.eloPoints : 3000,
  };
}

const ScoreState = {
  players: [],
  editingProfile: null,

  /** @param systemId 'rank' | 'bots' | 'points' (voir ELO_SYSTEM_ORDER) */
  sortedPlayers(systemId) {
    const field = ELO_SYSTEMS[systemId].scoreField;
    return this.players.slice().sort((a, b) => b[field] - a[field]);
  },

  scoreOf(player, systemId) {
    return player[ELO_SYSTEMS[systemId].scoreField];
  },

  initials(player) {
    return player.name ? player.name.slice(0, 1).toUpperCase() : '?';
  },

  persist() {
    Persistence.savePlayers(this.players);
  },

  resetMonthlyScores() {
    this.players = this.players.map((p) => ({ ...p, eloRank: 3000, eloBots: 3000, eloPoints: 3000 }));
    this.persist();
  },

  startCreatingProfile() {
    this.editingProfile = newPlayerProfile();
  },

  startEditingProfile(profile) {
    this.editingProfile = profile;
  },

  closeEditPopup() {
    this.editingProfile = null;
  },

  saveProfile(profile) {
    if (!profile.name || !profile.name.trim()) return;
    const exists = this.players.some((p) => p.id === profile.id);
    this.players = exists
      ? this.players.map((p) => (p.id === profile.id ? profile : p))
      : this.players.concat(profile);
    this.persist();
    this.closeEditPopup();
  },

  /**
   * Calcule les deltas des 3 systèmes d'ELO (voir core/eloSystems.js) puis persiste.
   * realPositions: Map<playerId, place réelle d'arrivée (bots compris), 1 = premier>.
   * Les stats génériques (victoires/podiums/circuits favoris) utilisent le classement relatif
   * entre joueurs (dérivé en triant les places réelles), comme l'ancien système "sans les bots".
   * @returns { rank: Map<playerId, delta arrondi>, bots: Map<...>, points: Map<...> } ou null si
   *          pas assez de participants (utile pour l'historique, voir HistoryState.recordResults).
   */
  submitRaceResults(realPositions, trackId) {
    const n = realPositions.size;
    if (n < 2) return null;

    const rankedPlayers = this.players.filter((p) => realPositions.has(p.id));
    const baseEntries = rankedPlayers.map((p) => ({ playerId: p.id, realPosition: realPositions.get(p.id) }));
    const relativeRanks = computeRelativeRanks(baseEntries);

    const roundedDeltasBySystem = {};
    ELO_SYSTEM_ORDER.forEach((systemId) => {
      const system = ELO_SYSTEMS[systemId];
      const entries = rankedPlayers.map((p) => ({
        playerId: p.id,
        rating: p[system.scoreField],
        realPosition: realPositions.get(p.id),
      }));
      const rawDeltas = system.computeDeltas(entries);
      const rounded = new Map();
      rawDeltas.forEach((value, playerId) => rounded.set(playerId, Math.round(value)));
      roundedDeltasBySystem[systemId] = rounded;
    });

    this.players = this.players.map((player) => {
      if (!realPositions.has(player.id)) return player;
      const updated = { ...player };
      ELO_SYSTEM_ORDER.forEach((systemId) => {
        const system = ELO_SYSTEMS[systemId];
        const delta = roundedDeltasBySystem[systemId].get(player.id) || 0;
        updated[system.scoreField] = Math.max(0, player[system.scoreField] + delta);
      });
      const relativeRank = relativeRanks.get(player.id);
      updated.runNumbers = player.runNumbers + 1;
      updated.timesInPodium = relativeRank <= 3 ? player.timesInPodium + 1 : player.timesInPodium;
      updated.victoryNumbers = relativeRank === 1 ? player.victoryNumbers + 1 : player.victoryNumbers;
      updated.top3Maps = this.handleTop3Maps(relativeRank, player, trackId);
      return updated;
    });
    this.persist();
    return roundedDeltasBySystem;
  },

  handleTop3Maps(position, player, trackId) {
    if (position > 3 || !trackId) return player.top3Maps;
    const list = player.top3Maps.map((m) => ({ ...m }));
    const existing = list.find((m) => m.trackId === trackId);
    if (existing) existing.timeInTop3 += 1;
    else list.push({ trackId, timeInTop3: 1 });
    return list;
  },

  resetUsers() {
    this.players = [];
    this.persist();
  },

  deletePlayer(player) {
    this.players = this.players.filter((p) => p.id !== player.id);
    this.persist(); // contrairement au bug connu de l'app Android, la suppression est bien persistée
  },
};
