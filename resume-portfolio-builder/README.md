# Resume/Portfolio Builder — Cloudflare Pages prototype

## Structure
```
public/index.html              — frontend (calls your own /api/generate, no key exposed)
public/all_template_schemas.json — real data.json schemas for all 20 resume + 10 portfolio templates
functions/api/generate.js      — Cloudflare Pages Function; holds the Gemini key server-side
```

## Deploy

1. Install Wrangler if you don't have it:
   ```
   npm install -g wrangler
   ```

2. From this folder, log in and create the Pages project:
   ```
   wrangler login
   wrangler pages project create resume-builder
   ```

3. Set your Gemini key as a secret (never committed, never sent to the browser):
   ```
   wrangler pages secret put GEMINI_API_KEY
   ```
   Paste your free key from https://aistudio.google.com/apikey when prompted.

4. Deploy:
   ```
   wrangler pages deploy public
   ```

Your site will be live at `https://resume-builder.pages.dev` (or similar), and `/api/generate`
will work automatically — Cloudflare Pages Functions auto-route anything under `functions/`.

## Local development

```
echo "GEMINI_API_KEY=your_key_here" > .dev.vars
wrangler pages dev public
```

`.dev.vars` should be added to `.gitignore` — never commit real keys.

## Verify the model names

The frontend currently requests `gemini-3.5-flash` by default (`functions/api/generate.js`
has an `ALLOWED_MODELS` allowlist you can edit). Double-check the exact model id string in
your Google AI Studio dashboard before relying on this — Google sometimes uses suffixes like
`-preview` that don't show in the UI dropdown label.

## What's still a prototype vs. production-ready

- **Template rendering**: this currently only produces the filled `data.json`. To go from
  JSON → finished downloadable site, you still need to: copy the real template's folder,
  drop the generated `data.json` in, and zip it (or serve it) — that's a small additional
  step once you're ready, since the template's own `main.js`/`index.html`/`style.css`
  already know how to render from `data.json`.
- **Rate limiting / abuse protection**: there's currently no limit on how often `/api/generate`
  can be called. For a public prototype, worth adding at minimum a simple per-IP rate limit
  (Cloudflare has built-in tools for this) so your free-tier quota isn't burned by one bad actor.
- **Large file handling**: PDF/DOCX extraction happens fully in the browser (via pdf.js and
  mammoth.js) — nothing is uploaded to any server except the final extracted text, which keeps
  things simple and avoids needing file storage.
