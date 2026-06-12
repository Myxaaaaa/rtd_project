import { DEFAULT_DATA, DEFAULT_PASSWORD } from "./defaultData";

const DATA_KEY = "rtd_site_data";
const SUBMISSIONS_KEY = "rtd_submissions";

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function deepMerge(base, patch) {
  if (!patch || typeof patch !== "object" || Array.isArray(patch)) return clone(base);
  const result = clone(base);
  Object.keys(patch).forEach((key) => {
    const patchVal = patch[key];
    const baseVal = result[key];
    if (
      patchVal &&
      typeof patchVal === "object" &&
      !Array.isArray(patchVal) &&
      baseVal &&
      typeof baseVal === "object" &&
      !Array.isArray(baseVal)
    ) {
      result[key] = deepMerge(baseVal, patchVal);
    } else if (patchVal !== undefined) {
      result[key] = patchVal;
    }
  });
  return result;
}

export function normalizeData(raw) {
  const merged = deepMerge(DEFAULT_DATA, raw || {});
  if (!merged.adminPassword) merged.adminPassword = DEFAULT_PASSWORD;
  if (!merged.telegram) merged.telegram = clone(DEFAULT_DATA.telegram);
  if (!merged.whatsapp) merged.whatsapp = clone(DEFAULT_DATA.whatsapp);
  return merged;
}

export function loadSiteData() {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (raw) return normalizeData(JSON.parse(raw));
  } catch (_) {}
  return clone(DEFAULT_DATA);
}

export function saveSiteData(data) {
  const normalized = normalizeData(data);
  localStorage.setItem(DATA_KEY, JSON.stringify(normalized));
  return normalized;
}

export function resetSiteData() {
  localStorage.removeItem(DATA_KEY);
  return clone(DEFAULT_DATA);
}

export function resetAdminPassword() {
  const data = loadSiteData();
  data.adminPassword = DEFAULT_PASSWORD;
  saveSiteData(data);
}

export function verifyPassword(password) {
  const data = loadSiteData();
  return String(password).trim() === (data.adminPassword || DEFAULT_PASSWORD);
}

export function getSubmissions() {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (_) {
    return [];
  }
}

export function addSubmission(entry) {
  const list = getSubmissions();
  list.unshift({ id: Date.now(), ...entry, createdAt: new Date().toISOString() });
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));
  return list;
}

export function deleteSubmission(id) {
  const list = getSubmissions().filter((s) => s.id !== id);
  localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(list));
  return list;
}

export function clearSubmissions() {
  localStorage.removeItem(SUBMISSIONS_KEY);
}

export function exportJson(data) {
  return JSON.stringify(data, null, 2);
}

export function importJson(json) {
  const parsed = normalizeData(JSON.parse(json));
  saveSiteData(parsed);
  return parsed;
}

export function applyTheme(theme) {
  const root = document.documentElement;
  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--accent-light", theme.accentLight);
  root.style.setProperty("--dark", theme.dark);
  root.style.setProperty("--surface", theme.surface);
}
