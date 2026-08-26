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
  "gemini-3.5-flash",       // newest, most capable — verify exact id in your AI Studio dashboard
  "gemini-3.1-flash-lite",  // fastest / cheapest of the 3.x line
  "gemini-2.5-flash",       // separate quota bucket from the 3.x models — good fallback when 3.5 is rate-limited
  "gemini-2.5-flash-lite"   // separate quota bucket, fastest fallback option
]);

const DEFAULT_MODEL = "gemini-3.5-flash";

// --- buildSystemPrompt with stronger instructions ---
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
- **CRITICAL: The response must be a SINGLE JSON object, NOT an array, and NOT multiple objects. Start with { and end with }. Do not include any text outside the JSON.**
- **For the "image" field: always output it as a simple string (e.g., "assets/profile.jpg" or an empty string). Do not include any data URL or extra characters.**
- Respond with ONLY the JSON object.`;
}

// --- Helper: extract all JSON objects from a string ---
function extractAllJSONObjects(text) {
  // Remove markdown code fences
  let cleaned = text.replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
  
  // Find all JSON objects using a simple regex (non-greedy from { to })
  // This handles concatenated objects without commas
  const objects = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < cleaned.length; i++) {
    if (cleaned[i] === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (cleaned[i] === '}') {
      depth--;
      if (depth === 0 && start !== -1) {
        const objStr = cleaned.substring(start, i + 1);
        try {
          const parsed = JSON.parse(objStr);
          objects.push(parsed);
        } catch (e) {
          // ignore invalid object
        }
        start = -1;
      }
    }
  }
  return objects;
}

// --- onRequestPost with fallback parsing ---
export async function onRequestPost(context) {
  const { request, env } = context;
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
          temperature: 0.2  // Lower temperature to reduce variability
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

    // Attempt to parse the response
    let filledData = null;
    const objects = extractAllJSONObjects(text);

    if (objects.length === 0) {
      // If no object found, maybe the response is a single object but with invalid JSON? Try direct parse.
      try {
        const cleaned = text.trim().replace(/^```json\s*/i, "").replace(/```\s*$/, "").trim();
        filledData = JSON.parse(cleaned);
      } catch (e) {
        return new Response(
          JSON.stringify({ error: "Model did not return valid JSON", raw: text }),
          { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else if (objects.length === 1) {
      // Single object – use it directly
      filledData = objects[0];
    } else {
      // Multiple objects – merge them (deep merge) or take the first one
      // Here we'll merge: top-level keys from later objects override earlier ones, and arrays are concatenated
      const merged = objects.reduce((acc, obj) => {
        for (const key of Object.keys(obj)) {
          if (Array.isArray(obj[key]) && Array.isArray(acc[key])) {
            acc[key] = acc[key].concat(obj[key]);
          } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key]) && 
                     typeof acc[key] === 'object' && acc[key] !== null && !Array.isArray(acc[key])) {
            // Merge nested objects (shallow)
            acc[key] = { ...acc[key], ...obj[key] };
          } else {
            acc[key] = obj[key];
          }
        }
        return acc;
      }, {});
      filledData = merged;
    }

    // If filledData is still null (shouldn't happen), error out
    if (!filledData) {
      return new Response(
        JSON.stringify({ error: "Could not extract valid JSON from model response", raw: text }),
        { status: 502, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // --- Array validation (if it's an array, handle it) ---
    if (Array.isArray(filledData)) {
      if (filledData.length === 1) {
        filledData = filledData[0];
      } else {
        // If multiple items, merge them into one object (treat each as a record)
        const merged = filledData.reduce((acc, obj) => {
          for (const key of Object.keys(obj)) {
            if (Array.isArray(obj[key]) && Array.isArray(acc[key])) {
              acc[key] = acc[key].concat(obj[key]);
            } else if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key]) && 
                       typeof acc[key] === 'object' && acc[key] !== null && !Array.isArray(acc[key])) {
              acc[key] = { ...acc[key], ...obj[key] };
            } else {
              acc[key] = obj[key];
            }
          }
          return acc;
        }, {});
        filledData = merged;
      }
    }

    // Schema conformance check
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
