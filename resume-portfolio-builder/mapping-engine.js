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

  // 2. Scalar field mapping. Normally targetPath is a plain string. It can
  // also be an object { path, wrapInArray: true } for templates that expect
  // a single-paragraph field as a one-element array of paragraphs instead
  // of a plain string.
  if (mapping.scalar) {
    for (const [masterPath, targetSpec] of Object.entries(mapping.scalar)) {
      if (masterPath.startsWith('_')) continue; // skip note/comment keys
      const value = getPath(masterData, masterPath);
      if (value !== undefined && value !== null && value !== '') {
        if (typeof targetSpec === 'object' && targetSpec.path) {
          setPath(result, targetSpec.path, targetSpec.wrapInArray ? [value] : value);
        } else {
          setPath(result, targetSpec, value);
        }
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
          // joinFields: combine two or more master item fields into a single
          // target string (e.g. startDate + endDate -> one "period" field),
          // for templates that store a date range as one string rather than
          // separate start/end fields.
          if (arrCfg.joinFields) {
            arrCfg.joinFields.forEach(rule => {
              const parts = rule.sourceFields.map(f => item[f]).filter(Boolean);
              if (parts.length > 0) {
                obj[rule.targetField] = parts.join(rule.separator || ' ');
              }
            });
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

  // 5. Compose: build a single formatted string from multiple master
  // fields, for templates that display a combined value (e.g. one
  // "contact" string containing email/phone/location together, rather
  // than separate fields) instead of a structured object.
  if (mapping.compose) {
    for (const [targetPath, composeCfg] of Object.entries(mapping.compose)) {
      const rendered = composeCfg.template.replace(/\{([^}]+)\}/g, (match, token) => {
        if (token === 'year') return String(new Date().getFullYear());
        const value = getPath(masterData, token);
        return value !== undefined && value !== null ? value : '';
      });
      setPath(result, targetPath, rendered);
    }
  }

  // 6. labelValueArray: build an array of {label, value} pairs from a
  // fixed list of master field paths — for templates that display personal
  // info as a generic "definition list" rather than named fields (e.g.
  // [{label:"Email", value:"..."}] instead of a plain contact.email field).
  // Entries whose source value is missing/empty are skipped entirely.
  if (mapping.labelValueArray) {
    for (const [targetPath, cfg] of Object.entries(mapping.labelValueArray)) {
      const items = cfg.items
        .map(def => ({ label: def.label, value: getPath(masterData, def.sourcePath) }))
        .filter(entry => entry.value !== undefined && entry.value !== null && entry.value !== '');
      setPath(result, targetPath, items);
    }
  }

  // 7. contactItemsArray: build an array of {icon, text, link} objects from
  // a fixed list of master field paths — for templates that render contact
  // methods as a generic icon-linked list rather than named fields. Each
  // definition's linkTemplate supports a {value} placeholder.
  if (mapping.contactItemsArray) {
    for (const [targetPath, cfg] of Object.entries(mapping.contactItemsArray)) {
      const items = cfg.items
        .map(def => {
          const value = getPath(masterData, def.sourcePath);
          if (!value) return null;
          return {
            icon: def.icon,
            text: value,
            link: def.linkTemplate ? def.linkTemplate.replace('{value}', value) : value
          };
        })
        .filter(Boolean);
      setPath(result, targetPath, items);
    }
  }

  // 8. groupedArrays: wrap mapped array items inside a single synthetic
  // parent object — for templates that group items under a category (e.g.
  // skills displayed as [{category:"...", items:[...]}] rather than a flat
  // list). Supports multiple source arrays (e.g. master's separate "skills"
  // and "languages") each becoming their own group within the same output
  // array, since some templates fold both into one grouped structure.
  if (mapping.groupedArrays) {
    for (const [key, cfg] of Object.entries(mapping.groupedArrays)) {
      const groupsOutput = [];
      cfg.groups.forEach(groupDef => {
        const sourceArr = getPath(masterData, groupDef.sourcePath);
        if (!Array.isArray(sourceArr) || sourceArr.length === 0) return;
        const items = sourceArr.map(item => {
          const obj = {};
          for (const [masterField, targetField] of Object.entries(groupDef.itemMap)) {
            if (item[masterField] !== undefined) obj[targetField] = item[masterField];
          }
          return obj;
        });
        groupsOutput.push({ [cfg.groupField]: groupDef.groupValue, [cfg.itemsField]: items });
      });
      if (groupsOutput.length > 0) {
        setPath(result, cfg.targetPath, groupsOutput);
      }
    }
  }

  return result;
}

// Export for both browser (script tag) and Node/Cloudflare Functions use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { applyMapping, getPath, setPath };
}
