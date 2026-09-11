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

// --- LICENSE GATE -------------------------------------------------------
// Gates downloads (not preview) behind a valid Gumroad license key. Two
// paths to unlock:
//   1. Automatic — Gumroad's post-purchase redirect appends ?license_key=...
//      to the URL. Detected and verified silently on page load.
//   2. Manual fallback — a small modal with an input field, for anyone
//      returning later without that URL (using the key from their Gumroad
//      receipt email instead).
// Once verified, unlocked for the rest of the page visit — no re-prompting
// per download.

window.__licenseVerified = false;
window.__licenseVerifiedTemplate = null; // which template the current __licenseVerified=true actually covers
window.__licenseEmail = null;

// Each gated style has its OWN Gumroad product, so it needs its own checkout
// link too -- mirrors PRODUCT_ID_ENV_BY_TEMPLATE on the backend. Add a line
// here every time a new style gets its own product.
const CHECKOUT_URL_BY_TEMPLATE = {
  "resume/style1": "https://resumeprotemplate.gumroad.com/l/generated-resume-timeless",
"resume/style4": "https://resumeprotemplate.gumroad.com/l/generated-resume-vivid",
"resume/style2": "https://resumeprotemplate.gumroad.com/l/generated-resume-sleek",
"resume/style3": "https://resumeprotemplate.gumroad.com/l/generated-resume-executive",
"resume/style5": "https://resumeprotemplate.gumroad.com/l/generated-resume-pure",
"resume/style6": "https://resumeprotemplate.gumroad.com/l/generated-resume-refined",
"resume/style7": "https://resumeprotemplate.gumroad.com/l/generated-resume-dynamic",
"resume/style8": "https://resumeprotemplate.gumroad.com/l/generated-resume-skillfocus",
"resume/style9": "https://resumeprotemplate.gumroad.com/l/generated-resume-corporate",
"resume/style10": "https://resumeprotemplate.gumroad.com/l/generated-resume-trendy",
"resume/style11": "https://resumeprotemplate.gumroad.com/l/generated-resume-horizon",
"resume/style12": "https://resumeprotemplate.gumroad.com/l/generated-resume-midnight",
"resume/style13": "https://resumeprotemplate.gumroad.com/l/generated-resume-ember",
};
const DEFAULT_CHECKOUT_URL = "https://resumeprotemplate.gumroad.com/l/generated-resume";

// NOTE: requireLicense() below checks window.__licenseVerifiedTemplate
// against the currently selected template before skipping re-verification.
// This still matters with one-Gumroad-product-per-template, because it's
// what triggers a fresh /api/verify-license call (and therefore a fresh
// check against the correct per-template product) whenever someone switches
// templates mid-session -- without it, a session that unlocked "modern"
// would never re-ask the server after switching to "classic".
async function verifyLicenseKey(key) {
  try {
    const currentTemplate = templateKey();
    const res = await fetch('/api/verify-license', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ licenseKey: key, templateKey: currentTemplate })
    });
    const result = await res.json();
    if (result.valid) {
      window.__licenseVerified = true;
      window.__licenseVerifiedTemplate = currentTemplate;
      window.__licenseEmail = result.email || null;
    }
    // surface server-side errors distinctly instead of masking them as "invalid key"
    if (result.error && !result.reason) {
      result.reason = `Server error: ${result.error}`;
    }
    return result;
  } catch (err) {
    return { valid: false, reason: 'Could not reach the verification server. Check your connection and try again.' };
  }
}

let licenseModalEls = null;
let pendingAfterVerify = null;

function ensureLicenseModal() {
  if (licenseModalEls) return licenseModalEls;

  const overlay = document.createElement('div');
  overlay.style.cssText = `
    display: none; position: fixed; inset: 0; background: rgba(15,23,42,0.6);
    z-index: 10000; align-items: center; justify-content: center; padding: 24px;
  `;

  const box = document.createElement('div');
  box.style.cssText = `
    background: var(--card, white); border-radius: 14px; width: 100%; max-width: 420px;
    padding: 28px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); font-family: var(--font-body, inherit);
  `;

  const heading = document.createElement('div');
  heading.style.cssText = 'font-family: var(--font-display, inherit); font-size: 18px; font-weight: 700; color: var(--ink, #1B2333); margin-bottom: 6px;';
  heading.textContent = 'Unlock your download';

  const sub = document.createElement('div');
  sub.style.cssText = 'font-size: 13px; color: var(--ink-soft, #6b7280); margin-bottom: 16px; line-height: 1.5;';
  sub.innerHTML = 'Enter the license key from your purchase receipt email. Don\'t have one yet? <a href="https://resumeprotemplate.gumroad.com/l/generated-resume" id="licenseGumroadLink" style="color: var(--primary, #2952E3); font-weight: 600;" target="_blank" rel="noopener">Buy on Gumroad →</a>';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'e.g. A1B2C3D4-E5F6G7H8-...';
  input.style.cssText = 'width: 100%; padding: 10px 12px; border: 1px solid var(--border, #e2e2e2); border-radius: 8px; font-size: 14px; margin-bottom: 10px; box-sizing: border-box;';

  const status = document.createElement('div');
  status.style.cssText = 'font-size: 13px; margin-bottom: 12px; min-height: 18px;';

  const unlockBtn = document.createElement('button');
  unlockBtn.type = 'button';
  unlockBtn.textContent = 'Unlock download';
  unlockBtn.style.cssText = 'width: 100%; background: var(--primary, #2952E3); color: white; border: none; padding: 11px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer;';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.cssText = 'width: 100%; background: transparent; color: var(--ink-soft, #6b7280); border: none; padding: 8px; font-size: 13px; cursor: pointer; margin-top: 6px;';
  cancelBtn.addEventListener('click', () => { overlay.style.display = 'none'; pendingAfterVerify = null; });

  unlockBtn.addEventListener('click', async () => {
    const key = input.value.trim();
    if (!key) { status.textContent = 'Enter a license key first.'; status.style.color = '#C0392B'; return; }
    unlockBtn.disabled = true;
    status.textContent = 'Checking...';
    status.style.color = 'var(--ink-soft, #6b7280)';

    const result = await verifyLicenseKey(key);
    unlockBtn.disabled = false;

    if (result.valid) {
      status.textContent = 'Unlocked!';
      status.style.color = '#1E8E5A';
      setTimeout(() => {
        overlay.style.display = 'none';
        if (pendingAfterVerify) { pendingAfterVerify(); pendingAfterVerify = null; }
      }, 400);
    } else {
      status.textContent = result.reason || 'Invalid license key.';
      status.style.color = '#C0392B';
    }
  });

  box.appendChild(heading);
  box.appendChild(sub);
  box.appendChild(input);
  box.appendChild(status);
  box.appendChild(unlockBtn);
  box.appendChild(cancelBtn);
  overlay.appendChild(box);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) overlay.style.display = 'none'; });
  document.body.appendChild(overlay);

  licenseModalEls = { overlay, input, status, gumroadLink: sub.querySelector('#licenseGumroadLink') };
  return licenseModalEls;
}

// Call as requireLicense(() => { ...actual download logic... }). Three paths:
//   1. Already verified this visit -> run immediately.
//   2. A key arrived via Gumroad's redirect URL but hasn't been verified yet
//      -> verify it NOW, using the template the user has actually selected
//      at this moment (not whatever was selected on page load, which may
//      have been the default). This is why the URL-check below stores the
//      key rather than verifying it immediately on load.
//   3. Neither -> show the manual entry modal.
function requireLicense(onVerified) {
  // Only skip re-verification if we already unlocked THIS SAME template.
  // Switching the template dropdown means a different template is now being
  // requested, which the backend needs to re-check against the one-key-one-
  // template lock -- a prior success for a different template doesn't count.
  if (window.__licenseVerified && window.__licenseVerifiedTemplate === templateKey()) {
    onVerified();
    return;
  }

  if (window.__pendingUrlLicenseKey) {
    const key = window.__pendingUrlLicenseKey;
    verifyLicenseKey(key).then(result => {
      if (result.valid) {
        onVerified();
      } else {
        // The URL-provided key didn't work for this template (e.g. it's
        // already locked to a different one) — fall back to the manual
        // modal so the person can see why and decide what to do.
        window.__pendingUrlLicenseKey = null;
        showLicenseModal(onVerified, result.reason);
      }
    });
    return;
  }

  showLicenseModal(onVerified);
}

function showLicenseModal(onVerified, prefilledError) {
  const { overlay, input, status, gumroadLink } = ensureLicenseModal();
  status.textContent = prefilledError || '';
  status.style.color = '#C0392B';
  input.value = '';
  pendingAfterVerify = onVerified;
  if (gumroadLink) {
    gumroadLink.href = CHECKOUT_URL_BY_TEMPLATE[templateKey()] || DEFAULT_CHECKOUT_URL;
  }
  overlay.style.display = 'flex';
  input.focus();
}

// Automatic path: Gumroad's post-purchase redirect can append
// ?license_key=... to the URL. The key is stored for use at the actual
// moment of download (see requireLicense above) rather than verified here
// immediately — verifying now would lock it to whatever template happens
// to be selected by default on page load, before the customer has actually
// chosen what they want. The URL itself is still cleaned up right away so
// the key doesn't linger visibly in the address bar or browser history.
(function checkUrlForLicenseKey() {
  const params = new URLSearchParams(window.location.search);
  const keyFromUrl = params.get('license_key');
  if (keyFromUrl) {
    window.__pendingUrlLicenseKey = keyFromUrl;
    params.delete('license_key');
    const cleanUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', cleanUrl);
  }
})();


// Wire these up to buttons in your existing page:
//   <button id="previewBtn">Live preview</button>
//   <button id="downloadSiteBtn">Download full site (.zip)</button>
//   <div id="previewStatus"></div>
document.getElementById('previewBtn')?.addEventListener('click', () => {
  if (!lastResult) { alert('Generate first.'); return; }
  renderPreview(lastResult); // preview stays free, no license check
});
document.getElementById('downloadSiteBtn')?.addEventListener('click', () => {
  if (!lastResult) { alert('Generate first.'); return; }
  requireLicense(() => downloadFullSite(lastResult));
});
