# MkWorld Randomiser — Web

Portage fidèle en JavaScript / HTML / CSS pur de l'application Android **MkWorld-Randomizer**
(Jetpack Compose + Kotlin), pour pouvoir l'utiliser directement dans un navigateur, sans build
ni installation.

## Lancer l'application

Aucune dépendance, aucun build. Deux façons de l'utiliser :

1. **Double-clic sur `index.html`** — fonctionne directement en `file://` (pas de modules ES,
   pas de `fetch`, images chargées en `<img src>` classiques).
2. **Via un petit serveur local** (recommandé pour un vrai usage, ex. sur mobile en LAN) :
   ```bash
   npx serve .
   # ou
   python -m http.server 8080
   ```
   puis ouvrir `http://localhost:8080`.

Les données (joueurs, scores, thème) sont sauvegardées dans le `localStorage` du navigateur :
elles persistent d'une session à l'autre, tant que vous ouvrez l'app depuis la même origine
(même fichier / même URL de serveur).

## Fonctionnalités portées

- **Aléatoire** : bloc "?" animé, roue de sélection simple (circuit) et double roue (trajet
  départ → arrivée), biais circuits/connexions, confettis, popup de résultat optionnelle,
  suppression automatique du circuit joué (avec gestion des séries SNES).
- **Circuits** : liste des 40 circuits (30 Mario Kart World + 10 variantes SNES), recherche,
  activation/désactivation, trajets par circuit, barre de progression.
- **Historique** : liste (même présentation que l'onglet Circuits) de tous les circuits/trajets
  tirés depuis l'onglet Aléatoire, du plus récent au plus ancien, avec l'avatar du 1er si un
  résultat a été saisi (rien sinon). Cliquer sur une entrée ouvre une popup avec le classement
  complet de la course et, pour chaque joueur, la variation des 3 ELO.
- **Scores** : création de profil (nom, 28 avatars, 6 couleurs), saisie des résultats de course
  (nombre de participants illimité, place réelle d'arrivée par joueur), 3 systèmes d'ELO calculés
  en parallèle et comparables (voir ci-dessous), podium top 3, détails joueur
  (courses/victoires/podiums, circuits favoris, les 3 scores d'ELO), réinitialisation du mois / des joueurs.
- **Réglages** : thème (système/clair/sombre), biais de génération, popup de circuit, maps SNES,
  courses par coupe, quota SNES par coupe, mode de suppression des circuits SNES.

## Les 3 systèmes d'ELO (`src/core/eloSystems.js`)

Chaque joueur a 3 scores indépendants, tous recalculés à chaque course à partir d'une seule
saisie (la place réelle d'arrivée de chaque participant, bots compris) :

- **Classement (sans les bots)** (`eloRank`) : seul l'ordre d'arrivée entre les joueurs présents
  compte, les bots sont ignorés. Même si le dernier joueur est arrivé 15ème dans une course à 4
  joueurs, il est considéré 4ème. C'est l'ancien (et unique) système, renommé.
- **Position réelle (bots comptés)** (`eloBots`) : utilise la place exacte d'arrivée. Plus
  l'écart de places entre deux joueurs est grand (plus il y a de bots/joueurs entre eux), plus le
  gain/la perte d'ELO est marqué.
- **Points (barème Mario Kart World)** (`eloPoints`) : convertit la place réelle de chaque joueur
  en points selon le barème officiel du jeu (15/12/10/9/9/8/8/7/7/6...), puis compare les joueurs
  sur cet écart de points.

Les 3 systèmes partagent le même moteur ELO pairwise (chaque paire de participants est comparée,
K réduit selon le nombre de joueurs classés) ; seule la façon de calculer le "résultat réel" du
duel change. L'écran Scores permet de basculer entre les 3 classements pour les comparer, et la
fiche détaillée d'un joueur affiche toujours les 3 scores côte à côte.

## Différences volontaires avec l'app Android d'origine

Quelques bugs listés dans `AGENTS.md`/`specs/` de l'app Android ont été corrigés au passage,
plutôt que reproduits à l'identique :

- `deletePlayer()` persiste désormais correctement (le bug Android ne sauvegardait pas la
  suppression).
- Les circuits ont un identifiant stable (`TRACKS[].id`, ex. `"CIRCUIT_MARIO_BROS"`) au lieu de
  s'appuyer sur une ressource `R.string.xxx` — cela élimine la fragilité des favoris
  (`Top3Maps`) et le risque de plantage sur circuit introuvable.
- 3 systèmes de score coexistent et sont réellement persistés (voir « Les 3 systèmes d'ELO »
  ci-dessous) : pas de calcul ELO mort par ailleurs.
- Le réglage "Voir la popup de circuit" est maintenant persisté et rechargé au démarrage.

## Structure du projet

```
index.html          Page unique, charge tous les scripts dans l'ordre
styles.css           Tout le style (thème clair/sombre, police Minecraft, composants)
assets/
  img/               Icônes des circuits + avatars + fond de carte (copiés depuis l'app Android)
  fonts/minecraft.ttf
src/
  core/              utils (mini hyperscript `h`, helpers), persistance localStorage, 3 systèmes d'ELO
  data/              Données statiques : 40 circuits, graphe des trajets, avatars
  state/             Portage des 3 ViewModels Android (Track / Score / Settings)
  ui/                Composants réutilisables : roue de sélection, confettis, dialogues,
                     avatar, podium, popup de profil, détails joueur, icônes SVG
  screens/           Les 5 écrans (Aléatoire, Circuits, Résultats de course, Scores, Réglages)
  app.js             Routeur (hash-based) + barre de navigation + bootstrap
```

Pas de framework, pas de build : chaque fichier est un script classique (pas de modules ES) qui
expose ses éléments en portée globale, chargé dans l'ordre par `index.html`. Ce choix permet
d'ouvrir `index.html` en double-clic sans serveur ni étape de compilation.
