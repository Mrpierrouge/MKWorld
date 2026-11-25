module.exports = (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    response.statusCode = 405;
    response.end();
    return;
  }

  const url = process.env.API_URL;
  const publishableKey = process.env.SB_PUBLIC_KEY;
  if (!url || !publishableKey) {
    response.statusCode = 500;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.end('API_URL et SB_PUBLIC_KEY doivent être configurées dans Vercel.');
    return;
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (_) {
    response.statusCode = 500;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.end('API_URL doit être une URL Supabase valide.');
    return;
  }
  if (parsedUrl.protocol !== 'https:' && parsedUrl.hostname !== 'localhost' && parsedUrl.hostname !== '127.0.0.1') {
    response.statusCode = 500;
    response.setHeader('Content-Type', 'text/plain; charset=utf-8');
    response.end('API_URL doit utiliser HTTPS (sauf pour un Supabase local).');
    return;
  }

  const config = { url: parsedUrl.origin, publishableKey };
  const script = `window.MKW_SUPABASE_CONFIG = Object.freeze(${JSON.stringify(config)});`;
  response.statusCode = 200;
  response.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.end(request.method === 'HEAD' ? undefined : script);
};
