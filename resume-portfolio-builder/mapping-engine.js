/*
  mapping-engine.js
  ------------------
  Deterministically transforms master-schema form data into a specific
  template's real data.json shape, using that template's mapping config.
  No AI involved in this step — it's pure, instant, and can never hallucinate,
  since it only ever moves/renames values that already exist.
*/

function getPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);
}

function setPath(obj, path, value) {
  const keys = path.split('.');
  let cur = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const k = keys[i];
    if (cur[k] == null || typeof cur[k] !== 'object') cur[k] = {};
    cur = cur[k];
  }
  cur[keys[keys.length - 1]] = value;
}

function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * @param {object} masterData - form data following the master schema
 * @param {object} originalTemplateData - the template's own default data.json
 *        (used as the base, so untouched fields like theme colors, footer
 *        boilerplate, etc. are preserved exactly as the template author wrote them)
 * @param {object} mapping - one entry from resume-mappings.json for this template
 * @returns {object} a new object in the template's exact schema shape
 */
function applyMapping(masterData, originalTemplateData, mapping) {
  const result = deepClone(originalTemplateData);

  // 1. Split-name handling (e.g. style11's personalInfo.firstName/lastName)
  if (mapping.splitName) {
    const full = (getPath(masterData, mapping.splitName.sourcePath) || '').trim();
    const parts = full.split(/\s+/);
    const firstName = parts[0] || '';
    const lastName = parts.slice(1).join(' ') || '';
    setPath(result, mapping.splitName.firstNameTarget, firstName);
    setPath(result, mapping.splitName.lastNameTarget, lastName);
  }

  // 2. Scalar field mapping
  if (mapping.scalar) {
    for (const [masterPath, targetPath] of Object.entries(mapping.scalar)) {
      if (masterPath.startsWith('_')) continue; // skip note/comment keys
      const value = getPath(masterData, masterPath);
      if (value !== undefined && value !== null && value !== '') {
        setPath(result, targetPath, value);
      }
    }
  }

  // 3. Array field mapping
  if (mapping.arrays) {
    for (const [masterArrayPath, arrCfg] of Object.entries(mapping.arrays)) {
      const sourceArr = getPath(masterData, masterArrayPath);
      if (!Array.isArray(sourceArr) || sourceArr.length === 0) continue;

      let newArr;
      if (arrCfg.scalarFromItem) {
        // e.g. master skills=[{name,level}] -> target skills=["JavaScript", "React"]
        newArr = sourceArr.map(item => item[arrCfg.scalarFromItem]).filter(Boolean);
      } else if (arrCfg.itemMap) {
        newArr = sourceArr.map(item => {
          const obj = {};
          for (const [masterField, targetField] of Object.entries(arrCfg.itemMap)) {
            if (masterField.startsWith('_') || masterField === 'joinBulletsAs') continue;
            let value = item[masterField];
            if (masterField === 'bullets' && Array.isArray(value) && arrCfg.itemMap.joinBulletsAs === 'paragraph') {
              value = value.join(' ');
            }
            if (value !== undefined) obj[targetField] = value;
          }
          return obj;
        });
      } else {
        newArr = sourceArr;
      }
      setPath(result, arrCfg.targetPath, newArr);
    }
  }

  // 4. Object-map handling (e.g. style20's socials={LinkedIn:"...", Instagram:"..."} —
  //    an object keyed by platform name, rather than an array of {platform,url})
  if (mapping.objectMap) {
    for (const [masterArrayPath, objCfg] of Object.entries(mapping.objectMap)) {
      const sourceArr = getPath(masterData, masterArrayPath);
      if (!Array.isArray(sourceArr) || sourceArr.length === 0) continue;
      const obj = {};
      sourceArr.forEach(item => {
        const key = item[objCfg.keyFrom];
        const value = item[objCfg.valueFrom];
        if (key) obj[key] = value;
      });
      setPath(result, objCfg.targetPath, obj);
    }
  }

  return result;
}

// Export for both browser (script tag) and Node/Cloudflare Functions use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { applyMapping, getPath, setPath };
}
