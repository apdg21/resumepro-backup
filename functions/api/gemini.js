// Cloudflare Pages Function — POST /api/gemini
// Proxies Google Gemini requests using a server-side secret (env.GEMINI_API_KEY).
// The key never reaches the browser. Only same-origin requests from this site can reach it.

const ALLOWED_MODELS = [
  'gemini-3.5-flash',
  'gemini-3.1-flash-lite',
  'gemma-4-31b-it',
  'gemma-4-26b-a4b-it',
];
const MAX_OUTPUT_TOKENS = 1800;      // hard cap regardless of what the client asks for
const MAX_INPUT_CHARS = 60000;       // rough guard against oversized abusive payloads

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.GEMINI_API_KEY) {
    return json({ error: { message: 'Server is not configured with a Gemini key yet.' } }, 500);
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

  const upstream = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: sys }] },
        contents: [{ role: 'user', parts: [{ text }] }],
        generationConfig: { maxOutputTokens: MAX_OUTPUT_TOKENS },
      }),
    }
  );

  const data = await upstream.json();
  return json(data, upstream.status);
}

function json(obj, status) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
