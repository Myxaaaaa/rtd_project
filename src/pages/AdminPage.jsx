import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useSite } from "../context/SiteContext";
import "../styles/admin.css";

const TABS = [
  { id: "dashboard", label: "Обзор", icon: "◉", desc: "Статистика и быстрый доступ" },
  { id: "brand", label: "Бренд", icon: "◈", desc: "Название, цвета и тема LifeGift" },
  { id: "contacts", label: "Контакты", icon: "☎", desc: "Телефон, email и WhatsApp" },
  { id: "ru", label: "Контент RU", icon: "RU", desc: "Русская версия сайта" },
  { id: "kg", label: "Контент KG", icon: "KG", desc: "Кыргызская версия сайта" },
  { id: "submissions", label: "Заявки", icon: "✉", desc: "Заявки с формы сайта" },
  { id: "telegram", label: "Telegram", icon: "✈", desc: "Уведомления о заявках в Telegram" },
  { id: "settings", label: "Настройки", icon: "⚙", desc: "Пароль, экспорт и сброс" },
];

function LoginForm() {
  const { login } = useSite();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(password);
    setLoading(false);
    if (ok) return;
    setError("Неверный пароль");
  }

  return (
    <div className="adm-page adm-login">
      <form className="adm-login-card" onSubmit={handleSubmit}>
        <div className="adm-brand">
          <div className="adm-brand-mark">LG</div>
          <div>
            <h1>LifeGift Admin</h1>
            <p>lifegift.kg · панель управления</p>
          </div>
        </div>
        <p>Введите пароль для управления сайтом</p>
        <div className="adm-field">
          <label htmlFor="adm-pass">Пароль</label>
          <input
            id="adm-pass"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoFocus
            required
          />
        </div>
        <button type="submit" className="adm-btn adm-btn-primary" disabled={loading}>
          {loading ? "Вход…" : "Войти"}
        </button>
        {error && <p className="adm-msg-error">{error}</p>}
        <Link to="/" className="adm-back-link">← Вернуться на сайт</Link>
      </form>
    </div>
  );
}

function ListEditor({ items, onChange, fields }) {
  function update(i, key, value) {
    const next = items.map((item, idx) => (idx === i ? { ...item, [key]: value } : item));
    onChange(next);
  }

  function updateSimple(i, value) {
    const next = [...items];
    next[i] = value;
    onChange(next);
  }

  function remove(i) {
    onChange(items.filter((_, idx) => idx !== i));
  }

  function add() {
    if (fields) onChange([...items, Object.fromEntries(fields.map((f) => [f.key, f.default || ""]))]);
    else onChange([...items, ""]);
  }

  return (
    <>
      {items.map((item, i) => (
        <div className="adm-row" key={i}>
          {fields ? (
            fields.map((f) =>
              f.multiline ? (
                <div className="adm-field" key={f.key}>
                  <label>{f.label}</label>
                  <textarea
                    value={item[f.key] || ""}
                    onChange={(e) => update(i, f.key, e.target.value)}
                    rows={2}
                  />
                </div>
              ) : (
                <div className="adm-field" key={f.key}>
                  <label>{f.label}</label>
                  <input
                    value={item[f.key] || ""}
                    onChange={(e) => update(i, f.key, e.target.value)}
                  />
                </div>
              )
            )
          ) : (
            <div className="adm-field">
              <input value={item} onChange={(e) => updateSimple(i, e.target.value)} />
            </div>
          )}
          <div className="adm-row-actions">
            <button type="button" onClick={() => remove(i)}>Удалить</button>
          </div>
        </div>
      ))}
      <button type="button" className="adm-add-btn" onClick={add}>+ Добавить</button>
    </>
  );
}

function LangEditor({ langKey, draft, setDraft }) {
  const L = draft[langKey];

  function setLang(next) {
    setDraft({ ...draft, [langKey]: next });
  }

  function patch(path, value) {
    const parts = path.split(".");
    const next = { ...L };
    let cur = next;
    for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]] = { ...cur[parts[i]] };
    cur[parts.at(-1)] = value;
    setLang(next);
  }

  return (
    <>
      <div className="adm-card">
        <h3>SEO</h3>
        <div className="adm-grid">
          <div className="adm-field">
            <label>Title</label>
            <input value={L.meta.title} onChange={(e) => patch("meta.title", e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Description</label>
            <input value={L.meta.description} onChange={(e) => patch("meta.description", e.target.value)} />
          </div>
        </div>
      </div>

      <div className="adm-card">
        <h3>Hero</h3>
        <div className="adm-grid">
          <div className="adm-field">
            <label>Бейдж</label>
            <input value={L.hero.badge} onChange={(e) => patch("hero.badge", e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Кнопка</label>
            <input value={L.hero.cta} onChange={(e) => patch("hero.cta", e.target.value)} />
          </div>
        </div>
        <div className="adm-field">
          <label>Заголовок</label>
          <textarea value={L.hero.title} onChange={(e) => patch("hero.title", e.target.value)} rows={2} />
        </div>
        <div className="adm-field">
          <label>Подзаголовок</label>
          <textarea value={L.hero.subtitle} onChange={(e) => patch("hero.subtitle", e.target.value)} rows={2} />
        </div>
        {L.hero.stats.map((s, i) => (
          <div className="adm-grid" key={i}>
            <div className="adm-field">
              <label>Stat {i + 1} value</label>
              <input value={s.value} onChange={(e) => {
                const stats = [...L.hero.stats];
                stats[i] = { ...stats[i], value: e.target.value };
                patch("hero.stats", stats);
              }} />
            </div>
            <div className="adm-field">
              <label>Stat {i + 1} label</label>
              <input value={s.label} onChange={(e) => {
                const stats = [...L.hero.stats];
                stats[i] = { ...stats[i], label: e.target.value };
                patch("hero.stats", stats);
              }} />
            </div>
          </div>
        ))}
      </div>

      <div className="adm-card">
        <h3>О программе</h3>
        <div className="adm-field">
          <label>Заголовок</label>
          <input value={L.why.title} onChange={(e) => patch("why.title", e.target.value)} />
        </div>
        <div className="adm-field">
          <label>Текст</label>
          <textarea value={L.why.text} onChange={(e) => patch("why.text", e.target.value)} rows={3} />
        </div>
        <ListEditor
          items={L.why.features}
          onChange={(v) => patch("why.features", v)}
          fields={[
            { key: "icon", label: "Иконка", default: "✨" },
            { key: "title", label: "Заголовок" },
            { key: "text", label: "Текст" },
          ]}
        />
      </div>

      <div className="adm-card">
        <h3>Выплаты</h3>
        <div className="adm-grid">
          <div className="adm-field">
            <label>Заголовок</label>
            <input value={L.payments.title} onChange={(e) => patch("payments.title", e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Подзаголовок</label>
            <input value={L.payments.subtitle} onChange={(e) => patch("payments.subtitle", e.target.value)} />
          </div>
        </div>
        <ListEditor items={L.payments.items} onChange={(v) => patch("payments.items", v)} />
      </div>

      <div className="adm-card">
        <h3>Этапы</h3>
        <div className="adm-grid">
          <div className="adm-field">
            <label>Заголовок</label>
            <input value={L.steps.title} onChange={(e) => patch("steps.title", e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Подзаголовок</label>
            <input value={L.steps.subtitle} onChange={(e) => patch("steps.subtitle", e.target.value)} />
          </div>
        </div>
        <ListEditor
          items={L.steps.items}
          onChange={(v) => patch("steps.items", v)}
          fields={[
            { key: "title", label: "Название" },
            { key: "text", label: "Описание", multiline: true },
          ]}
        />
      </div>

      <div className="adm-card">
        <h3>Кураторы</h3>
        <div className="adm-field">
          <label>Заголовок</label>
          <input value={L.support.title} onChange={(e) => patch("support.title", e.target.value)} />
        </div>
        <div className="adm-field">
          <label>Текст</label>
          <textarea value={L.support.text} onChange={(e) => patch("support.text", e.target.value)} rows={3} />
        </div>
        <ListEditor
          items={L.support.curators}
          onChange={(v) => patch("support.curators", v)}
          fields={[
            { key: "name", label: "Имя" },
            { key: "role", label: "Роль" },
          ]}
        />
      </div>

      <div className="adm-card">
        <h3>FAQ</h3>
        <div className="adm-field">
          <label>Заголовок</label>
          <input value={L.faq.title} onChange={(e) => patch("faq.title", e.target.value)} />
        </div>
        <ListEditor
          items={L.faq.items}
          onChange={(v) => patch("faq.items", v)}
          fields={[
            { key: "q", label: "Вопрос" },
            { key: "a", label: "Ответ", multiline: true },
          ]}
        />
      </div>

      <div className="adm-card">
        <h3>Отзывы</h3>
        <div className="adm-field">
          <label>Заголовок</label>
          <input value={L.reviews.title} onChange={(e) => patch("reviews.title", e.target.value)} />
        </div>
        <ListEditor
          items={L.reviews.items}
          onChange={(v) => patch("reviews.items", v)}
          fields={[
            { key: "name", label: "Имя" },
            { key: "city", label: "Город" },
            { key: "text", label: "Текст", multiline: true },
          ]}
        />
      </div>

      <div className="adm-card">
        <h3>Форма и footer</h3>
        <div className="adm-grid">
          <div className="adm-field">
            <label>Заголовок формы</label>
            <input value={L.form.title} onChange={(e) => patch("form.title", e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Требования — заголовок</label>
            <input value={L.form.requirementsTitle} onChange={(e) => patch("form.requirementsTitle", e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Submit</label>
            <input value={L.form.submit} onChange={(e) => patch("form.submit", e.target.value)} />
          </div>
          <div className="adm-field">
            <label>Success</label>
            <input value={L.form.success} onChange={(e) => patch("form.success", e.target.value)} />
          </div>
        </div>
        <ListEditor items={L.form.requirements} onChange={(v) => patch("form.requirements", v)} />
        <div className="adm-field" style={{ marginTop: 12 }}>
          <label>Copyright</label>
          <input value={L.footer.copyright} onChange={(e) => patch("footer.copyright", e.target.value)} />
        </div>
        <div className="adm-field">
          <label>SEO</label>
          <textarea value={L.footer.seo} onChange={(e) => patch("footer.seo", e.target.value)} rows={2} />
        </div>
      </div>
    </>
  );
}

function TelegramTab({ draft, setDraft, useApi }) {
  const { testTelegram, getTelegramStatus } = useSite();
  const tg = draft.telegram || { enabled: false, botToken: "", chatId: "" };
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    if (useApi) {
      getTelegramStatus().then(setStatus).catch(() => setStatus(null));
    }
  }, [useApi, getTelegramStatus, tg.enabled]);

  function setTg(patch) {
    setDraft({ ...draft, telegram: { ...tg, ...patch } });
  }

  async function handleConnect() {
    setMsg("");
    setErr("");
    if (!useApi) {
      setErr("Telegram работает только на сервере (Railway). Локально заявки сохраняются в браузере.");
      return;
    }
    if (!tg.botToken?.trim() && !status?.hasToken) {
      setErr("Заполните Bot Token");
      return;
    }
    if (!tg.chatId?.trim() && !status?.connected) {
      setErr("Заполните Chat ID");
      return;
    }
    setLoading(true);
    try {
      await testTelegram(tg);
      setMsg("Telegram успешно связан! Тестовое сообщение отправлено.");
      setTg({ enabled: true });
      setStatus(await getTelegramStatus());
    } catch (e) {
      setErr(e.message || "Ошибка связи с Telegram");
    } finally {
      setLoading(false);
    }
  }

  const connected = status?.connected || (tg.enabled && tg.botToken && tg.chatId);

  return (
    <>
      {!useApi && (
        <div className="adm-alert adm-alert-warn">
          Сейчас сайт работает без сервера. После деплоя на Railway здесь можно связать Telegram.
        </div>
      )}

      <div className={`adm-tg-status ${connected ? "connected" : "disconnected"}`}>
        <span>{connected ? "✅" : "⚠️"}</span>
        <span>
          {connected
            ? `Telegram связан${status?.chatId ? ` · Chat ${status.chatId}` : ""}`
            : "Telegram не связан — заявки не приходят в мессенджер"}
        </span>
      </div>

      <div className="adm-card">
        <h3>Как подключить</h3>
        <ol className="adm-tg-steps">
          <li>Откройте <strong>@BotFather</strong> в Telegram → /newbot → скопируйте <strong>Bot Token</strong></li>
          <li>Напишите вашему боту любое сообщение или добавьте его в группу</li>
          <li>Откройте <code>https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</code> и найдите <strong>chat.id</strong></li>
          <li>Вставьте Token и Chat ID ниже → нажмите «Связать Telegram»</li>
        </ol>
      </div>

      <div className="adm-card">
        <h3>Настройки бота</h3>
        <div className="adm-field">
          <label>Bot Token</label>
          <input
            type="password"
            value={tg.botToken || ""}
            onChange={(e) => setTg({ botToken: e.target.value })}
            placeholder={status?.hasToken ? "Токен сохранён на сервере — введите только для замены" : "123456789:ABCdefGHI..."}
            autoComplete="off"
          />
        </div>
        <div className="adm-field">
          <label>Chat ID</label>
          <input
            value={tg.chatId || ""}
            onChange={(e) => setTg({ chatId: e.target.value })}
            placeholder="-1001234567890 или 123456789"
          />
        </div>
        <label className="adm-toggle" style={{ marginBottom: 16 }}>
          <input
            type="checkbox"
            checked={Boolean(tg.enabled)}
            onChange={(e) => setTg({ enabled: e.target.checked })}
          />
          <span className="adm-toggle-track" />
          <span>Отправлять заявки в Telegram</span>
        </label>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            className="adm-btn adm-btn-success"
            onClick={handleConnect}
            disabled={loading}
          >
            {loading ? "Проверка…" : "✈ Связать Telegram"}
          </button>
        </div>
        {msg && <div className="adm-alert adm-alert-info">{msg}</div>}
        {err && <div className="adm-alert adm-alert-warn">{err}</div>}
        <p style={{ marginTop: 16, fontSize: 13, color: "var(--adm-muted)" }}>
          После связки каждая новая заявка с сайта автоматически приходит в ваш Telegram.
          Кнопка «Связать Telegram» сохраняет настройки на сервере — отдельно «Сохранить» для этого не нужно.
        </p>
      </div>
    </>
  );
}

function AdminDashboard() {
  const {
    data,
    submissions,
    updateData,
    logout,
    resetData,
    exportData,
    importData,
    removeSubmission,
    clearAllSubmissions,
    useApi,
    getTelegramStatus,
  } = useSite();

  const [tab, setTab] = useState("dashboard");
  const [draft, setDraft] = useState(data);
  const [saved, setSaved] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [tgConnected, setTgConnected] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setDraft(data);
  }, [data]);

  useEffect(() => {
    document.body.classList.toggle("adm-menu-open", menuOpen);
    return () => document.body.classList.remove("adm-menu-open");
  }, [menuOpen]);

  function selectTab(id) {
    setTab(id);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  useEffect(() => {
    if (useApi) {
      getTelegramStatus()
        .then((s) => setTgConnected(Boolean(s?.connected)))
        .catch(() => setTgConnected(false));
    }
  }, [useApi, getTelegramStatus, draft.telegram]);

  const currentTab = TABS.find((t) => t.id === tab);

  function save() {
    const next = { ...draft };
    if (newPassword.trim()) next.adminPassword = newPassword.trim();
    updateData(next).then((savedData) => {
      setDraft(savedData);
      setNewPassword("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const parsed = await importData(reader.result);
        setDraft(parsed);
      } catch {
        alert("Неверный JSON");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="adm-page adm-layout">
      <aside className="adm-sidebar">
        <div className="adm-sidebar-head">
          <div className="adm-brand">
            <div className="adm-brand-mark">LG</div>
            <div>
              <h1>LifeGift</h1>
              <p>Админ-панель</p>
            </div>
          </div>
          <div className={`adm-status ${useApi ? "online" : ""}`}>
            <span className="adm-status-dot" />
            {useApi ? "Сервер подключён" : "Локальный режим"}
          </div>
        </div>
        <nav className="adm-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`adm-nav-btn ${tab === t.id ? "active" : ""}`}
              onClick={() => selectTab(t.id)}
            >
              <span className="adm-nav-icon">{t.icon}</span>
              {t.label}
              {t.id === "submissions" && submissions.length > 0 && (
                <span className="adm-nav-badge">{submissions.length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="adm-sidebar-foot">
          <Link to="/" target="_blank">↗ Открыть сайт</Link>
          <button type="button" onClick={logout}>Выйти</button>
        </div>
      </aside>

      <div className="adm-content-wrap">
        <header className="adm-mobile-header">
          <button
            type="button"
            className="adm-menu-btn"
            onClick={() => setMenuOpen(true)}
            aria-label="Открыть меню"
          >
            ☰
          </button>
          <div className="adm-mobile-header-text">
            <strong>{currentTab?.label}</strong>
            <span className={`adm-status adm-status-mini ${useApi ? "online" : ""}`}>
              <span className="adm-status-dot" />
              {useApi ? "Сервер" : "Локально"}
            </span>
          </div>
          <Link to="/" className="adm-mobile-site-link" target="_blank" aria-label="Открыть сайт">
            ↗
          </Link>
        </header>

        {menuOpen && (
          <>
            <button
              type="button"
              className="adm-drawer-backdrop"
              aria-label="Закрыть меню"
              onClick={() => setMenuOpen(false)}
            />
            <aside className="adm-drawer" aria-label="Навигация">
              <div className="adm-drawer-head">
                <div className="adm-brand">
                  <div className="adm-brand-mark">LG</div>
                  <div>
                    <h1>LifeGift</h1>
                    <p>Админ-панель</p>
                  </div>
                </div>
                <button type="button" className="adm-drawer-close" onClick={() => setMenuOpen(false)} aria-label="Закрыть">
                  ✕
                </button>
              </div>
              <nav className="adm-drawer-nav">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`adm-nav-btn ${tab === t.id ? "active" : ""}`}
                    onClick={() => selectTab(t.id)}
                  >
                    <span className="adm-nav-icon">{t.icon}</span>
                    {t.label}
                    {t.id === "submissions" && submissions.length > 0 && (
                      <span className="adm-nav-badge">{submissions.length}</span>
                    )}
                  </button>
                ))}
              </nav>
              <div className="adm-drawer-foot">
                <Link to="/" target="_blank" onClick={() => setMenuOpen(false)}>↗ Открыть сайт</Link>
                <button type="button" onClick={logout}>Выйти</button>
              </div>
            </aside>
          </>
        )}

        <main className="adm-main">
          <div className="adm-topbar">
            <div>
              <h1>{currentTab?.label}</h1>
              <p className="adm-topbar-desc">{currentTab?.desc}</p>
            </div>
            <div className="adm-topbar-actions">
              <button
                type="button"
                className={`adm-save-btn adm-save-btn-desktop ${saved ? "saved" : ""}`}
                onClick={save}
              >
                {saved ? "Сохранено ✓" : "Сохранить изменения"}
              </button>
            </div>
          </div>

          {tab === "dashboard" && (
            <>
              <div className="adm-stat-grid">
                <div className="adm-stat">
                  <div className="adm-stat-value">{submissions.length}</div>
                  <div className="adm-stat-label">Заявок всего</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-value">{useApi ? "✓" : "—"}</div>
                  <div className="adm-stat-label">{useApi ? "API на сервере" : "Только браузер"}</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-value">{tgConnected ? "✓" : "—"}</div>
                  <div className="adm-stat-label">Telegram</div>
                </div>
                <div className="adm-stat">
                  <div className="adm-stat-value">{draft.brand?.name || "LifeGift"}</div>
                  <div className="adm-stat-label">Бренд</div>
                </div>
              </div>
              <div className="adm-card">
                <h3>Быстрые действия</h3>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  <button type="button" className="adm-btn adm-btn-sm adm-btn-success" onClick={() => selectTab("submissions")}>
                    Заявки ({submissions.length})
                  </button>
                  <button type="button" className="adm-btn adm-btn-sm adm-btn-success" onClick={() => selectTab("telegram")}>
                    Настроить Telegram
                  </button>
                  <button type="button" className="adm-btn adm-btn-sm adm-btn-ghost" onClick={() => selectTab("brand")}>
                    Бренд и тема
                  </button>
                </div>
              </div>
              {submissions.length > 0 && (
                <div className="adm-card">
                  <h3>Последние заявки</h3>
                  {submissions.slice(0, 3).map((s) => (
                    <div className="adm-lead" key={s.id}>
                      <div className="adm-lead-head">
                        <span className="adm-lead-name">{s.name}</span>
                        <span className="adm-lead-time">{new Date(s.createdAt).toLocaleString("ru-RU")}</span>
                      </div>
                      <div className="adm-lead-meta">
                        <span>📞 {s.phone}</span>
                        {s.email && <span>✉ {s.email}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {tab === "brand" && (
            <div className="adm-card">
              <div className="adm-grid">
                <div className="adm-field">
                  <label>Название</label>
                  <input value={draft.brand.name} onChange={(e) => setDraft({ ...draft, brand: { ...draft.brand, name: e.target.value } })} />
                </div>
                <div className="adm-field">
                  <label>Подзаголовок</label>
                  <input value={draft.brand.subtitle} onChange={(e) => setDraft({ ...draft, brand: { ...draft.brand, subtitle: e.target.value } })} />
                </div>
                <div className="adm-field">
                  <label>Акцент</label>
                  <input type="color" value={draft.theme.accent} onChange={(e) => setDraft({ ...draft, theme: { ...draft.theme, accent: e.target.value } })} />
                </div>
                <div className="adm-field">
                  <label>Светлый</label>
                  <input type="color" value={draft.theme.accentLight} onChange={(e) => setDraft({ ...draft, theme: { ...draft.theme, accentLight: e.target.value } })} />
                </div>
                <div className="adm-field">
                  <label>Тёмный</label>
                  <input type="color" value={draft.theme.dark} onChange={(e) => setDraft({ ...draft, theme: { ...draft.theme, dark: e.target.value } })} />
                </div>
                <div className="adm-field">
                  <label>Фон</label>
                  <input type="color" value={draft.theme.surface} onChange={(e) => setDraft({ ...draft, theme: { ...draft.theme, surface: e.target.value } })} />
                </div>
              </div>
            </div>
          )}

          {tab === "contacts" && (
            <>
              <div className="adm-card">
                <h3>Контакты на сайте</h3>
                <div className="adm-grid">
                  <div className="adm-field">
                    <label>Телефон</label>
                    <input value={draft.contacts.phone} onChange={(e) => setDraft({ ...draft, contacts: { ...draft.contacts, phone: e.target.value } })} />
                  </div>
                  <div className="adm-field">
                    <label>Email</label>
                    <input value={draft.contacts.email} onChange={(e) => setDraft({ ...draft, contacts: { ...draft.contacts, email: e.target.value } })} />
                  </div>
                </div>
              </div>

              <div className="adm-card">
                <h3>WhatsApp — плавающая кнопка</h3>
                <p style={{ fontSize: 13, opacity: 0.75, margin: "0 0 16px" }}>
                  Зелёная кнопка в правом нижнем углу. При первом визите показывается подсказка с текстом и номером.
                </p>
                <label className="adm-toggle" style={{ marginBottom: 16 }}>
                  <input
                    type="checkbox"
                    checked={draft.whatsapp?.enabled !== false}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        whatsapp: { ...draft.whatsapp, enabled: e.target.checked },
                      })
                    }
                  />
                  <span className="adm-toggle-track" />
                  <span>Показывать кнопку WhatsApp</span>
                </label>
                <div className="adm-field">
                  <label>Номер WhatsApp</label>
                  <input
                    value={draft.whatsapp?.phone || ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        whatsapp: { ...draft.whatsapp, phone: e.target.value },
                      })
                    }
                    placeholder="+996 700 000 000"
                  />
                </div>
                <div className="adm-field">
                  <label>Текст подсказки (RU)</label>
                  <textarea
                    value={draft.whatsapp?.hintRu || ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        whatsapp: { ...draft.whatsapp, hintRu: e.target.value },
                      })
                    }
                    rows={2}
                  />
                </div>
                <div className="adm-field">
                  <label>Текст подсказки (KG)</label>
                  <textarea
                    value={draft.whatsapp?.hintKg || ""}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        whatsapp: { ...draft.whatsapp, hintKg: e.target.value },
                      })
                    }
                    rows={2}
                  />
                </div>
              </div>
            </>
          )}

          {tab === "ru" && <LangEditor langKey="ru" draft={draft} setDraft={setDraft} />}
          {tab === "kg" && <LangEditor langKey="kg" draft={draft} setDraft={setDraft} />}

          {tab === "submissions" && (
            <>
              {submissions.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <button type="button" className="adm-btn adm-btn-sm adm-btn-danger" onClick={clearAllSubmissions}>
                    Очистить все заявки
                  </button>
                </div>
              )}
              {submissions.length === 0 ? (
                <div className="adm-empty">
                  <div className="adm-empty-icon">✉</div>
                  <p>Заявок пока нет</p>
                  <p style={{ fontSize: 13 }}>Когда кто-то заполнит форму на сайте, заявка появится здесь и в Telegram</p>
                </div>
              ) : (
                submissions.map((s) => (
                  <div className="adm-lead" key={s.id}>
                    <div className="adm-lead-head">
                      <span className="adm-lead-name">{s.name}</span>
                      <span className="adm-lead-time">{new Date(s.createdAt).toLocaleString("ru-RU")}</span>
                    </div>
                    <div className="adm-lead-meta">
                      <span>📞 {s.phone}</span>
                      {s.email && <span>✉ {s.email}</span>}
                      <span>🌐 {s.lang?.toUpperCase() || "RU"}</span>
                    </div>
                    {s.message && <p style={{ margin: "10px 0 0", color: "var(--adm-muted)", fontSize: 14 }}>{s.message}</p>}
                    <div style={{ marginTop: 12 }}>
                      <button type="button" className="adm-btn adm-btn-sm adm-btn-danger" onClick={() => removeSubmission(s.id)}>
                        Удалить
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {tab === "telegram" && (
            <TelegramTab draft={draft} setDraft={setDraft} useApi={useApi} />
          )}

          {tab === "settings" && (
            <>
              <div className="adm-card">
                <h3>Пароль администратора</h3>
                <div className="adm-field">
                  <label>Новый пароль</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Оставьте пустым, чтобы не менять"
                  />
                </div>
              </div>
              <div className="adm-card">
                <h3>Экспорт / Импорт</h3>
                <button
                  type="button"
                  className="adm-btn adm-btn-sm adm-btn-success"
                  onClick={() => {
                    const blob = new Blob([exportData()], { type: "application/json" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = "lifegift-site-data.json";
                    a.click();
                  }}
                >
                  Скачать JSON
                </button>
                <div className="adm-field" style={{ marginTop: 16 }}>
                  <label>Загрузить JSON</label>
                  <input type="file" accept=".json" onChange={handleImport} />
                </div>
              </div>
              <div className="adm-card">
                <h3>Сброс данных</h3>
                <p>Вернуть все тексты и настройки к начальным значениям LifeGift.</p>
                <button
                  type="button"
                  className="adm-btn adm-btn-sm adm-btn-danger"
                  onClick={() => {
                    if (confirm("Сбросить все данные сайта?")) {
                      resetData().then(setDraft);
                    }
                  }}
                >
                  Сбросить к начальным
                </button>
              </div>
            </>
          )}
        </main>

        <nav className="adm-bottom-nav" aria-label="Быстрая навигация">
          <button
            type="button"
            className={`adm-bottom-nav-btn ${tab === "dashboard" ? "active" : ""}`}
            onClick={() => selectTab("dashboard")}
          >
            <span className="adm-bottom-nav-icon">◉</span>
            <span>Обзор</span>
          </button>
          <button
            type="button"
            className={`adm-bottom-nav-btn ${tab === "submissions" ? "active" : ""}`}
            onClick={() => selectTab("submissions")}
          >
            <span className="adm-bottom-nav-icon">✉</span>
            <span>Заявки</span>
            {submissions.length > 0 && <span className="adm-bottom-badge">{submissions.length}</span>}
          </button>
          <button
            type="button"
            className={`adm-bottom-nav-btn ${tab === "telegram" ? "active" : ""}`}
            onClick={() => selectTab("telegram")}
          >
            <span className="adm-bottom-nav-icon">✈</span>
            <span>Telegram</span>
          </button>
          <button
            type="button"
            className={`adm-bottom-nav-btn ${menuOpen ? "active" : ""}`}
            onClick={() => setMenuOpen(true)}
          >
            <span className="adm-bottom-nav-icon">☰</span>
            <span>Меню</span>
          </button>
        </nav>

        <div className="adm-mobile-save-bar">
          <button
            type="button"
            className={`adm-save-btn adm-save-btn-mobile ${saved ? "saved" : ""}`}
            onClick={save}
          >
            {saved ? "Сохранено ✓" : "Сохранить изменения"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { isAdmin } = useSite();
  return isAdmin ? <AdminDashboard /> : <LoginForm />;
}
