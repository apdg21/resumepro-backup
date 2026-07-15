// Cloudflare Pages Function — POST /api/groq
// Proxies Groq requests using a server-side secret (env.GROQ_API_KEY).
// The key never reaches the browser. Only same-origin requests from this site can reach it.

const ALLOWED_MODELS = [
  'llama-3.3-70b-versatile',
  'llama-3.1-8b-instant',
  'mixtral-8x7b-32768',
  'gemma2-9b-it',
];
const MAX_OUTPUT_TOKENS = 1800;
const MAX_INPUT_CHARS = 60000;

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.GROQ_API_KEY) {
    return json({ error: { message: 'Server is not configured with a Groq key yet.' } }, 500);
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

  const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.GROQ_API_KEY}`,
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
