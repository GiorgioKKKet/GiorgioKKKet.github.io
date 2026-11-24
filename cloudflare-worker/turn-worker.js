// Worker Cloudflare: genera credenziali TURN temporanee per Bilocale Deathmatch.
// Le chiavi NON stanno qui: vanno messe nel pannello del Worker (Settings → Variables and Secrets):
//   TURN_KEY_ID         → "Turn Token ID" della chiave TURN (Realtime → TURN Server)
//   TURN_KEY_API_TOKEN  → "API Token" della stessa chiave (tipo Secret)
// Il gioco chiama questo Worker prima di creare o unirsi a una stanza e riceve la lista iceServers.

const ALLOWED_ORIGINS = [
  'https://giorgiokkket.github.io',
  'http://localhost',
  'http://127.0.0.1',
];
const TTL = 6 * 60 * 60; // validità delle credenziali: 6 ore

function corsHeaders(origin) {
  const ok = ALLOWED_ORIGINS.some(o => origin === o || origin.startsWith(o + ':'));
  return {
    'Access-Control-Allow-Origin': ok ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Vary': 'Origin',
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const headers = corsHeaders(origin);
    if (request.method === 'OPTIONS') return new Response(null, { headers });

    const allowed = ALLOWED_ORIGINS.some(o => origin === o || origin.startsWith(o + ':'));
    if (!allowed) return new Response('Origine non permessa', { status: 403, headers });

    const r = await fetch(
      `https://rtc.live.cloudflare.com/v1/turn/keys/${env.TURN_KEY_ID}/credentials/generate-ice-servers`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.TURN_KEY_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ttl: TTL }),
      },
    );
    if (!r.ok) {
      return new Response(`Errore Cloudflare TURN: ${r.status}`, { status: 502, headers });
    }
    const data = await r.json();
    return new Response(JSON.stringify({ iceServers: data.iceServers }), {
      headers: { ...headers, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  },
};
