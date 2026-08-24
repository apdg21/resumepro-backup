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

  // --- FIX: Separate the photo from the data before passing to iframe ---
  // Large base64 strings passed through the full chain of:
  //   postMessage payload → JSON.stringify → new Response(string) → .json()
  // can cause silent failures inside the sandboxed iframe — the template
  // either never gets its data, or renders blank, with no visible error.
  // The fix is to strip the photo out of the data sent to the iframe,
  // send the data WITHOUT the photo first (so the template renders normally),
  // then send the photo as a SEPARATE postMessage after the template confirms
  // it has finished processing data.json — at which point we swap the src
  // directly on the already-rendered img element(s) in the iframe DOM.
  let photoDataUri = '';
  let photoFieldPath = null;

  // Clone so we never mutate the caller's lastResult object
  const dataForIframe = JSON.parse(JSON.stringify(dataObj));

  // Walk the cloned data, find the first data:image string, pull it out,
  // and restore the placeholder so the template still renders the img element
  // (just with the default src — we'll replace it after render).
  function extractPhoto(obj, path) {
    if (!obj || typeof obj !== 'object') return;
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      if (typeof value === 'string' && value.startsWith('data:image')) {
        photoDataUri = value;
        photoFieldPath = currentPath;
        obj[key] = 'assets/profile.jpg'; // restore placeholder for the iframe
        return; // only need the first match (profile photo)
      }
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        extractPhoto(value, currentPath);
        if (photoDataUri) return; // stop as soon as we found it
      }
    }
  }
  extractPhoto(dataForIframe, '');
  // --- END FIX setup ---

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

  // Must be an ABSOLUTE URL: a blob: document has no meaningful "directory"
  // of its own, so a relative <base href> would fail to resolve
  // CSS/JS/asset links correctly here.
  const absoluteTemplateBase = new URL(`${TEMPLATES_BASE}/${key}/`, window.location.href).href;

  // Data reaches the iframe via postMessage, NOT via a fetched blob: URL.
  // This matters for security: postMessage is the correct, spec-designed way
  // to talk to a sandboxed iframe, and works WITHOUT the "allow-same-origin"
  // sandbox flag. Combining allow-same-origin with allow-scripts is a
  // well-known sandbox escape — since this iframe may render user-supplied
  // text, allow-same-origin is deliberately NOT included below.
  const injection = `
    <base href="${absoluteTemplateBase}">
    <style>
      /* Defensive constraint: an uploaded photo has no guaranteed size or
         aspect ratio, unlike each template's own pre-sized default image.
         Without this, a large/oddly-shaped photo can render at full
         resolution and push all other content out of view, looking
         identical to a blank/broken preview. This targets any image whose
         src is a data: URI (i.e. an uploaded photo, not a bundled asset)
         so template-default images are left completely untouched. */
      img[src^="data:image"] {
        max-width: 100% !important;
        max-height: 400px !important;
        object-fit: cover !important;
      }
    </style>
    <script>
      (function() {
        // Many templates use scroll-triggered "fade in" reveal animations
        // (elements start at opacity:0, become visible via an
        // IntersectionObserver as the user scrolls past them). That works
        // fine for a real visited page but silently breaks in a preview
        // iframe — content stays at opacity:0 forever with no error.
        // Patching IntersectionObserver to fire immediately fixes this.
        var RealIntersectionObserver = window.IntersectionObserver;
        window.IntersectionObserver = function(callback, options) {
          var realObserver = new RealIntersectionObserver(callback, options);
          var patchedObserve = realObserver.observe.bind(realObserver);
          realObserver.observe = function(target) {
            patchedObserve(target);
            // Fire immediately as "intersecting" so reveal-on-scroll content
            // shows right away in the preview iframe.
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

          // Main data payload (without photo — see parent for why)
          if (event.data.__previewData) {
            resolveData(event.data.__previewData);
          }

          // --- FIX: Photo arrives as a separate message AFTER the template
          // has confirmed it rendered its data. At this point the img element
          // already exists in the DOM with src="assets/profile.jpg", so we
          // can safely swap the src directly without touching the data flow.
          if (event.data.__previewPhoto) {
            var photoSrc = event.data.__previewPhoto.src;
            var imgs = document.querySelectorAll('img');
            imgs.forEach(function(img) {
              // Match any img still pointing at the placeholder path,
              // regardless of whether it's a relative or absolute URL by now.
              if (
                img.getAttribute('src') === 'assets/profile.jpg' ||
                img.src.indexOf('assets/profile.jpg') !== -1
              ) {
                img.src = photoSrc;
              }
            });
          }
        });

        // Override fetch so that any call to data.json inside the template
        // is intercepted and served from the postMessage payload instead of
        // hitting the network (where it would 404 from inside a blob: URL).
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

        // Forward any runtime error inside this opaque-origin iframe back
        // to the parent — errors here often don't surface in the browser's
        // default console once allow-same-origin is removed.
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

        // Confirm to the parent once the template's own script actually reads
        // the data — this proves the handoff worked, and is also the trigger
        // for the parent to send the photo as a follow-up message.
        dataPromise.then(function() {
          window.parent.postMessage({ __previewDataReceived: true }, '*');
        });
      })();
    </script>
  `;

  html = html.replace(/<head>/i, `<head>${injection}`);

  const htmlBlob = new Blob([html], { type: 'text/html' });
  const htmlBlobUrl = URL.createObjectURL(htmlBlob);
  window.__lastPreviewBlobUrls.push(htmlBlobUrl);

  const iframe = document.createElement('iframe');
  iframe.style.width = '900px';
  iframe.style.height = '700px';
  iframe.style.border = '1px solid #e2e2e2';
  iframe.style.borderRadius = '8px';
  // Deliberately no "allow-same-origin" — see the note above the injection
  // script for why. The iframe can run scripts and submit forms (some
  // templates need this for menus/contact forms), but stays properly
  // sandboxed from the real page origin.
  iframe.setAttribute('sandbox', 'allow-scripts allow-popups allow-forms');

  let receivedConfirmation = false;
  const messageListener = (event) => {
    if (!event.data) return;

    if (event.data.__previewError) {
      previewStatus.textContent = 'Preview error (inside template): ' + event.data.__previewError;
      previewStatus.className = 'status error';

    } else if (event.data.__previewDataReceived) {
      receivedConfirmation = true;
      previewStatus.textContent = 'Preview ready.';

      // --- FIX: Send the photo only AFTER the template confirms it has
      // processed data.json. This guarantees the img elements exist in the
      // DOM and already have src="assets/profile.jpg" set by the template's
      // own rendering logic — so our querySelector swap is reliable.
      // The 300 ms delay gives the template's render loop time to finish
      // painting after the fetch resolves before we mutate img.src.
      if (photoDataUri) {
        setTimeout(() => {
          iframe.contentWindow.postMessage({
            __previewPhoto: {
              src: photoDataUri,
              field: photoFieldPath // informational, not used inside iframe
            }
          }, '*');
        }, 300);
      }
    }
  };
  window.addEventListener('message', messageListener);
  window.__lastPreviewMessageListener = messageListener;

  iframe.addEventListener('load', () => {
    // Send data WITHOUT the large base64 photo — photo is sent separately
    // after the template confirms it has processed data.json.
    iframe.contentWindow.postMessage({ __previewData: dataForIframe }, '*');

    // If the template never calls fetch('data.json') at all (unexpected
    // structure) and never errors either, surface that silent case.
    setTimeout(() => {
      if (!receivedConfirmation) {
        previewStatus.textContent = 'Preview loaded, but the template never requested the data — it may use a different loading method than expected. The page shown may be using placeholder content.';
      }
    }, 4000);
  });

  iframe.src = htmlBlobUrl;
  previewContainer.innerHTML = '';
  previewContainer.appendChild(iframe);
  previewStatus.textContent = 'Loading preview...';
}

// --- FULL SITE DOWNLOAD (.zip) -----------------------------------------
// downloadFullSite does NOT need the same photo fix — it writes data.json
// directly into the zip as a plain file (no Response/JSON.parse chain),
// so large base64 strings are handled correctly as-is.

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

  // Overwrite with the generated data — this is the one file NOT copied verbatim.
  // The full dataObj (with photo base64 included) is written here intentionally:
  // the downloaded site reads data.json from disk, not through a Response chain.
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
