// Cloudflare Pages Function
// Route: POST /api/generate
// Keeps the Gemini API key server-side (set as a secret, never shipped to the browser).
//
// Setup (once, from your project root, after `wrangler pages project create`):
//   wrangler pages secret put GEMINI_API_KEY
// (paste your free key from https://aistudio.google.com/apikey when prompted)
//
// Local dev:
//   Create a `.dev.vars` file (gitignored) with: GEMINI_API_KEY=your_key_here
//   Then run: wrangler pages dev public

const ALLOWED_MODELS = new Set([
  "gemini-1.5-flash",     // fast, free-tier friendly — recommended default
  "gemini-2.0-flash",     // latest flash model
  "gemini-1.5-flash-8b",  // fastest / cheapest
  "gemini-1.5-pro"        // most capable
]);

const DEFAULT_MODEL = "gemini-1.5-flash";

function buildSystemPrompt(schemaJsonText) {
  return `You are filling in a website template's data file with a real person's information.

Below is the template's CURRENT data.json. Its keys, nesting, and array item shapes define the exact schema you must follow:

${schemaJsonText}

Task: using the person's raw input (provided as the user message — this may be messy text extracted from a resume/CV file, a LinkedIn export, or free-form notes), produce a NEW JSON object with:
- The EXACT SAME top-level keys as the schema above, in the same structure.
- For nested objects (e.g. "theme", "contact", "profile"), keep the same sub-keys unless they are purely cosmetic/design values (like theme colors, image paths) — in that case, keep the original values unchanged since they are template styling/assets, not personal data.
- For arrays of objects (e.g. "experience", "education", "skills"), keep each item's shape (same fields per item), but adjust the NUMBER of items to match what's actually in the person's input (don't pad with fake entries, don't invent facts).
- Never add new keys that weren't in the schema. Never remove required top-level keys — if the person didn't give that info, use an empty string, empty array, or reasonable neutral default.
- Rewrite prose fields (like "about"/"summary" or experience descriptions) in clean, professional language based only on what the person actually said — do not invent achievements, numbers, or dates.
- Respond with ONLY the JSON object.`;
}

export async function onRequestPost(context) {
  const { request, env } = context;

  // CORS for same-origin use is implicit; these headers help if you ever call
  // this endpoint from a different origin during local development.
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (!env.GEMINI_API_KEY) {
    return new Response(
      JSON.stringify({ error: "Server is missing GEMINI_API_KEY. Set it with: wrangler pages secret put GEMINI_API_KEY" }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  const { schema, rawText, model } = body;

  if (!schema || typeof schema !== "object") {
    return new Response(JSON.stringify({ error: "Missing or invalid 'schema' (must be an object)" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
  if (!rawText || typeof rawText !== "string" || !rawText.trim()) {
    return new Response(JSON.stringify({ error: "Missing 'rawText' (the user's resume/portfolio content)" }), {
      status: 400,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  const chosenModel = ALLOWED_MODELS.has(model) ? model : DEFAULT_MODEL;

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${chosenModel}:generateContent?key=${env.GEMINI_API_KEY}`;

  try {
    const geminiResponse = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildSystemPrompt(JSON.stringify(schema, null, 2)) }]
        },
        contents: [
          { role: "user", parts: [{ text: rawText }] }
        ],
        generationConfig: {
          responseMimeType: "application/json",
          temperature: 0.4
        }
      })
    });

    const result = await geminiResponse.json();

    if (!geminiResponse.ok) {
      return new Response(
        JSON.stringify({ error: result.error?.message || "Gemini API error", details: result }),
        { status: geminiResponse.status, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const candidate = result.candidates && result.candidates[0];
    const text = candidate?.content?.parts?.map(p => p.text || "").join("") || "";

    let cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();

    let filledData;
    try {
      filledData = JSON.parse(cleaned);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: "Model did not return valid JSON", raw: cleaned }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Basic schema-conformance check: same top-level key set as the input schema.
    const expectedKeys = Object.keys(schema).sort().join(",");
    const gotKeys = Object.keys(filledData).sort().join(",");
    const keysMatch = expectedKeys === gotKeys;

    return new Response(
      JSON.stringify({ data: filledData, keysMatch, model: chosenModel }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Unexpected server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}
