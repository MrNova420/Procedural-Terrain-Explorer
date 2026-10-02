/**
 * URL Hash encoder/decoder for sharing procedural terrain seeds and settings.
 */

const KEY_MAP = {
  s: 'seed',
  b: 'biome',
  o: 'octaves',
  f: 'frequency',
  h: 'heightScale',
  r: 'ridged',
  w: 'warp',
  i: 'island',
  t: 'timeOfDay',
  wl: 'waterLevel'
};

const REV_KEY_MAP = Object.entries(KEY_MAP).reduce((acc, [k, v]) => {
  acc[v] = k;
  return acc;
}, {});

export function encodeUrlState(stateSnapshot) {
  const params = new URLSearchParams();
  for (const [fullKey, shortKey] of Object.entries(REV_KEY_MAP)) {
    const val = stateSnapshot[fullKey];
    if (val !== undefined && val !== null) {
      if (typeof val === 'boolean') {
        params.set(shortKey, val ? '1' : '0');
      } else if (typeof val === 'number') {
        params.set(shortKey, Number.isInteger(val) ? val.toString() : val.toFixed(3));
      } else {
        params.set(shortKey, String(val));
      }
    }
  }
  return '#' + params.toString();
}

export function decodeUrlState() {
  const hash = window.location.hash.replace(/^#/, '');
  if (!hash) return {};

  const params = new URLSearchParams(hash);
  const result = {};

  for (const [shortKey, fullKey] of Object.entries(KEY_MAP)) {
    if (params.has(shortKey)) {
      const raw = params.get(shortKey);
      if (fullKey === 'island') {
        result[fullKey] = raw === '1' || raw === 'true';
      } else if (['octaves', 'frequency', 'heightScale', 'ridged', 'warp', 'timeOfDay', 'waterLevel'].includes(fullKey)) {
        const num = parseFloat(raw);
        if (!isNaN(num)) result[fullKey] = num;
      } else {
        result[fullKey] = raw;
      }
    }
  }
  return result;
}

export function updateUrlHash(stateSnapshot) {
  const hash = encodeUrlState(stateSnapshot);
  if (window.location.hash !== hash) {
    history.replaceState(null, '', hash);
  }
}
