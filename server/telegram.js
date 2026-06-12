export function mergeTelegramSettings(existing = {}, incoming = {}) {
  const result = { ...existing };
  if (incoming.enabled !== undefined) result.enabled = Boolean(incoming.enabled);
  const token = String(incoming.botToken ?? "").trim();
  if (token) result.botToken = token;
  const chatId = String(incoming.chatId ?? "").trim().replace(/\s/g, "");
  if (chatId) result.chatId = chatId;
  return result;
}

const BOT_CHAT_ID_ERROR =
  "Указан ID самого бота, а не ваш чат. Напишите боту /start в Telegram и нажмите «Связать» снова — Chat ID подставится автоматически. Не копируйте id из getMe, нужен chat.id из getUpdates.";

function formatTelegramError(description) {
  const msg = String(description || "");
  if (/can't send messages to the bot/i.test(msg)) {
    return BOT_CHAT_ID_ERROR;
  }
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

async function telegramApi(token, method, params = {}) {
  const url = new URL(`https://api.telegram.org/bot${token}/${method}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  });
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.ok) {
    throw new Error(formatTelegramError(data.description));
  }
  return data.result;
}

export async function getBotUserId(botToken) {
  const token = String(botToken ?? "").trim();
  if (!token) return null;
  try {
    const bot = await telegramApi(token, "getMe");
    return bot?.id != null ? String(bot.id) : null;
  } catch {
    return null;
  }
}

export async function discoverChatIdFromUpdates(botToken) {
  const token = String(botToken ?? "").trim();
  if (!token) return null;

  let updates;
  try {
    updates = await telegramApi(token, "getUpdates", { limit: 100 });
  } catch {
    return null;
  }
  if (!Array.isArray(updates) || updates.length === 0) return null;

  const botUserId = await getBotUserId(token);

  for (let i = updates.length - 1; i >= 0; i -= 1) {
    const update = updates[i];
    const msg = update.message || update.edited_message || update.channel_post;
    if (msg?.chat?.id != null && msg.from && !msg.from.is_bot) {
      const chatId = String(msg.chat.id);
      if (!botUserId || chatId !== botUserId) return chatId;
    }
    const member = update.my_chat_member;
    if (member?.chat?.id != null) {
      const chatId = String(member.chat.id);
      if (!botUserId || chatId !== botUserId) return chatId;
    }
  }

  for (let i = updates.length - 1; i >= 0; i -= 1) {
    const update = updates[i];
    const msg = update.message || update.edited_message;
    if (msg?.chat?.id != null && msg.chat.type !== "private") {
      return String(msg.chat.id);
    }
  }

  return null;
}

export async function resolveTelegramChat(botToken, chatId) {
  const token = String(botToken ?? "").trim();
  let chat = String(chatId ?? "").trim().replace(/\s/g, "");

  if (!chat) {
    chat = (await discoverChatIdFromUpdates(token)) || "";
  }
  if (!chat) {
    throw new Error("Chat ID не найден. Напишите боту /start в Telegram и повторите связку.");
  }

  const botUserId = await getBotUserId(token);
  if (botUserId && chat === botUserId) {
    const discovered = await discoverChatIdFromUpdates(token);
    if (discovered && discovered !== botUserId) {
      chat = discovered;
    } else {
      throw new Error(BOT_CHAT_ID_ERROR);
    }
  }

  return chat;
}

export async function sendTelegramMessage(botToken, chatId, text) {
  const token = String(botToken ?? "").trim();
  if (!token) {
    throw new Error("Укажите Bot Token");
  }
  const chat = await resolveTelegramChat(token, chatId);
  if (!chat) {
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
