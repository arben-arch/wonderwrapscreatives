/**
 * Vercel Serverless Function — Meta Graph API Proxy
 * Proxies requests to graph.facebook.com to avoid CORS issues.
 *
 * Usage from dashboard:
 *   GET /api/meta?path=/act_XXX/ads&fields=name,status&access_token=EAAxxxx
 *
 * The function forwards the request to Meta and returns the response.
 */

export default async function handler(req, res) {
  // Allow requests from your Vercel domain
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { path, ...params } = req.query;

  if (!path) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  if (!params.access_token) {
    return res.status(400).json({ error: 'Missing access_token parameter' });
  }

  // Build the Meta Graph API URL
  const BASE = 'https://graph.facebook.com/v19.0';
  const queryString = new URLSearchParams(params).toString();
  const url = `${BASE}${path}?${queryString}`;

  try {
    const metaRes = await fetch(url, {
      method: req.method === 'POST' ? 'POST' : 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await metaRes.json();

    if (!metaRes.ok) {
      return res.status(metaRes.status).json(data);
    }

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: { message: 'Proxy error: ' + err.message, type: 'ProxyError' }
    });
  }
}
