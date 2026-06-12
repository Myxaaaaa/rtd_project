export function mergeTelegramSettings(existing = {}, incoming = {}) {
  const result = { ...existing };
  if (incoming.enabled !== undefined) result.enabled = Boolean(incoming.enabled);
  const token = String(incoming.botToken ?? "").trim();
  if (token) result.botToken = token;
  const chatId = String(incoming.chatId ?? "").trim().replace(/\s/g, "");
  if (chatId) result.chatId = chatId;
  return result;
}

function formatTelegramError(description) {
  const msg = String(description || "");
  if (/not found/i.test(msg) && /chat/i.test(msg)) {
    return "Неверный Chat ID. Напишите боту /start или добавьте бота в группу, затем снова проверьте chat.id в getUpdates.";
  }
  if (/can't initiate conversation/i.test(msg)) {
    return "Сначала напишите боту любое сообщение в Telegram, затем повторите связку.";
  }
  if (/unauthorized|not found/i.test(msg)) {
    return "Неверный Bot Token. Проверьте токен у @BotFather.";
  }
  return msg || "Ошибка Telegram API";
}

export async function sendTelegramMessage(botToken, chatId, text) {
  const token = String(botToken ?? "").trim();
  const chat = String(chatId ?? "").trim().replace(/\s/g, "");
  if (!token || !chat) {
    throw new Error("Укажите Bot Token и Chat ID");
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chat,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(formatTelegramError(data.description));
  }
  return data;
}

export function formatLeadMessage(lead) {
  const lines = [
    "<b>🆕 Новая заявка LifeGift</b>",
    "",
    `<b>Имя:</b> ${escapeHtml(lead.name)}`,
    `<b>Телефон:</b> ${escapeHtml(lead.phone)}`,
  ];
  if (lead.email) lines.push(`<b>Email:</b> ${escapeHtml(lead.email)}`);
  if (lead.message) lines.push(`<b>Сообщение:</b> ${escapeHtml(lead.message)}`);
  lines.push(`<b>Язык:</b> ${(lead.lang || "ru").toUpperCase()}`);
  lines.push(`<b>Время:</b> ${new Date(lead.createdAt || Date.now()).toLocaleString("ru-RU")}`);
  return lines.join("\n");
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function notifyLeadTelegram(telegram, lead) {
  if (!telegram?.enabled || !telegram.botToken || !telegram.chatId) return null;
  return sendTelegramMessage(telegram.botToken, telegram.chatId, formatLeadMessage(lead));
}
