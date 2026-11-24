/**
 * Persistance locale — équivalent du DataStore Preferences + Gson de l'app Android.
 * Utilise localStorage (persiste entre sessions, contrairement aux réglages de tirage
 * qui restent volontairement en mémoire, comme dans TrackViewModel d'origine).
 */

const Persistence = {
  PLAYERS_KEY: 'mkw_players_v1',
  SETTINGS_KEY: 'mkw_settings_v1',
  HISTORY_KEY: 'mkw_history_v1',

  loadPlayers() {
    try {
      const raw = localStorage.getItem(this.PLAYERS_KEY);
      if (!raw) return [];
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch (e) {
      console.warn('Lecture players impossible', e);
      return [];
    }
  },

  savePlayers(list) {
    try {
      localStorage.setItem(this.PLAYERS_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Sauvegarde players impossible', e);
    }
  },

  loadHistory() {
    try {
      const raw = localStorage.getItem(this.HISTORY_KEY);
      if (!raw) return [];
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch (e) {
      console.warn('Lecture historique impossible', e);
      return [];
    }
  },

  saveHistory(list) {
    try {
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(list));
    } catch (e) {
      console.warn('Sauvegarde historique impossible', e);
    }
  },

  loadSettings() {
    try {
      const raw = localStorage.getItem(this.SETTINGS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  },

  saveSettings(patch) {
    try {
      const current = this.loadSettings();
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify({ ...current, ...patch }));
    } catch (e) {
      console.warn('Sauvegarde settings impossible', e);
    }
  },
};
