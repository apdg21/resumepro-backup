// functions/api/verify-license.js
// Verifies a Gumroad license key server-side. GUMROAD_PRODUCT_ID is not
// secret (it's visible in your Gumroad dashboard and checkout URLs), but
// keeping it as an environment variable makes it easy to change without
// editing code.
//
// Setup:
//   wrangler pages secret put GUMROAD_PRODUCT_ID
// (paste the Product ID from your Gumroad product's License Key module)

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

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
      status: 400, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  const { licenseKey } = body;
  if (!licenseKey || typeof licenseKey !== "string" || !licenseKey.trim()) {
    return new Response(JSON.stringify({ valid: false, reason: "Missing license key" }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
    });
  }

  const params = new URLSearchParams();
  params.append("product_id", env.GUMROAD_PRODUCT_ID);
  params.append("license_key", licenseKey.trim());
  params.append("increment_uses_count", "true");

  try {
    const gumroadRes = await fetch("https://api.gumroad.com/v2/licenses/verify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });

    const data = await gumroadRes.json();

    if (!data.success) {
      return new Response(JSON.stringify({ valid: false, reason: data.message || "Invalid license key" }), {
        status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    // Test purchases from Gumroad's own preview mode always pass, without
    // counting toward any usage limit enforced below.
    const isTest = data.purchase && data.purchase.test;

    // Usage cap — a generous limit tolerates a customer re-downloading on a
    // new device without feeling punitive, while still discouraging casual
    // key-sharing. Adjust freely, or remove this block entirely if you'd
    // rather not cap reuse at all.
    const USAGE_LIMIT = 5;
    if (!isTest && data.uses > USAGE_LIMIT) {
      return new Response(JSON.stringify({ valid: false, reason: "This license key has reached its usage limit." }), {
        status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({ valid: true, email: data.purchase?.email || null }), {
      status: 200, headers: { "Content-Type": "application/json", ...corsHeaders }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message || "Verification failed" }), {
      status: 500, headers: { "Content-Type": "application/json", ...corsHeaders }
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
