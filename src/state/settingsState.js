/** Portage de viewmodels/SettingsViewModel.kt. */

const ThemeMode = Object.freeze({ SYSTEM: 'SYSTEM', LIGHT: 'LIGHT', DARK: 'DARK' });

const SettingsState = {
  themeMode: ThemeMode.SYSTEM,
  /** Système d'ELO affiché dans l'écran Scores (voir core/eloSystems.js). */
  activeEloSystem: 'rank',

  init() {
    const saved = Persistence.loadSettings();
    if (saved.themeMode && ThemeMode[saved.themeMode]) this.themeMode = saved.themeMode;
    if (typeof saved.popupEnabled === 'boolean') TrackState.popupEnabled = saved.popupEnabled;
    if (saved.activeEloSystem && ELO_SYSTEMS[saved.activeEloSystem]) this.activeEloSystem = saved.activeEloSystem;
    this.applyTheme();
  },

  setThemeMode(mode) {
    this.themeMode = mode;
    Persistence.saveSettings({ themeMode: mode });
    this.applyTheme();
  },

  setActiveEloSystem(systemId) {
    if (!ELO_SYSTEMS[systemId]) return;
    this.activeEloSystem = systemId;
    Persistence.saveSettings({ activeEloSystem: systemId });
  },

  isDarkResolved() {
    if (this.themeMode === ThemeMode.DARK) return true;
    if (this.themeMode === ThemeMode.LIGHT) return false;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  },

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.isDarkResolved() ? 'dark' : 'light');
  },
};
