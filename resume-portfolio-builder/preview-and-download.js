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

const TEMPLATES_BASE = 'templates'; // relative to this page's own location — works no matter what subfolder the site is served from

let manifestsCache = null;

async function getManifests() {
  if (manifestsCache) return manifestsCache;
  const res = await fetch(`${TEMPLATES_BASE}/manifests.json`);
  manifestsCache = await res.json();
  return manifestsCache;
}

// --- PROFILE PHOTO FIELD DETECTION -------------------------------------
// Every real template that supports a custom profile photo defaults that
// field to the exact literal "assets/profile.jpg" (confirmed across all 20
// resume templates). Decorative/hero images use a different filename, and
// reference-contact photos are external randomuser.me URLs — so matching
// this exact literal reliably finds ONLY the user's own profile photo field,
// never a hero image or a reference's stock avatar, without needing a
// hand-written mapping for every template.
function findProfileImagePath(schemaObj, path = '') {
  if (schemaObj && typeof schemaObj === 'object' && !Array.isArray(schemaObj)) {
    for (const [key, value] of Object.entries(schemaObj)) {
      const newPath = path ? `${path}.${key}` : key;
      if (typeof value === 'string' && value === 'assets/profile.jpg') {
        return newPath;
      }
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        const found = findProfileImagePath(value, newPath);
        if (found) return found;
      }
      // Deliberately does NOT recurse into arrays — this avoids ever
      // matching a reference's photo or a per-item project image.
    }
  }
  return null;
}

function setPathGeneric(obj, path, value) {
  const keys = path.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (cur[keys[i]] == null || typeof cur[keys[i]] !== 'object') cur[keys[i]] = {};
    cur = cur[keys[i]];
  }
  cur[keys[keys.length - 1]] = value;
}

/**
 * Merges an uploaded profile photo (as a data URI) into a generated data.json,
 * using the ORIGINAL template schema (with its default "assets/profile.jpg"
 * placeholder still intact) to find the correct field to overwrite.
 * Returns the same object with the photo merged in, or unchanged if the
 * template has no photo field, or if no photo was provided.
 */
function mergeProfilePhoto(generatedData, originalTemplateSchema, photoDataUri) {
  if (!photoDataUri) return generatedData;
  const imagePath = findProfileImagePath(originalTemplateSchema);
  if (!imagePath) return generatedData; // this template has no photo slot
  setPathGeneric(generatedData, imagePath, photoDataUri);
  return generatedData;
}

function templateKey() {
  // categorySelect only exists on the paste/upload page (resume vs portfolio
  // picker). resume-form.html has no category dropdown since it's resume-only
  // for now — fall back to 'resume' in that case rather than erroring.
  const cat = (typeof categorySelect !== 'undefined' && categorySelect)
    ? (categorySelect.value === 'resume_templates' ? 'resume' : 'portfolio')
    : 'resume';
  const style = templateSelect.value; // e.g. "style1"
  return `${cat}/${style}`;
}

// --- LIVE PREVIEW -----------------------------------------------------

// --- CONVERT EMBEDDED DATA-URI IMAGES TO SHORT BLOB URLS (preview only) ---
// A base64 data: URI for a photo can be 1-3MB of raw text sitting inline in
// the JSON. Some templates' own JS (aspect-ratio math, canvas operations,
// validation regexes) appears to handle a giant inline string inconsistently.
// A blob: URL is a ~60-character reference to the same image data, behaving
// like any other URL — much closer to what templates actually expect (their
// own default is a normal relative path like "assets/profile.jpg").
// This conversion is PREVIEW-ONLY: the object passed to downloadFullSite
// keeps the original self-contained data: URI, since blob: URLs are only
// valid within the browser tab that created them and would break once the
// downloaded file is opened later or on a different device.
async function convertDataUrisToBlobUrls(node) {
  if (typeof node === 'string' && node.startsWith('data:image/')) {
    const res = await fetch(node);
    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    window.__lastPreviewBlobUrls.push(blobUrl);
    return blobUrl;
  }
  if (Array.isArray(node)) {
    return Promise.all(node.map(convertDataUrisToBlobUrls));
  }
  if (node && typeof node === 'object') {
    const entries = await Promise.all(
      Object.entries(node).map(async ([k, v]) => [k, await convertDataUrisToBlobUrls(v)])
    );
    return Object.fromEntries(entries);
  }
  return node;
}

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

  // The generated data (which can be several MB once a photo is embedded)
  // is put into its own Blob and served via a blob: URL, rather than being
  // written directly into the HTML markup. Large inline <script> content
  // has proven unreliable via iframe.srcdoc in practice — a separate Blob
  // avoids that entirely, since the iframe just fetches it like any other
  // URL instead of the browser having to parse a multi-megabyte string as
  // part of the document itself.
  if (window.__lastPreviewBlobUrls) {
    window.__lastPreviewBlobUrls.forEach(u => URL.revokeObjectURL(u));
  }
  window.__lastPreviewBlobUrls = [];

  const previewData = await convertDataUrisToBlobUrls(dataObj);

  const dataBlob = new Blob([JSON.stringify(previewData)], { type: 'application/json' });
  const dataBlobUrl = URL.createObjectURL(dataBlob);
  window.__lastPreviewBlobUrls.push(dataBlobUrl);

  // Must be an ABSOLUTE URL: a blob: document has no meaningful "directory"
  // of its own, so a relative <base href> (which worked fine under the old
  // srcdoc approach, which inherits the parent page's location) would fail
  // to resolve CSS/JS/asset links correctly here.
  const absoluteTemplateBase = new URL(`${TEMPLATES_BASE}/${key}/`, window.location.href).href;

  // Small, fixed-size bootstrap script — never contains the large data
  // itself, just a pointer to the Blob above. This is injected so the
  // template's own `fetch('data.json')` (or similar) call receives our
  // generated data instead of hitting the network, regardless of how
  // each individual template's main.js is written internally.
  const injection = `
    <base href="${absoluteTemplateBase}">
    <script>
      (function() {
        var DATA_BLOB_URL = ${JSON.stringify(dataBlobUrl)};
        var realFetch = window.fetch;
        window.fetch = function(input, init) {
          var url = typeof input === 'string' ? input : (input && input.url) || '';
          if (url.indexOf('data.json') !== -1) {
            return realFetch(DATA_BLOB_URL);
          }
          return realFetch.apply(this, arguments);
        };
      })();
    </script>
  `;

  html = html.replace(/<head>/i, `<head>${injection}`);

  const htmlBlob = new Blob([html], { type: 'text/html' });
  const htmlBlobUrl = URL.createObjectURL(htmlBlob);
  window.__lastPreviewBlobUrls.push(htmlBlobUrl);

  const iframe = document.createElement('iframe');
  iframe.style.width = '100%';
  iframe.style.height = '700px';
  iframe.style.border = '1px solid #e2e2e2';
  iframe.style.borderRadius = '8px';
  iframe.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-popups allow-forms');
  iframe.src = htmlBlobUrl;

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
