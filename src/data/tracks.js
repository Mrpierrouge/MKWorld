/**
 * Données des circuits — portage de backend/TrackItems.kt + TrackRepository.kt + TrackSeries.kt
 *
 * Contrairement à l'app Android, chaque circuit a ici un identifiant stable (`id`), le nom de
 * l'entrée d'origine (ex: "CIRCUIT_MARIO_BROS"). On évite ainsi la fragilité documentée dans
 * SPEC_02/SPEC_06 (Top3Maps.mapId qui stockait un R.string.xxx).
 */

const TrackSeries = Object.freeze({
  STANDALONE: 'STANDALONE',
  SNES_MARIO_CIRCUIT: 'SNES_MARIO_CIRCUIT',
  SNES_GHOST_VALLEY: 'SNES_GHOST_VALLEY',
  SNES_CHOCO_ISLAND: 'SNES_CHOCO_ISLAND',
  SNES_VANILLA_LAKE: 'SNES_VANILLA_LAKE',
  SNES_KOOPA_BEACH: 'SNES_KOOPA_BEACH',
});

const IMG = 'assets/img/';

// 30 circuits Mario Kart World + 10 variantes SNES (toutes STANDALONE sauf les 10 dernières)
const TRACKS = [
  { id: 'CIRCUIT_MARIO_BROS', name: 'Circuit Mario Bros.', img: IMG + 'circuit_mario_bros.png', large: IMG + 'large_circuit_mario_bros.png' },
  { id: 'TROPHEOPOLIS', name: 'Trophéopolis', img: IMG + 'tropheopolis.png', large: IMG + 'large_tropheopolis.png' },
  { id: 'MONT_TCHOU_TCHOU', name: 'Mont Tchou Tchou', img: IMG + 'mont_tchou_tchou.png', large: IMG + 'large_mont_tchou_tchou.png' },
  { id: 'SPATIOPORT_DK', name: 'Spatioport DK', img: IMG + 'spatioport_dk.png', large: IMG + 'large_spatioport_dk.png' },
  { id: 'DESERT_SOLEIL', name: 'Désert du Soleil', img: IMG + 'desert_du_soleil.png', large: IMG + 'large_desert_du_soleil.png' },
  { id: 'SOUK_MASKASS', name: 'Souk Maskass', img: IMG + 'souk_maskass.png', large: IMG + 'large_souk_maskass.png' },
  { id: 'STADE_WARIO', name: 'Stade Wario', img: IMG + 'stade_warrio.png', large: IMG + 'large_stade_warrio.png' },
  { id: 'BATEAU_VOLANT', name: 'Bateau Volant', img: IMG + 'bateau_volant.png', large: IMG + 'large_bateau_volant.png' },
  { id: 'ALPES_DK', name: 'Alpes DK', img: IMG + 'alpes_dk.png', large: IMG + 'large_alpes_dk.png' },
  { id: 'PIC_OBSERVATOIRE', name: 'Pic de l’Observatoire', img: IMG + 'pic_observatoire.png', large: IMG + 'large_pic_observatoire.png' },
  { id: 'CITE_SORBET', name: 'Cité Sorbet', img: IMG + 'cite_sorbet.png', large: IMG + 'large_cite_sorbet.png' },
  { id: 'GALION_WARIO', name: 'Galion de Wario', img: IMG + 'galion_warion.png', large: IMG + 'large_galion_warion.png' },
  { id: 'PLAGE_KOOPA', name: 'Plage Koopa', img: IMG + 'plage_koopa.png', large: IMG + 'large_plage_koopa.png' },
  { id: 'SAVANE_SAUVAGE', name: 'Savane Sauvage', img: IMG + 'savane_sauvage.png', large: IMG + 'large_savane_sauvage.png' },
  { id: 'PLAGE_PEACH', name: 'Plage Peach', img: IMG + 'plage_peach.png', large: IMG + 'large_plage_peach.jpg' },
  { id: 'CITE_FLEUR_SEL', name: 'Cité Fleur-de-sel', img: IMG + 'cite_fleur_sel.png', large: IMG + 'large_cite_fleur_sel.jpg' },
  { id: 'JUNGLE_DINO_DINO', name: 'Jungle Dino Dino', img: IMG + 'jungle_dino_dino.png', large: IMG + 'large_jungle_dino_dino.png' },
  { id: 'BLOC_ANTIQUE', name: 'Bloc ? Antique', img: IMG + 'bloc_antique.png', large: IMG + 'large_bloc_antique.png' },
  { id: 'CHUTES_CHEEP_CHEEP', name: 'Chutes Cheep Cheep', img: IMG + 'chutes_cheep_cheep.png', large: IMG + 'large_chutes_cheep_cheep.png' },
  { id: 'GOUFFRE_PISSENLIT', name: 'Gouffre Pissenlit', img: IMG + 'gouffre_pissenlit.png', large: IMG + 'large_gouffre_pissenlit.png' },
  { id: 'CINEMA_BOO', name: 'Cinéma Boo', img: IMG + 'cinema_boo.png', large: IMG + 'large_cinema_boo.png' },
  { id: 'FOURNAISE_OSSEUSE', name: 'Fournaise Osseuse', img: IMG + 'fournaise_osseuse.png', large: IMG + 'large_fournaise_osseuse.png' },
  { id: 'PRAIRIE_MEUH_MEUH', name: 'Prairie Meuh Meuh', img: IMG + 'circuit_meuh_meuh.png', large: IMG + 'large_circuit_meuh_meuh.png' },
  { id: 'MONTAGNE_CHOCO', name: 'Montagne Choco', img: IMG + 'montagne_choco.png', large: IMG + 'large_montagne_choco.png' },
  { id: 'USINE_TOAD', name: 'Usine Toad', img: IMG + 'usine_toad.png', large: IMG + 'large_usine_toad.png' },
  { id: 'CHATEAU_BOWSER', name: 'Château de Bowser', img: IMG + 'chateau_bowser.png', large: IMG + 'large_chateau_bowser.png' },
  { id: 'CHEMIN_CHENE', name: 'Chemin du Chêne', img: IMG + 'chemin_du_chene.png', large: IMG + 'large_chemin_du_chene.png' },
  { id: 'CIRCUIT_MARIO', name: 'Circuit Mario', img: IMG + 'circuit_mario.png', large: IMG + 'large_circuit_mario.png' },
  { id: 'STADE_PEACH', name: 'Stade Peach', img: IMG + 'stade_peach.png', large: IMG + 'large_stade_peach.png' },
  { id: 'ROUTE_ARC_EN_CIEL', name: 'Route Arc-en-ciel', img: IMG + 'route_arcenciel.png', large: IMG + 'large_route_arcenciel.png' },

  { id: 'SNES_MARIO_CIRCUIT_1', name: 'Circuit Mario 1 (SNES)', img: IMG + 'snes_mario_circuit_1.png', large: IMG + 'snes_mario_circuit_1.png', series: TrackSeries.SNES_MARIO_CIRCUIT },
  { id: 'SNES_MARIO_CIRCUIT_2', name: 'Circuit Mario 2 (SNES)', img: IMG + 'snes_mario_circuit_2.png', large: IMG + 'snes_mario_circuit_2.png', series: TrackSeries.SNES_MARIO_CIRCUIT },
  { id: 'SNES_MARIO_CIRCUIT_3', name: 'Circuit Mario 3 (SNES)', img: IMG + 'snes_mario_circuit_3.png', large: IMG + 'snes_mario_circuit_3.png', series: TrackSeries.SNES_MARIO_CIRCUIT },
  { id: 'SNES_GHOST_VALLEY_1', name: 'Vallée Fantôme 1 (SNES)', img: IMG + 'snes_ghost_valley_1.png', large: IMG + 'snes_ghost_valley_1.png', series: TrackSeries.SNES_GHOST_VALLEY },
  { id: 'SNES_GHOST_VALLEY_2', name: 'Vallée Fantôme 2 (SNES)', img: IMG + 'snes_ghost_valley_2.png', large: IMG + 'snes_ghost_valley_2.png', series: TrackSeries.SNES_GHOST_VALLEY },
  { id: 'SNES_GHOST_VALLEY_3', name: 'Vallée Fantôme 3 (SNES)', img: IMG + 'snes_ghost_valley_3.png', large: IMG + 'snes_ghost_valley_3.png', series: TrackSeries.SNES_GHOST_VALLEY },
  { id: 'SNES_CHOCO_ISLAND_1', name: 'Île Choco 1 (SNES)', img: IMG + 'snes_choco_island_1.png', large: IMG + 'snes_choco_island_1.png', series: TrackSeries.SNES_CHOCO_ISLAND },
  { id: 'SNES_CHOCO_ISLAND_2', name: 'Île Choco 2 (SNES)', img: IMG + 'snes_choco_island_2.png', large: IMG + 'snes_choco_island_2.png', series: TrackSeries.SNES_CHOCO_ISLAND },
  { id: 'SNES_VANILLA_LAKE_1', name: 'Lac Vanille (SNES)', img: IMG + 'snes_vanilla_lake_1.png', large: IMG + 'snes_vanilla_lake_1.png', series: TrackSeries.SNES_VANILLA_LAKE },
  { id: 'SNES_KOOPA_BEACH_1', name: 'Plage Koopa (SNES)', img: IMG + 'snes_koopa_beach_1.png', large: IMG + 'snes_koopa_beach_1.png', series: TrackSeries.SNES_KOOPA_BEACH },
].map((t) => ({ series: TrackSeries.STANDALONE, ...t }));

const TRACKS_BY_ID = new Map(TRACKS.map((t) => [t.id, t]));

/** Graphe dirigé des trajets (A -> [destinations possibles]). Portage fidèle de TrackRepository.connections. */
const CONNECTIONS = {
  CIRCUIT_MARIO_BROS: ['STADE_WARIO', 'MONTAGNE_CHOCO', 'TROPHEOPOLIS', 'MONT_TCHOU_TCHOU', 'DESERT_SOLEIL', 'SOUK_MASKASS'],
  TROPHEOPOLIS: ['MONTAGNE_CHOCO', 'PRAIRIE_MEUH_MEUH', 'STADE_PEACH', 'SAVANE_SAUVAGE', 'PLAGE_KOOPA', 'SPATIOPORT_DK', 'MONT_TCHOU_TCHOU', 'DESERT_SOLEIL', 'CIRCUIT_MARIO_BROS', 'STADE_WARIO'],
  MONT_TCHOU_TCHOU: ['DESERT_SOLEIL', 'CIRCUIT_MARIO_BROS', 'MONTAGNE_CHOCO', 'TROPHEOPOLIS', 'PLAGE_KOOPA', 'SPATIOPORT_DK'],
  SPATIOPORT_DK: ['MONT_TCHOU_TCHOU', 'DESERT_SOLEIL', 'CIRCUIT_MARIO_BROS', 'TROPHEOPOLIS', 'STADE_PEACH', 'PLAGE_KOOPA'],

  DESERT_SOLEIL: ['SOUK_MASKASS', 'CIRCUIT_MARIO_BROS', 'TROPHEOPOLIS', 'PLAGE_KOOPA', 'MONT_TCHOU_TCHOU'],
  SOUK_MASKASS: ['BATEAU_VOLANT', 'STADE_WARIO', 'MONTAGNE_CHOCO', 'CIRCUIT_MARIO_BROS', 'DESERT_SOLEIL'],
  STADE_WARIO: ['CHATEAU_BOWSER', 'FOURNAISE_OSSEUSE', 'USINE_TOAD', 'MONTAGNE_CHOCO', 'TROPHEOPOLIS', 'CIRCUIT_MARIO_BROS', 'SOUK_MASKASS', 'BATEAU_VOLANT'],
  BATEAU_VOLANT: ['CHATEAU_BOWSER', 'FOURNAISE_OSSEUSE', 'USINE_TOAD', 'STADE_WARIO', 'SOUK_MASKASS'],

  ALPES_DK: ['CITE_SORBET', 'PIC_OBSERVATOIRE', 'CITE_SORBET', 'GALION_WARIO', 'CITE_FLEUR_SEL', 'CHUTES_CHEEP_CHEEP', 'PRAIRIE_MEUH_MEUH', 'GOUFFRE_PISSENLIT'],
  PIC_OBSERVATOIRE: ['CITE_SORBET', 'GALION_WARIO', 'ALPES_DK', 'CHUTES_CHEEP_CHEEP', 'GOUFFRE_PISSENLIT', 'CIRCUIT_MARIO', 'CINEMA_BOO'],
  CITE_SORBET: ['GALION_WARIO', 'CITE_FLEUR_SEL', 'ALPES_DK', 'CHUTES_CHEEP_CHEEP', 'GOUFFRE_PISSENLIT', 'PIC_OBSERVATOIRE'],
  GALION_WARIO: ['PLAGE_PEACH', 'CITE_FLEUR_SEL', 'CHUTES_CHEEP_CHEEP', 'ALPES_DK', 'PIC_OBSERVATOIRE', 'CITE_SORBET'],

  PLAGE_KOOPA: ['SPATIOPORT_DK', 'SPATIOPORT_DK', 'TROPHEOPOLIS', 'STADE_PEACH', 'SAVANE_SAUVAGE', 'JUNGLE_DINO_DINO'],
  SAVANE_SAUVAGE: ['CHUTES_CHEEP_CHEEP', 'CITE_FLEUR_SEL', 'PLAGE_PEACH', 'BLOC_ANTIQUE', 'JUNGLE_DINO_DINO', 'PLAGE_KOOPA', 'TROPHEOPOLIS', 'STADE_PEACH'],

  PLAGE_PEACH: ['BLOC_ANTIQUE', 'JUNGLE_DINO_DINO', 'SAVANE_SAUVAGE', 'CITE_FLEUR_SEL', 'GALION_WARIO'],
  CITE_FLEUR_SEL: ['ALPES_DK', 'GALION_WARIO', 'PLAGE_PEACH', 'BLOC_ANTIQUE', 'JUNGLE_DINO_DINO', 'SAVANE_SAUVAGE', 'CHUTES_CHEEP_CHEEP'],
  JUNGLE_DINO_DINO: ['PLAGE_KOOPA', 'SAVANE_SAUVAGE', 'CITE_FLEUR_SEL', 'PLAGE_PEACH', 'BLOC_ANTIQUE'],
  BLOC_ANTIQUE: ['JUNGLE_DINO_DINO', 'JUNGLE_DINO_DINO', 'PLAGE_KOOPA', 'SAVANE_SAUVAGE', 'CITE_FLEUR_SEL', 'PLAGE_PEACH'],

  CHUTES_CHEEP_CHEEP: ['GOUFFRE_PISSENLIT', 'PIC_OBSERVATOIRE', 'ALPES_DK', 'GALION_WARIO', 'CITE_FLEUR_SEL', 'SAVANE_SAUVAGE', 'STADE_PEACH', 'MONTAGNE_CHOCO', 'PRAIRIE_MEUH_MEUH'],
  GOUFFRE_PISSENLIT: ['CINEMA_BOO', 'PIC_OBSERVATOIRE', 'CITE_SORBET', 'ALPES_DK', 'CHUTES_CHEEP_CHEEP', 'PRAIRIE_MEUH_MEUH', 'USINE_TOAD', 'CIRCUIT_MARIO', 'CHEMIN_CHENE'],
  CINEMA_BOO: ['PIC_OBSERVATOIRE', 'GOUFFRE_PISSENLIT', 'CIRCUIT_MARIO', 'FOURNAISE_OSSEUSE', 'CHEMIN_CHENE'],
  FOURNAISE_OSSEUSE: ['CHEMIN_CHENE', 'CINEMA_BOO', 'CIRCUIT_MARIO', 'PRAIRIE_MEUH_MEUH', 'USINE_TOAD', 'STADE_WARIO', 'BATEAU_VOLANT', 'CHATEAU_BOWSER'],

  PRAIRIE_MEUH_MEUH: ['CIRCUIT_MARIO', 'GOUFFRE_PISSENLIT', 'ALPES_DK', 'CHUTES_CHEEP_CHEEP', 'STADE_PEACH', 'TROPHEOPOLIS', 'MONTAGNE_CHOCO', 'USINE_TOAD', 'FOURNAISE_OSSEUSE'],
  MONTAGNE_CHOCO: ['USINE_TOAD', 'PRAIRIE_MEUH_MEUH', 'CHUTES_CHEEP_CHEEP', 'STADE_PEACH', 'TROPHEOPOLIS', 'MONT_TCHOU_TCHOU', 'CIRCUIT_MARIO_BROS', 'SOUK_MASKASS', 'STADE_WARIO', 'CHATEAU_BOWSER'],
  USINE_TOAD: ['FOURNAISE_OSSEUSE', 'CHEMIN_CHENE', 'CIRCUIT_MARIO', 'GOUFFRE_PISSENLIT', 'PRAIRIE_MEUH_MEUH', 'STADE_PEACH', 'MONTAGNE_CHOCO', 'CIRCUIT_MARIO_BROS', 'STADE_WARIO', 'BATEAU_VOLANT', 'CHATEAU_BOWSER'],
  CHATEAU_BOWSER: ['FOURNAISE_OSSEUSE', 'CIRCUIT_MARIO', 'USINE_TOAD', 'MONTAGNE_CHOCO', 'STADE_WARIO', 'BATEAU_VOLANT'],

  CHEMIN_CHENE: ['CINEMA_BOO', 'GOUFFRE_PISSENLIT', 'CIRCUIT_MARIO', 'USINE_TOAD', 'FOURNAISE_OSSEUSE'],
  CIRCUIT_MARIO: ['CHEMIN_CHENE', 'CINEMA_BOO', 'PIC_OBSERVATOIRE', 'GOUFFRE_PISSENLIT', 'PRAIRIE_MEUH_MEUH', 'STADE_PEACH', 'USINE_TOAD', 'CHATEAU_BOWSER', 'FOURNAISE_OSSEUSE'],
  STADE_PEACH: ['PRAIRIE_MEUH_MEUH', 'CHUTES_CHEEP_CHEEP', 'SAVANE_SAUVAGE', 'PLAGE_KOOPA', 'TROPHEOPOLIS', 'MONTAGNE_CHOCO', 'USINE_TOAD', 'ROUTE_ARC_EN_CIEL'],
};

function getConnectionsForTrack(trackId) {
  return CONNECTIONS[trackId] || [];
}

/** Tous les circuits de la même série (STANDALONE = seul dans sa série). */
function seriesMembers(trackId) {
  const track = TRACKS_BY_ID.get(trackId);
  if (!track || track.series === TrackSeries.STANDALONE) return [trackId];
  return TRACKS.filter((t) => t.series === track.series).map((t) => t.id);
}

function isSnes(trackId) {
  const track = TRACKS_BY_ID.get(trackId);
  return !!track && track.series !== TrackSeries.STANDALONE;
}

const SnesRemovalMode = Object.freeze({ OFF: 'OFF', SERIES: 'SERIES', ALL_SNES: 'ALL_SNES' });

/** Circuits à retirer du pool après avoir joué trackId, selon le mode de suppression SNES. */
function removalTargets(trackId, mode) {
  if (!isSnes(trackId) || mode === SnesRemovalMode.OFF) return [trackId];
  if (mode === SnesRemovalMode.SERIES) return seriesMembers(trackId);
  return TRACKS.filter((t) => isSnes(t.id)).map((t) => t.id);
}
