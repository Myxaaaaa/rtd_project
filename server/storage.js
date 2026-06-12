import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { DEFAULT_DATA, DEFAULT_PASSWORD } from "../src/data/defaultData.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, "..", "data");
const SITE_FILE = path.join(DATA_DIR, "site.json");
const LEADS_FILE = path.join(DATA_DIR, "leads.json");

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson(file, fallback) {
  ensureDataDir();
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, JSON.stringify(fallback, null, 2), "utf8");
    return clone(fallback);
  }
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    return clone(fallback);
  }
}

function writeJson(file, data) {
  ensureDataDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
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
  if (!merged.adminPassword) {
    merged.adminPassword = process.env.ADMIN_PASSWORD?.trim() || DEFAULT_PASSWORD;
  }
  if (!merged.telegram) merged.telegram = clone(DEFAULT_DATA.telegram);
  if (!merged.whatsapp) merged.whatsapp = clone(DEFAULT_DATA.whatsapp);
  return merged;
}

export function getPublicSiteData() {
  const data = getSiteData();
  const { adminPassword, telegram, ...publicData } = data;
  return publicData;
}

export function getSiteData() {
  return normalizeData(readJson(SITE_FILE, DEFAULT_DATA));
}

export function saveSiteData(data) {
  const existing = getSiteData();
  const normalized = normalizeData(data);
  if (existing.telegram?.botToken && !normalized.telegram?.botToken) {
    normalized.telegram = {
      ...existing.telegram,
      ...normalized.telegram,
      botToken: existing.telegram.botToken,
    };
  }
  if (existing.telegram?.chatId && !normalized.telegram?.chatId) {
    normalized.telegram = {
      ...normalized.telegram,
      chatId: existing.telegram.chatId,
    };
  }
  writeJson(SITE_FILE, normalized);
  return normalized;
}

export function resetSiteData() {
  const fresh = clone(DEFAULT_DATA);
  writeJson(SITE_FILE, fresh);
  return fresh;
}

function resolveAdminPassword(data) {
  const stored = data.adminPassword || DEFAULT_PASSWORD;
  if (stored !== DEFAULT_PASSWORD) return stored;
  return process.env.ADMIN_PASSWORD?.trim() || stored;
}

export function verifyAdminPassword(password) {
  const data = getSiteData();
  return String(password || "").trim() === resolveAdminPassword(data);
}

export function getLeads() {
  return readJson(LEADS_FILE, []);
}

export function addLead(entry) {
  const list = getLeads();
  const lead = { id: Date.now(), ...entry, createdAt: new Date().toISOString() };
  list.unshift(lead);
  writeJson(LEADS_FILE, list);
  return lead;
}

export function deleteLead(id) {
  writeJson(
    LEADS_FILE,
    getLeads().filter((item) => item.id !== id)
  );
}

export function clearLeads() {
  writeJson(LEADS_FILE, []);
}
