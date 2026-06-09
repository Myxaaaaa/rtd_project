import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import {
  addLead,
  clearLeads,
  deleteLead,
  getLeads,
  getSiteData,
  resetSiteData,
  saveSiteData,
  verifyAdminPassword,
} from "./storage.js";

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
  res.json({ ok: true, service: "lifegift" });
});

app.get("/api/site-data", (_req, res) => {
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

app.post("/api/leads", (req, res) => {
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

app.use(express.static(distPath));

app.use((_req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

app.listen(PORT, () => {
  console.log(`LifeGift server: http://localhost:${PORT}`);
});
