/*
  ADD-ON MODULE: preview + full-site download
  ---------------------------------------------
  Drop this <script> block into your existing resume-portfolio-builder/index.html,
  after your existing generate.js logic (i.e. after `lastResult` gets set from
  the /api/generate response). It expects these globals to already exist from
  your current page:
    - lastResult        (the filled data.json object returned by /api/generate)
    - categorySelect     (the <select> for resume/portfolio)
    - templateSelect     (the <select> for style1..style20 etc.)

  It adds two things to the page automatically: a live <iframe> preview and a
  "Download full site (.zip)" button, both driven by TEMPLATES_BASE + manifests.json.

  IMPORTANT: templates only exist for combos present in
  /templates/manifests.json. Right now that's resume/style1 and
  portfolio/style1 — see README for how to add the rest.
*/

const TEMPLATES_BASE = '/templates'; // absolute path — works no matter where index.html lives

let manifestsCache = null;

async function getManifests() {
  if (manifestsCache) return manifestsCache;
  const res = await fetch(`${TEMPLATES_BASE}/manifests.json`);
  manifestsCache = await res.json();
  return manifestsCache;
}

function templateKey() {
  const cat = categorySelect.value === 'resume_templates' ? 'resume' : 'portfolio';
  const style = templateSelect.value; // e.g. "style1"
  return `${cat}/${style}`;
}

// --- LIVE PREVIEW -----------------------------------------------------

async function renderPreview(dataObj) {
  const key = templateKey();
  const manifests = await getManifests();

  const previewContainer = document.getElementById('previewContainer');
  const previewStatus = document.getElementById('previewStatus');

  if (!manifests[key]) {
    previewStatus.textContent = `No bundled template files yet for "${key}" — only JSON output is available for this style. See README to add its real files.`;
    previewContainer.innerHTML = '';
    return;
  }

  previewStatus.textContent = 'Loading preview...';

  const indexUrl = `${TEMPLATES_BASE}/${key}/index.html`;
  const htmlRes = await fetch(indexUrl);
  let html = await htmlRes.text();

  // Inject <base> so relative CSS/JS/asset links resolve to the real hosted
  // template files, and inject a fetch-override so the template's own
  // `fetch('data.json')` (or similar) call receives OUR generated data
  // instead of hitting the network. This works regardless of how each
  // individual template's main.js is written internally.
  const injection = `
    <base href="${TEMPLATES_BASE}/${key}/">
    <script>
      (function() {
        const GENERATED_DATA = ${JSON.stringify(dataObj)};
        const realFetch = window.fetch;
        window.fetch = function(input, init) {
          const url = typeof input === 'string' ? input : (input && input.url) || '';
          if (url.includes('data.json')) {
            return Promise.resolve(new Response(JSON.stringify(GENERATED_DATA), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }));
          }
          return realFetch.apply(this, arguments);
        };
      })();
    </script>
  `;

  html = html.replace(/<head>/i, `<head>${injection}`);

  const iframe = document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '700px';
  iframe.style.border = '1px solid #e2e2e2';
  iframe.style.borderRadius = '8px';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');
  iframe.srcdoc = html;

  previewContainer.innerHTML = '';
  previewContainer.appendChild(iframe);
  previewStatus.textContent = 'Preview ready.';
}

// --- FULL SITE DOWNLOAD (.zip) -----------------------------------------

async function downloadFullSite(dataObj) {
  const key = templateKey();
  const manifests = await getManifests();

  if (!manifests[key]) {
    alert(`No bundled template files yet for "${key}". This style only supports JSON download right now.`);
    return;
  }

  const downloadStatus = document.getElementById('previewStatus');
  downloadStatus.textContent = 'Packaging your site...';

  const zip = new JSZip();
  const files = manifests[key];

  await Promise.all(files.map(async (relPath) => {
    const url = `${TEMPLATES_BASE}/${key}/${relPath}`;
    const res = await fetch(url);
    if (relPath.match(/\.(jpg|jpeg|png|gif|webp|ico)$/i)) {
      zip.file(relPath, await res.blob());
    } else {
      zip.file(relPath, await res.text());
    }
  }));

  // Overwrite with the generated data — this is the one file NOT copied verbatim
  zip.file('data.json', JSON.stringify(dataObj, null, 2));

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${key.replace('/', '-')}-site.zip`;
  a.click();
  URL.revokeObjectURL(url);

  downloadStatus.textContent = 'Downloaded — unzip and open index.html, or host the folder anywhere.';
}

// Wire these up to buttons in your existing page:
//   <button id="previewBtn">Live preview</button>
//   <button id="downloadSiteBtn">Download full site (.zip)</button>
//   <div id="previewStatus"></div>
//   <div id="previewContainer"></div>
document.getElementById('previewBtn')?.addEventListener('click', () => {
  if (!lastResult) { alert('Generate first.'); return; }
  renderPreview(lastResult);
});
document.getElementById('downloadSiteBtn')?.addEventListener('click', () => {
  if (!lastResult) { alert('Generate first.'); return; }
  downloadFullSite(lastResult);
});
