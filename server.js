const fs = require('fs');
const http = require('http');
const path = require('path');

const ROOT = __dirname;
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.ttf': 'font/ttf',
};

function readDotEnv() {
  const file = path.join(ROOT, '.env');
  if (!fs.existsSync(file)) return {};

  return fs.readFileSync(file, 'utf8').split(/\r?\n/).reduce((values, line) => {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
    if (!match || (match[1] !== 'API_URL' && match[1] !== 'SB_PUBLIC_KEY')) return values;
    let value = match[2];
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    } else {
      value = value.replace(/\s+#.*$/, '');
    }
    values[match[1]] = value;
    return values;
  }, {});
}

function publicConfig() {
  const env = readDotEnv();
  const url = process.env.API_URL || env.API_URL;
  const publishableKey = process.env.SB_PUBLIC_KEY || env.SB_PUBLIC_KEY;
  if (!url || !publishableKey) {
    throw new Error('API_URL et SB_PUBLIC_KEY doivent être configurées dans .env ou dans l’environnement.');
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(url);
  } catch (_) {
    throw new Error('API_URL doit être une URL Supabase valide.');
  }
  if (parsedUrl.protocol !== 'https:' && parsedUrl.hostname !== 'localhost' && parsedUrl.hostname !== '127.0.0.1') {
    throw new Error('API_URL doit utiliser HTTPS (sauf pour un Supabase local).');
  }
  return { url: parsedUrl.origin, publishableKey };
}

function createServer() {
  return http.createServer((request, response) => {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    } catch (_) {
      response.writeHead(400).end('Bad request');
      return;
    }

    if (pathname === '/config.js') {
      let config;
      try {
        config = publicConfig();
      } catch (error) {
        response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' });
        response.end(error.message);
        return;
      }
      const script = `window.MKW_SUPABASE_CONFIG = Object.freeze(${JSON.stringify(config)});`;
      response.writeHead(200, {
        'Content-Type': MIME_TYPES['.js'],
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      });
      response.end(request.method === 'HEAD' ? undefined : script);
      return;
    }

    const relativePath = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (relativePath.split(/[\\/]/).some((segment) => segment.startsWith('.'))) {
      response.writeHead(404).end('Not found');
      return;
    }
    const filePath = path.resolve(ROOT, relativePath);
    if (filePath !== ROOT && !filePath.startsWith(ROOT + path.sep)) {
      response.writeHead(403).end('Forbidden');
      return;
    }

    fs.readFile(filePath, (error, content) => {
      if (error) {
        response.writeHead(error.code === 'ENOENT' ? 404 : 500).end('Not found');
        return;
      }
      response.writeHead(200, {
        'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
        'X-Content-Type-Options': 'nosniff',
      });
      response.end(request.method === 'HEAD' ? undefined : content);
    });
  });
}

if (require.main === module) {
  const port = Number(process.env.PORT) || 8080;
  const host = process.env.HOST || '127.0.0.1';
  createServer().listen(port, host, () => {
    console.log(`MkWorld Randomiser disponible sur http://${host}:${port}`);
  });
}

module.exports = { createServer };
