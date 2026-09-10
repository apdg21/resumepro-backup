// functions/api/verify-license.js
// Verifies a Gumroad license key server-side, AND enforces a policy beyond
// what Gumroad's own "uses" counter can do: a key is locked to whichever
// template it first successfully downloads, and can only re-download THAT
// same template afterward (up to a small limit, for lost files/new devices).
// This stops one key being shared to download every template — the exact
// gap Gumroad's built-in verification alone can't close.
//
// Requires a Cloudflare KV namespace bound as LICENSE_KV. Setup:
//   wrangler kv:namespace create LICENSE_KV
// (then add the returned binding to your wrangler.toml / Pages KV bindings —
// see the guide for the exact steps)
//
//   wrangler pages secret put GUMROAD_PRODUCT_ID
// (paste the Product ID from your Gumroad product's License Key module)

const REDOWNLOAD_LIMIT = 5; // re-downloads allowed for the SAME template once locked

export async function onRequestPost(context) {
  const { request, env } = context;
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  };

  if (!env.GUMROAD_PRODUCT_ID) {
    return new Response(JSON.stringify({ error: "Server is missing GUMROAD_PRODUCT_ID." }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
  if (!env.LICENSE_KV) {
    return new Response(JSON.stringify({ error: "Server is missing the LICENSE_KV binding." }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  const { licenseKey, templateKey } = body;
  if (!licenseKey || typeof licenseKey !== "string" || !licenseKey.trim()) {
    return new Response(JSON.stringify({ valid: false, reason: "Missing license key" }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }
  if (!templateKey || typeof templateKey !== "string") {
    return new Response(JSON.stringify({ valid: false, reason: "Missing template identifier" }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  const trimmedKey = licenseKey.trim();

  // Step 1: confirm this is a real, paid Gumroad key for this product.
  const params = new URLSearchParams();
  params.append("product_id", env.GUMROAD_PRODUCT_ID);
  params.append("license_key", trimmedKey);
  params.append("increment_uses_count", "false"); // we track usage ourselves via KV instead

  let gumroadData;
  try {
    const gumroadRes = await fetch("https://api.gumroad.com/v2/licenses/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });
    gumroadData = await gumroadRes.json();
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Verification failed" }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  if (!gumroadData.success) {
    return new Response(JSON.stringify({ valid: false, reason: gumroadData.message || "Invalid license key" }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  // Gumroad's own test purchases bypass the template lock entirely, so you
  // can freely re-test the whole flow without burning through real policy
  // state in KV.
  const isTest = gumroadData.purchase && gumroadData.purchase.test;
  if (isTest) {
    return new Response(JSON.stringify({ valid: true, email: gumroadData.purchase?.email || null, test: true }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  // Step 2: enforce the one-key-one-template policy via KV, independent of
  // whatever Gumroad's own counter says.
  const existingRaw = await env.LICENSE_KV.get(trimmedKey);

  if (!existingRaw) {
    // First-ever successful use of this key — lock it to this template.
    await env.LICENSE_KV.put(trimmedKey, JSON.stringify({
      template: templateKey,
      uses: 1,
      firstUsedAt: new Date().toISOString()
    }));
    return new Response(JSON.stringify({ valid: true, email: gumroadData.purchase?.email || null }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  const existing = JSON.parse(existingRaw);

  if (existing.template !== templateKey) {
    return new Response(JSON.stringify({
      valid: false,
      reason: `This license key is already locked to a different template (${existing.template}). Each key can only be used to download one template.`
    }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }

  if (existing.uses >= REDOWNLOAD_LIMIT) {
    return new Response(JSON.stringify({
      valid: false,
      reason: "This license key has reached its re-download limit for this template."
    }), { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }

  existing.uses += 1;
  await env.LICENSE_KV.put(trimmedKey, JSON.stringify(existing));

  return new Response(JSON.stringify({ valid: true, email: gumroadData.purchase?.email || null }), {
    status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
  });
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
