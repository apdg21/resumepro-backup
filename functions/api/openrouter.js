// Cloudflare Pages Function — POST /api/openrouter
// Proxies OpenRouter requests using a server-side secret (env.OPENROUTER_API_KEY).
// The key never reaches the browser. Only same-origin requests from this site can reach it.
// Restricted to OpenRouter's free-tier models to avoid any surprise cost.

const ALLOWED_MODELS = [
  'openrouter/free',
  'minimax/minimax-m3:free',
  'nvidia/nemotron-3-ultra:free',
  'nvidia/nemotron-3.5-lightning:free',
  'poolside/laguna-s-2.1:free',
  'inclusionai/ling-3.0-flash-fin:free',
];
const MAX_OUTPUT_TOKENS = 1800;
const MAX_INPUT_CHARS = 60000;

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.OPENROUTER_API_KEY) {
    return json({ error: { message: 'Server is not configured with an OpenRouter key yet.' } }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return json({ error: { message: 'Invalid JSON body.' } }, 400);
  }

  const model = body.model;
  if (!ALLOWED_MODELS.includes(model)) {
    return json({ error: { message: 'Model not allowed: ' + model } }, 400);
  }

  const sys = String(body.system || '');
  const text = String(body.text || '');
  if ((sys.length + text.length) > MAX_INPUT_CHARS) {
    return json({ error: { message: 'Request too large.' } }, 413);
  }

  const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://resumepro.pages.dev',
      'X-Title': 'CS Agent',
    },
    body: JSON.stringify({
      model,
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: text },
      ],
    }),
  });

  const data = await upstream.json();
  return json(data, upstream.status);
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
