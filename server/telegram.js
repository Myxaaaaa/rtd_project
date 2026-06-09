export async function sendTelegramMessage(botToken, chatId, text) {
  if (!botToken?.trim() || !chatId?.trim()) {
    throw new Error("Укажите Bot Token и Chat ID");
  }

  const res = await fetch(`https://api.telegram.org/bot${botToken.trim()}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId.trim(),
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(data.description || "Telegram API error");
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
