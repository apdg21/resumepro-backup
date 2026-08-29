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

  It adds two things to the page automatically: a live preview (opens in a
  full-screen modal) and a "Download full site (.zip)" button, both driven
  by TEMPLATES_BASE + manifests.json.

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

function mergeProfilePhoto(generatedData, originalTemplateSchema, photoDataUri) {
  if (!photoDataUri) return generatedData;
  const imagePath = findProfileImagePath(originalTemplateSchema);
  if (!imagePath) return generatedData;
  setPathGeneric(generatedData, imagePath, photoDataUri);
  return generatedData;
}

function templateKey() {
  const cat = (typeof categorySelect !== 'undefined' && categorySelect)
    ? (categorySelect.value === 'resume_templates' ? 'resume' : 'portfolio')
    : 'resume';
  const style = templateSelect.value;
  return `${cat}/${style}`;
}

// --- MODAL SCAFFOLDING ---------------------------------------------------
// Built once, reused for every preview. Sits outside the normal page flow
// (position:fixed, full viewport) so it's never constrained by the
// surrounding page's grid/column layout — that's what actually fixes the
// overflow/squeeze problem, rather than tuning pixel widths.
let modalEls = null;

function ensurePreviewModal() {
  if (modalEls) return modalEls;

  const overlay = document.createElement('div');
  overlay.id = 'previewModalOverlay';
  overlay.style.cssText = `
    display: none;
    position: fixed;
    inset: 0;
    background: rgba(15, 23, 42, 0.6);
    z-index: 9999;
    align-items: center;
    justify-content: center;
    padding: 24px;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background: white;
    border-radius: 12px;
    width: 100%;
    max-width: 1260px;
    height: 90vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
  `;

  const header = document.createElement('div');
  header.style.cssText = `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    border-bottom: 1px solid #e2e2e2;
    flex-shrink: 0;
  `;

  const title = document.createElement('div');
  title.id = 'previewModalStatus';
  title.style.cssText = 'font-size: 13px; color: #6b7280; flex: 1; min-width: 0; margin-right: 12px; overflow-wrap: break-word;';
  title.textContent = 'Loading preview...';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.textContent = '✕ Close';
  closeBtn.style.cssText = `
    background: #e5e7eb;
    border: none;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    flex-shrink: 0;
  `;
  closeBtn.addEventListener('click', closePreviewModal);

  header.appendChild(title);
  header.appendChild(closeBtn);

  const iframeWrap = document.createElement('div');
  iframeWrap.style.cssText = 'flex: 1; overflow: auto; background: #f5f5f5;';

  box.appendChild(header);
  box.appendChild(iframeWrap);
  overlay.appendChild(box);

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closePreviewModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.style.display !== 'none') closePreviewModal();
  });

  document.body.appendChild(overlay);

  modalEls = { overlay, iframeWrap, title };
  return modalEls;
}

function closePreviewModal() {
  if (!modalEls) return;
  modalEls.overlay.style.display = 'none';
  modalEls.iframeWrap.innerHTML = '';
  if (window.__lastPreviewBlobUrls) {
    window.__lastPreviewBlobUrls.forEach(u => URL.revokeObjectURL(u));
    window.__lastPreviewBlobUrls = [];
  }
  if (window.__lastPreviewMessageListener) {
    window.removeEventListener('message', window.__lastPreviewMessageListener);
    window.__lastPreviewMessageListener = null;
  }
}

// --- LIVE PREVIEW (opens in modal) --------------------------------------

async function renderPreview(dataObj) {
  const key = templateKey();
  const manifests = await getManifests();
  const { overlay, iframeWrap, title } = ensurePreviewModal();

  const externalStatus = document.getElementById('previewStatus');

  if (!manifests[key]) {
    const msg = `No bundled template files yet for "${key}" — only JSON output is available for this style.`;
    if (externalStatus) externalStatus.textContent = msg;
    return;
  }

  overlay.style.display = 'flex';
  title.textContent = 'Loading preview...';
  iframeWrap.innerHTML = '';
  if (externalStatus) externalStatus.textContent = '';

  // Photo is stripped out and sent as a separate, later postMessage — see
  // the injected script below for why (avoids a large base64 string
  // travelling through the fetch/Response/JSON chain on first paint).
  let photoDataUri = '';
  let photoFieldPath = null;
  const dataForIframe = JSON.parse(JSON.stringify(dataObj));

  function extractPhoto(obj, path) {
    if (!obj || typeof obj !== 'object') return;
    for (const [k, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${k}` : k;
      if (typeof value === 'string' && value.startsWith('data:image')) {
        photoDataUri = value;
        photoFieldPath = currentPath;
        obj[k] = 'assets/profile.jpg';
        return;
      }
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        extractPhoto(value, currentPath);
        if (photoDataUri) return;
      }
    }
  }
  extractPhoto(dataForIframe, '');

  const indexUrl = `${TEMPLATES_BASE}/${key}/index.html`;
  const htmlRes = await fetch(indexUrl);
  let html = await htmlRes.text();

  if (window.__lastPreviewBlobUrls) {
    window.__lastPreviewBlobUrls.forEach(u => URL.revokeObjectURL(u));
  }
  window.__lastPreviewBlobUrls = [];

  if (window.__lastPreviewMessageListener) {
    window.removeEventListener('message', window.__lastPreviewMessageListener);
  }

  const absoluteTemplateBase = new URL(`${TEMPLATES_BASE}/${key}/`, window.location.href).href;

  const injection = `
    <base href="${absoluteTemplateBase}">
    <style>
      img[src^="data:image"] {
        max-width: 100% !important;
        max-height: 400px !important;
        object-fit: cover !important;
      }
    </style>
    <script>
      (function() {
        var RealIntersectionObserver = window.IntersectionObserver;
        window.IntersectionObserver = function(callback, options) {
          var realObserver = new RealIntersectionObserver(callback, options);
          var patchedObserve = realObserver.observe.bind(realObserver);
          realObserver.observe = function(target) {
            patchedObserve(target);
            setTimeout(function() {
              callback([{ target: target, isIntersecting: true, intersectionRatio: 1 }], realObserver);
            }, 0);
          };
          return realObserver;
        };

        var resolveData;
        var dataPromise = new Promise(function(resolve) { resolveData = resolve; });

        window.addEventListener('message', function(event) {
          if (!event.data) return;
          if (event.data.__previewData) {
            resolveData(event.data.__previewData);
          }
          if (event.data.__previewPhoto) {
            var photoSrc = event.data.__previewPhoto.src;
            document.querySelectorAll('img').forEach(function(img) {
              if (
                img.getAttribute('src') === 'assets/profile.jpg' ||
                img.src.indexOf('assets/profile.jpg') !== -1
              ) {
                img.src = photoSrc;
              }
            });
          }
        });

        var realFetch = window.fetch;
        window.fetch = function(input, init) {
          var url = typeof input === 'string' ? input : (input && input.url) || '';
          if (url.indexOf('data.json') !== -1) {
            return dataPromise.then(function(data) {
              return new Response(JSON.stringify(data), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
            });
          }
          return realFetch.apply(this, arguments);
        };

        window.addEventListener('error', function(e) {
          window.parent.postMessage({
            __previewError: (e.error && e.error.stack) || e.message || 'Unknown error in preview'
          }, '*');
        });
        window.addEventListener('unhandledrejection', function(e) {
          window.parent.postMessage({
            __previewError: 'Unhandled promise rejection: ' + (e.reason && (e.reason.stack || e.reason.message || e.reason))
          }, '*');
        });

        dataPromise.then(function() {
          window.parent.postMessage({ __previewDataReceived: true }, '*');
        });
      })();
    </script>
  `;

  html = html.replace(/<head>/i, `<head>${injection}`);

  const htmlBlob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const htmlBlobUrl = URL.createObjectURL(htmlBlob);
  window.__lastPreviewBlobUrls.push(htmlBlobUrl);

  const iframe = document.createElement('iframe');
  // Fixed, generous pixel dimensions rather than percentage — the modal
  // itself already provides the room; this avoids relying on percentage
  // sizing resolving correctly on first paint inside a freshly-inserted,
  // dynamically-created container.
  iframe.style.cssText = 'width: 100%; height: 100%; border: none; display: block;';
  iframe.setAttribute('sandbox', 'allow-scripts allow-popups allow-forms');

  let receivedConfirmation = false;
  const messageListener = (event) => {
    if (!event.data) return;

    if (event.data.__previewError) {
      title.textContent = 'Preview error (inside template): ' + event.data.__previewError;
      title.style.color = '#dc2626';
    } else if (event.data.__previewDataReceived) {
      receivedConfirmation = true;
      title.textContent = 'Preview ready.';
      title.style.color = '#6b7280';

      if (photoDataUri) {
        setTimeout(() => {
          iframe.contentWindow.postMessage({
            __previewPhoto: { src: photoDataUri, field: photoFieldPath }
          }, '*');
        }, 300);
      }
    }
  };
  window.addEventListener('message', messageListener);
  window.__lastPreviewMessageListener = messageListener;

  iframe.addEventListener('load', () => {
    iframe.contentWindow.postMessage({ __previewData: dataForIframe }, '*');
    setTimeout(() => {
      if (!receivedConfirmation) {
        title.textContent = 'Preview loaded, but the template never requested the data — it may use a different loading method than expected.';
      }
    }, 4000);
  });

  iframe.src = htmlBlobUrl;
  iframeWrap.appendChild(iframe);
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
  if (downloadStatus) downloadStatus.textContent = 'Packaging your site...';

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

  zip.file('data.json', JSON.stringify(dataObj, null, 2));

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${key.replace('/', '-')}-site.zip`;
  a.click();
  URL.revokeObjectURL(url);

  if (downloadStatus) downloadStatus.textContent = 'Downloaded — unzip and open index.html, or host the folder anywhere.';
}

// Wire these up to buttons in your existing page:
//   <button id="previewBtn">Live preview</button>
//   <button id="downloadSiteBtn">Download full site (.zip)</button>
//   <div id="previewStatus"></div>
document.getElementById('previewBtn')?.addEventListener('click', () => {
  if (!lastResult) { alert('Generate first.'); return; }
  renderPreview(lastResult);
});
document.getElementById('downloadSiteBtn')?.addEventListener('click', () => {
  if (!lastResult) { alert('Generate first.'); return; }
  downloadFullSite(lastResult);
});
