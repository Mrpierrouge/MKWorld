/** Client Supabase minimal via l'API REST PostgREST, sans exposer de clé privilégiée. */
const SupabaseClient = {
  getConfig() {
    const config = window.MKW_SUPABASE_CONFIG;
    if (!config || !config.url || !config.publishableKey) {
      throw new Error('Configuration Supabase absente. Lancez l’application avec `node server.js`.');
    }
    return config;
  },

  async request(table, query, options) {
    const config = this.getConfig();
    const settings = options || {};
    const url = `${config.url.replace(/\/+$/, '')}/rest/v1/${table}${query ? `?${query}` : ''}`;
    const response = await fetch(url, {
      method: settings.method || 'GET',
      headers: {
        apikey: config.publishableKey,
        Authorization: `Bearer ${config.publishableKey}`,
        ...(settings.body ? { 'Content-Type': 'application/json' } : {}),
        ...(settings.prefer ? { Prefer: settings.prefer } : {}),
      },
      ...(settings.body ? { body: JSON.stringify(settings.body) } : {}),
    });

    if (!response.ok) {
      const details = await response.text();
      throw new Error(`Supabase (${response.status}) : ${details || response.statusText}`);
    }

    if (response.status === 204) return null;
    const text = await response.text();
    return text ? JSON.parse(text) : null;
  },
};
