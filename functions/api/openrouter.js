// Cloudflare Pages Function — POST /api/openrouter
// Proxies OpenRouter requests using a server-side secret (env.OPENROUTER_API_KEY).
// The key never reaches the browser. Only same-origin requests from this site can reach it.
// Restricted to OpenRouter's free-tier models to avoid any surprise cost.

const ALLOWED_MODELS = [
  'openai/gpt-4o-mini:free',
  'openai/gpt-oss-120b:free',
  'openai/gpt-oss-20b:free',
  'qwen/qwen3-next-80b-a3b-instruct:free',
  'arcee-ai/trinity-large-preview:free',
  'liquid/lfm-2.5-1.2b-thinking:free',
  'liquid/lfm-2.5-1.2b-instruct:free',
  'nvidia/nemotron-3-nano-30b-a3b:free',
  'nvidia/nemotron-nano-12b-v2-vl:free',
  'nvidia/nemotron-nano-9b-v2:free',
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
