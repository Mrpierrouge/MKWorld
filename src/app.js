/**
 * Routeur + coquille applicative — équivalent de MainActivity.kt (NavHost + bottom bar + thème).
 */

const ROUTES = {
  home: { render: (el) => HomeScreen.render(el), navIndex: 0 },
  tracks: { render: (el) => TracksScreen.render(el), navIndex: 1 },
  history: { render: (el) => HistoryScreen.render(el), navIndex: 2 },
  scores: { render: (el) => ScoresScreen.render(el), navIndex: 3 },
  settings: { render: (el) => SettingsScreen.render(el), navIndex: 0 },
  'race-result': { render: (el) => RaceResultScreen.render(el), navIndex: 0 },
};

let currentRoute = null;
const screenEl = document.getElementById('screen');
const bottomNavEl = document.getElementById('bottom-nav');

function routeFromHash() {
  const route = location.hash.replace('#', '').trim();
  return ROUTES[route] ? route : 'home';
}

function navigate(route) {
  if (location.hash === '#' + route) {
    handleRouteChange(); // re-clic sur le même onglet : on force quand même une entrée "fraîche"
  } else {
    location.hash = route;
  }
}

/** Un simple rendu (ex: après un changement d'état) : NE compte PAS comme une nouvelle navigation. */
function rerender() {
  renderRoute(currentRoute, false);
  updateBottomNav();
}

function handleRouteChange() {
  const route = routeFromHash();
  const isNewEntry = route !== currentRoute || route === 'home';
  currentRoute = route;
  renderRoute(route, isNewEntry);
  updateBottomNav();
}

function renderRoute(route, isNewEntry) {
  // Comme MainScreen.kt (`LaunchedEffect(Unit) { viewModel.resetCourse() }`), chaque nouvelle
  // entrée sur l'onglet "Aléatoire" réinitialise la phase en cours.
  if (route === 'home' && isNewEntry) {
    TrackState.resetCourse();
    HomeScreen.mountedPhase = null; // force la reconstruction de la coquille
  }
  ROUTES[route].render(screenEl);
}

function updateBottomNav() {
  const activeIndex = ROUTES[currentRoute].navIndex;
  Array.from(bottomNavEl.children).forEach((child, i) => {
    child.classList.toggle('active', i === activeIndex);
  });
}

function buildBottomNav() {
  clearChildren(bottomNavEl);
  const items = [
    { label: 'Aléatoire', icon: Icons.home, route: 'home' },
    { label: 'Circuits', icon: Icons.map, route: 'tracks' },
    { label: 'Historique', icon: Icons.history, route: 'history' },
    { label: 'Scores', icon: Icons.groups, route: 'scores' },
  ];
  items.forEach((item) => {
    bottomNavEl.append(h('button', { class: 'nav-item', onclick: () => navigate(item.route) }, [
      item.icon(),
      h('span', {}, item.label),
    ]));
  });
}

function bootstrap() {
  SettingsState.init();
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (SettingsState.themeMode === ThemeMode.SYSTEM) SettingsState.applyTheme();
    });
  }
  buildBottomNav();
  currentRoute = routeFromHash();
  window.addEventListener('hashchange', handleRouteChange);
  renderRoute(currentRoute, true);
  updateBottomNav();
}

bootstrap();
