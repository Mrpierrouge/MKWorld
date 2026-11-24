/**
 * Les 3 systèmes d'ELO qui coexistent, calculés en parallèle à chaque course pour pouvoir
 * être comparés. Chaque joueur a donc 3 scores indépendants (voir ScoreState.newPlayerProfile) :
 *
 *  - `rank`   : classement relatif entre les joueurs présents, bots ignorés. Seul l'ordre
 *               d'arrivée entre joueurs compte (arriver juste devant quelqu'un = arriver très
 *               loin devant). C'était l'unique système avant.
 *  - `bots`   : place réelle d'arrivée dans la course (bots compris). L'écart entre deux joueurs
 *               (nombre de bots + joueurs qui les séparent) pondère le gain/la perte d'ELO.
 *  - `points` : convertit la place réelle de chaque joueur en points via le barème officiel de
 *               Mario Kart World (15/12/10/9/9/8...), puis compare les joueurs sur cet écart de
 *               points plutôt que sur l'écart de places brut.
 *
 * Les 3 systèmes partagent le même moteur pairwise (comparaison 1 contre 1 de tous les
 * participants) et le même K scaled (32 / (n - 1)), seule la façon de déterminer le "score réel"
 * (`actualA`/`actualB`) de chaque duel change.
 */

/** Barème officiel de points Mario Kart World (24 coureurs), place -> points. */
const MKW_POINTS_TABLE = [
  15, 12, 10, 9, 9, 8, 8, 7, 7, 6, 6, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 2, 2, 1,
];
const MKW_MAX_POINTS_DIFF = MKW_POINTS_TABLE[0] - MKW_POINTS_TABLE[MKW_POINTS_TABLE.length - 1]; // 14

/** Au-delà de 24 (tous les coureurs du barème), on retombe sur le minimum (1 point). */
function pointsForPosition(position) {
  if (!Number.isFinite(position) || position < 1) return 0;
  const idx = Math.round(position) - 1;
  return idx < MKW_POINTS_TABLE.length ? MKW_POINTS_TABLE[idx] : MKW_POINTS_TABLE[MKW_POINTS_TABLE.length - 1];
}

/** 24 coureurs max dans Mario Kart World => écart de place maximal théorique. */
const MAX_REAL_POSITION_GAP = 23;

/**
 * Classement "de compétition" (1,2,2,4,...) à partir des places réelles : seul l'ordre compte,
 * les égalités de place réelle restent des égalités ici.
 * entries: [{ playerId, realPosition }] -> Map<playerId, rank>
 */
function computeRelativeRanks(entries) {
  const sorted = entries.slice().sort((a, b) => a.realPosition - b.realPosition);
  const ranks = new Map();
  let rank = 0;
  sorted.forEach((entry, idx) => {
    if (idx === 0 || entry.realPosition !== sorted[idx - 1].realPosition) rank = idx + 1;
    ranks.set(entry.playerId, rank);
  });
  return ranks;
}

/**
 * Moteur ELO pairwise générique : compare chaque paire de participants, calcule un delta par
 * joueur selon la formule ELO standard, avec un K réduit selon le nombre de participants (comme
 * avant, pour que l'ampleur totale du changement reste comparable quel que soit le nombre de
 * joueurs classés).
 * entries: [{ playerId, rating }]
 * actualFn(a, b) -> [actualA, actualB] dans [0, 1], actualA + actualB === 1
 */
function computePairwiseDeltas(entries, actualFn) {
  const n = entries.length;
  const deltas = new Map();
  if (n < 2) return deltas;
  const scaledK = 32 / (n - 1);

  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i];
      const b = entries[j];
      const expectedA = 1 / (1 + Math.pow(10, (b.rating - a.rating) / 400));
      const expectedB = 1 - expectedA;
      const [actualA, actualB] = actualFn(a, b);
      deltas.set(a.playerId, (deltas.get(a.playerId) || 0) + scaledK * (actualA - expectedA));
      deltas.set(b.playerId, (deltas.get(b.playerId) || 0) + scaledK * (actualB - expectedB));
    }
  }
  return deltas;
}

const ELO_SYSTEMS = {
  rank: {
    id: 'rank',
    scoreField: 'eloRank',
    label: 'Classement (sans les bots)',
    shortLabel: 'Classement',
    description:
      "Ne regarde que l'ordre d'arrivée entre les joueurs présents : arriver juste devant un "
      + "adversaire compte autant qu'arriver très loin devant. Même si le dernier est arrivé "
      + "15ème dans une course à 4 joueurs, il est considéré 4ème.",
    computeDeltas(entries) {
      const ranks = computeRelativeRanks(entries);
      return computePairwiseDeltas(entries, (a, b) => {
        const ra = ranks.get(a.playerId);
        const rb = ranks.get(b.playerId);
        if (ra < rb) return [1, 0];
        if (ra > rb) return [0, 1];
        return [0.5, 0.5];
      });
    },
  },
  bots: {
    id: 'bots',
    scoreField: 'eloBots',
    label: 'Position réelle (bots comptés)',
    shortLabel: 'Position réelle',
    description:
      "Utilise la place exacte d'arrivée dans la course, bots compris : plus l'écart de places "
      + "entre deux joueurs est grand (plus il y a de bots ou de joueurs entre eux), plus le "
      + "gain/la perte d'ELO est marqué.",
    computeDeltas(entries) {
      return computePairwiseDeltas(entries, (a, b) => {
        const gap = b.realPosition - a.realPosition; // > 0 si A est devant B
        const actualA = clamp(0.5 + gap / (2 * MAX_REAL_POSITION_GAP), 0, 1);
        return [actualA, 1 - actualA];
      });
    },
  },
  points: {
    id: 'points',
    scoreField: 'eloPoints',
    label: 'Points (barème Mario Kart World)',
    shortLabel: 'Points',
    description:
      'Convertit la place réelle de chaque joueur en points selon le barème officiel de Mario '
      + 'Kart World (15/12/10/9/9/8/8/7/7/6...), puis compare les joueurs sur cet écart de '
      + 'points plutôt que sur l\'écart de places brut.',
    computeDeltas(entries) {
      return computePairwiseDeltas(entries, (a, b) => {
        const diff = pointsForPosition(a.realPosition) - pointsForPosition(b.realPosition);
        const actualA = clamp(0.5 + diff / (2 * MKW_MAX_POINTS_DIFF), 0, 1);
        return [actualA, 1 - actualA];
      });
    },
  },
};

const ELO_SYSTEM_ORDER = ['rank', 'bots', 'points'];
