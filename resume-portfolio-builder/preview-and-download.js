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

const TEMPLATES_BASE = 'templates';

let manifestsCache = null;

async function getManifests() {
  if (manifestsCache) return manifestsCache;
  const res = await fetch(`${TEMPLATES_BASE}/manifests.json`);
  manifestsCache = await res.json();
  return manifestsCache;
}

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

  // --- FIX 1: Strip photo from data sent to iframe ---
  // Large base64 strings passed through postMessage → JSON.stringify →
  // new Response → .json() can silently fail inside the sandboxed iframe.
  // We strip the photo out, send clean data first so the template renders
  // normally, then send the photo as a separate postMessage after the
  // template confirms it has finished processing data.json — at which point
  // we swap the src directly on the already-rendered img element(s).
  let photoDataUri = '';
  let photoFieldPath = null;
  const dataForIframe = JSON.parse(JSON.stringify(dataObj));

  function extractPhoto(obj, path) {
    if (!obj || typeof obj !== 'object') return;
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? `${path}.${key}` : key;
      if (typeof value === 'string' && value.startsWith('data:image')) {
        photoDataUri = value;
        photoFieldPath = currentPath;
        obj[key] = 'assets/profile.jpg';
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

  if (window.__lastPreviewResizeObserver) {
    window.__lastPreviewResizeObserver.disconnect();
    window.__lastPreviewResizeObserver = null;
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
        // Patch IntersectionObserver so scroll-triggered reveal animations
        // fire immediately in the preview iframe instead of staying hidden.
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

          // Main data payload (photo stripped out — see parent for why)
          if (event.data.__previewData) {
            resolveData(event.data.__previewData);
          }

          // Photo arrives as a separate message after template confirms render.
          // At this point img elements already exist in the DOM with
          // src="assets/profile.jpg" so we can swap safely.
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

        // Intercept fetch('data.json') and serve from postMessage payload.
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

        // Forward runtime errors to the parent — they won't show in the
        // browser console normally once allow-same-origin is removed.
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

        // Tell the parent the template has processed data.json —
        // this is the trigger for the parent to send the photo.
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

  // --- FIX 2: Scale iframe to fit container instead of using a fixed width ---
  // Resume templates are built for ~960px. When the iframe is 100% of a
  // narrower panel column the template's layout collapses or clips content,
  // which looks identical to a blank/broken preview. Using CSS transform
  // scale we render at the intended width and shrink the whole thing to fit,
  // exactly like Figma/Framer previews do.
  const PREVIEW_CONTENT_WIDTH = 960;

  const iframe = document.createElement('iframe');
  iframe.style.width = PREVIEW_CONTENT_WIDTH + 'px';
  iframe.style.height = '700px';
  iframe.style.border = '1px solid #e2e2e2';
  iframe.style.borderRadius = '8px';
  iframe.style.transformOrigin = 'top left';
  iframe.style.display = 'block';
  // No allow-same-origin — combining it with allow-scripts is a known
  // sandbox escape. postMessage handles the data handoff without it.
  iframe.setAttribute('sandbox', 'allow-scripts allow-popups allow-forms');

  // Wrapper controls the visible footprint of the scaled iframe.
  // transform: scale() does not affect layout flow, so without an explicit
  // height on the wrapper the space below the iframe collapses to zero.
  const iframeWrapper = document.createElement('div');
  iframeWrapper.style.width = '100%';
  iframeWrapper.style.overflow = 'hidden';
  iframeWrapper.style.borderRadius = '8px';
  iframeWrapper.style.position = 'relative';

  function scaleIframe() {
    const wrapperWidth = iframeWrapper.offsetWidth;
    if (!wrapperWidth) return;
    const scale = wrapperWidth / PREVIEW_CONTENT_WIDTH;
    iframe.style.transform = `scale(${scale})`;
    iframeWrapper.style.height = (700 * scale) + 'px';
  }

  // Scale whenever the wrapper changes size (panel resize, window resize,
  // browser zoom, sidebar open/close, etc.)
  const ro = new ResizeObserver(() => scaleIframe());
  ro.observe(iframeWrapper);
  window.__lastPreviewResizeObserver = ro;

  let receivedConfirmation = false;

  const messageListener = (event) => {
    if (!event.data) return;

    if (event.data.__previewError) {
      previewStatus.textContent = 'Preview error (inside template): ' + event.data.__previewError;
      previewStatus.className = 'status error';

    } else if (event.data.__previewDataReceived) {
      receivedConfirmation = true;
      previewStatus.textContent = 'Preview ready.';

      // Send photo only AFTER the template confirms it rendered its data.
      // The 300 ms delay lets the template's render loop finish painting
      // before we mutate img.src values.
      if (photoDataUri) {
        setTimeout(() => {
          iframe.contentWindow.postMessage({
            __previewPhoto: {
              src: photoDataUri,
              field: photoFieldPath
            }
          }, '*');
        }, 300);
      }
    }
  };
  window.addEventListener('message', messageListener);
  window.__lastPreviewMessageListener = messageListener;

  iframe.addEventListener('load', () => {
    scaleIframe(); // set correct scale as soon as iframe is in the DOM
    iframe.contentWindow.postMessage({ __previewData: dataForIframe }, '*');
    setTimeout(() => {
      if (!receivedConfirmation) {
        previewStatus.textContent = 'Preview loaded, but the template never requested the data — it may use a different loading method than expected. The page shown may be using placeholder content.';
      }
    }, 4000);
  });

  iframe.src = htmlBlobUrl;
  iframeWrapper.appendChild(iframe);
  previewContainer.innerHTML = '';
  previewContainer.appendChild(iframeWrapper);
  previewStatus.textContent = 'Loading preview...';
}

// --- FULL SITE DOWNLOAD (.zip) -----------------------------------------
// No photo fix needed here — JSZip writes data.json as a plain file,
// not through a Response/JSON.parse chain, so large base64 strings are fine.

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

  // Write the full dataObj including the base64 photo — this is intentional.
  // The downloaded site reads data.json from disk, not through a Response chain.
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

document.getElementById('previewBtn')?.addEventListener('click', () => {
  if (!lastResult) { alert('Generate first.'); return; }
  renderPreview(lastResult);
});
document.getElementById('downloadSiteBtn')?.addEventListener('click', () => {
  if (!lastResult) { alert('Generate first.'); return; }
  downloadFullSite(lastResult);
});
