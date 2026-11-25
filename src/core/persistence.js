/** Persistance des profils et courses dans Supabase; les préférences d'affichage restent locales. */
const Persistence = {
  SETTINGS_KEY: 'mkw_settings_v1',
  PLAYER_STORAGE_KEY: 'mkw_players_v1',
  HISTORY_STORAGE_KEY: 'mkw_history_v1',
  playerIds: new Set(),
  historyIds: new Set(),
  playerQueue: Promise.resolve(),
  historyQueue: Promise.resolve(),

  async initialize() {
    const [playerRows, historyRows] = await Promise.all([
      this.loadAllRows('players'),
      this.loadAllRows('race_history'),
    ]);

    let players = playerRows.map(this.playerFromRow);
    let history = historyRows.map(this.historyFromRow);

    if (players.length === 0) {
      const legacyPlayers = this.loadLegacyArray(this.PLAYER_STORAGE_KEY);
      if (legacyPlayers.length > 0) {
        players = legacyPlayers;
        await this.syncPlayers(players);
      }
    }
    if (history.length === 0) {
      const legacyHistory = this.loadLegacyArray(this.HISTORY_STORAGE_KEY);
      if (legacyHistory.length > 0) {
        history = legacyHistory;
        await this.syncHistory(history);
      }
    }

    this.playerIds = new Set(players.map((player) => player.id));
    this.historyIds = new Set(history.map((entry) => entry.id));
    return { players, history };
  },

  async loadAllRows(table) {
    const pageSize = 500;
    const rows = [];
    for (let offset = 0; ; offset += pageSize) {
      const page = await SupabaseClient.request(
        table,
        `select=*&limit=${pageSize}&offset=${offset}`,
      );
      rows.push(...page);
      if (page.length < pageSize) return rows;
    }
  },

  loadLegacyArray(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const value = JSON.parse(raw);
      if (!Array.isArray(value)) throw new Error(`Le contenu local "${key}" n’est pas une liste.`);
      return value;
    } catch (error) {
      console.warn(`Migration des anciennes données (${key}) impossible.`, error);
      return [];
    }
  },

  playerFromRow(row) {
    return {
      id: row.id,
      name: row.name,
      avatar: row.avatar,
      color: row.color,
      eloRank: row.elo_rank,
      eloBots: row.elo_bots,
      eloPoints: row.elo_points,
      runNumbers: row.run_numbers,
      victoryNumbers: row.victory_numbers,
      timesInPodium: row.times_in_podium,
      top3Maps: row.top3_maps || [],
    };
  },

  playerToRow(player) {
    return {
      id: player.id,
      name: player.name,
      avatar: player.avatar,
      color: player.color,
      elo_rank: player.eloRank,
      elo_bots: player.eloBots,
      elo_points: player.eloPoints,
      run_numbers: player.runNumbers,
      victory_numbers: player.victoryNumbers,
      times_in_podium: player.timesInPodium,
      top3_maps: player.top3Maps || [],
    };
  },

  historyFromRow(row) {
    return {
      id: row.id,
      trackId: row.track_id,
      endTrackId: row.end_track_id,
      timestamp: Date.parse(row.played_at),
      result: row.result,
    };
  },

  historyToRow(entry) {
    return {
      id: entry.id,
      track_id: entry.trackId,
      end_track_id: entry.endTrackId,
      played_at: new Date(entry.timestamp).toISOString(),
      result: entry.result,
    };
  },

  savePlayers(players) {
    this.playerQueue = this.playerQueue.then(() => this.syncPlayers(players));
    this.playerQueue = this.playerQueue.catch((error) => this.reportSaveError(error));
  },

  async syncPlayers(players) {
    const nextIds = new Set(players.map((player) => player.id));
    if (players.length > 0) {
      await SupabaseClient.request('players', 'on_conflict=id', {
        method: 'POST',
        body: players.map(this.playerToRow),
        prefer: 'resolution=merge-duplicates,return=minimal',
      });
    }
    await Promise.all(Array.from(this.playerIds)
      .filter((id) => !nextIds.has(id))
      .map((id) => SupabaseClient.request('players', `id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' })));
    this.playerIds = nextIds;
  },

  saveHistory(history) {
    this.historyQueue = this.historyQueue.then(() => this.syncHistory(history));
    this.historyQueue = this.historyQueue.catch((error) => this.reportSaveError(error));
  },

  async syncHistory(history) {
    const nextIds = new Set(history.map((entry) => entry.id));
    if (history.length > 0) {
      await SupabaseClient.request('race_history', 'on_conflict=id', {
        method: 'POST',
        body: history.map(this.historyToRow),
        prefer: 'resolution=merge-duplicates,return=minimal',
      });
    }
    await Promise.all(Array.from(this.historyIds)
      .filter((id) => !nextIds.has(id))
      .map((id) => SupabaseClient.request('race_history', `id=eq.${encodeURIComponent(id)}`, { method: 'DELETE' })));
    this.historyIds = nextIds;
  },

  reportSaveError(error) {
    console.error('Échec de la sauvegarde Supabase.', error);
    showAppStatus('La sauvegarde Supabase a échoué. Vérifiez la connexion et les règles RLS.');
  },

  loadSettings() {
    try {
      const raw = localStorage.getItem(this.SETTINGS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (error) {
      console.error('Lecture des préférences locales impossible.', error);
      showAppStatus('Impossible de lire les préférences enregistrées sur cet appareil.');
      return {};
    }
  },

  saveSettings(patch) {
    try {
      const current = this.loadSettings();
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify({ ...current, ...patch }));
    } catch (e) {
      console.error('Sauvegarde des préférences locales impossible.', e);
      showAppStatus('Impossible d’enregistrer les préférences sur cet appareil.');
    }
  },
};
