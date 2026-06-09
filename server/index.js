import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import {
  addLead,
  clearLeads,
  deleteLead,
  getLeads,
  getPublicSiteData,
  getSiteData,
  resetSiteData,
  saveSiteData,
  verifyAdminPassword,
} from "./storage.js";
import { notifyLeadTelegram, sendTelegramMessage } from "./telegram.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, "..", "dist");

const app = express();
app.use(express.json({ limit: "1mb" }));

function requireAdmin(req, res, next) {
  const password = req.headers["x-admin-password"];
  if (!verifyAdminPassword(password)) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "lifegift", server: true });
});

app.get("/api/site-data", (_req, res) => {
  res.json(getPublicSiteData());
});

app.post("/api/admin/login", (req, res) => {
  const password = String(req.body?.password || "").trim();
  if (!verifyAdminPassword(password)) {
    return res.status(401).json({ error: "Неверный пароль" });
  }
  res.json({ ok: true, data: getSiteData() });
});

app.get("/api/admin/site-data", requireAdmin, (_req, res) => {
  res.json(getSiteData());
});

app.put("/api/site-data", requireAdmin, (req, res) => {
  try {
    const saved = saveSiteData(req.body);
    res.json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post("/api/site-data/reset", requireAdmin, (_req, res) => {
  res.json(resetSiteData());
});

app.get("/api/leads", requireAdmin, (_req, res) => {
  res.json(getLeads());
});

app.post("/api/leads", async (req, res) => {
  const { name, phone, email, message, lang } = req.body || {};
  if (!name?.trim() || !phone?.trim()) {
    return res.status(400).json({ error: "Name and phone required" });
  }
  const lead = addLead({
    name: name.trim(),
    phone: phone.trim(),
    email: email?.trim() || "",
    message: message?.trim() || "",
    lang: lang || "ru",
  });

  try {
    const site = getSiteData();
    await notifyLeadTelegram(site.telegram, lead);
  } catch (err) {
    console.error("Telegram notify failed:", err.message);
  }

  res.status(201).json(lead);
});

app.delete("/api/leads/:id", requireAdmin, (req, res) => {
  deleteLead(Number(req.params.id));
  res.json(getLeads());
});

app.delete("/api/leads", requireAdmin, (_req, res) => {
  clearLeads();
  res.json([]);
});

app.get("/api/telegram/status", requireAdmin, (_req, res) => {
  const { telegram } = getSiteData();
  res.json({
    enabled: Boolean(telegram?.enabled),
    connected: Boolean(telegram?.enabled && telegram?.botToken && telegram?.chatId),
    chatId: telegram?.chatId ? maskChatId(telegram.chatId) : "",
    hasToken: Boolean(telegram?.botToken),
  });
});

app.post("/api/telegram/test", requireAdmin, async (req, res) => {
  try {
    const site = getSiteData();
    const telegram = { ...site.telegram, ...req.body?.telegram };
    await sendTelegramMessage(
      telegram.botToken,
      telegram.chatId,
      "✅ <b>LifeGift</b>\n\nTelegram успешно связан с сайтом. Заявки будут приходить сюда."
    );
    const saved = saveSiteData({
      ...site,
      telegram: { ...telegram, enabled: true },
    });
    res.json({ ok: true, telegram: saved.telegram });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

function maskChatId(id) {
  const s = String(id);
  if (s.length <= 4) return "****";
  return `${s.slice(0, 2)}***${s.slice(-2)}`;
}

app.use(express.static(distPath));

app.use((_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`LifeGift server: http://localhost:${PORT}`);
});
