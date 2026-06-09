import { useState } from "react";
import { Link } from "react-router-dom";
import { useSite } from "../context/SiteContext";

const TABS = [
  { id: "brand", label: "Бренд и тема" },
  { id: "contacts", label: "Контакты" },
  { id: "ru", label: "Контент RU" },
  { id: "kg", label: "Контент KG" },
  { id: "submissions", label: "Заявки" },
  { id: "settings", label: "Настройки" },
];

function LoginForm() {
  const { login, resetPassword, defaultPassword } = useSite();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setInfo("");
    const ok = await login(password);
    if (ok) return;
    setError(`Неверный пароль. Попробуйте ${defaultPassword}`);
  }

  function handleReset() {
    resetPassword();
    setPassword(defaultPassword);
    setInfo(`Пароль сброшен на ${defaultPassword}. Нажмите «Войти».`);
    setError("");
  }

  return (
    <div className="admin-page admin-login">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <h1>Админ-панель</h1>
        <p>Введите пароль для управления сайтом</p>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          autoFocus
          required
        />
        <button type="submit">Войти</button>
        {error && <p className="admin-error">{error}</p>}
        {info && <p className="admin-success">{info}</p>}
        <p style={{ marginTop: 16, fontSize: 12, color: "#94a3b8" }}>
          <Link to="/" style={{ color: "#a78bfa" }}>← На сайт</Link>
        </p>
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
        <div className="admin-row" key={i}>
          {fields ? (
            fields.map((f) =>
              f.multiline ? (
                <textarea
                  key={f.key}
                  value={item[f.key] || ""}
                  onChange={(e) => update(i, f.key, e.target.value)}
                  placeholder={f.label}
                  rows={2}
                />
              ) : (
                <input
                  key={f.key}
                  value={item[f.key] || ""}
                  onChange={(e) => update(i, f.key, e.target.value)}
                  placeholder={f.label}
                />
              )
            )
          ) : (
            <input value={item} onChange={(e) => updateSimple(i, e.target.value)} />
          )}
          <div className="admin-row-actions">
            <button type="button" onClick={() => remove(i)}>Удалить</button>
          </div>
        </div>
      ))}
      <button type="button" className="admin-add" onClick={add}>+ Добавить</button>
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
      <div className="admin-block">
        <h3>SEO</h3>
        <div className="admin-grid">
          <label>Title<input value={L.meta.title} onChange={(e) => patch("meta.title", e.target.value)} /></label>
          <label>Description<input value={L.meta.description} onChange={(e) => patch("meta.description", e.target.value)} /></label>
        </div>
      </div>

      <div className="admin-block">
        <h3>Hero</h3>
        <div className="admin-grid">
          <label>Бейдж<input value={L.hero.badge} onChange={(e) => patch("hero.badge", e.target.value)} /></label>
          <label>Кнопка<input value={L.hero.cta} onChange={(e) => patch("hero.cta", e.target.value)} /></label>
        </div>
        <label>Заголовок<textarea value={L.hero.title} onChange={(e) => patch("hero.title", e.target.value)} rows={2} /></label>
        <label>Подзаголовок<textarea value={L.hero.subtitle} onChange={(e) => patch("hero.subtitle", e.target.value)} rows={2} /></label>
        {L.hero.stats.map((s, i) => (
          <div className="admin-grid" key={i}>
            <label>Stat {i + 1} value<input value={s.value} onChange={(e) => {
              const stats = [...L.hero.stats];
              stats[i] = { ...stats[i], value: e.target.value };
              patch("hero.stats", stats);
            }} /></label>
            <label>Stat {i + 1} label<input value={s.label} onChange={(e) => {
              const stats = [...L.hero.stats];
              stats[i] = { ...stats[i], label: e.target.value };
              patch("hero.stats", stats);
            }} /></label>
          </div>
        ))}
      </div>

      <div className="admin-block">
        <h3>О программе</h3>
        <label>Заголовок<input value={L.why.title} onChange={(e) => patch("why.title", e.target.value)} /></label>
        <label>Текст<textarea value={L.why.text} onChange={(e) => patch("why.text", e.target.value)} rows={3} /></label>
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

      <div className="admin-block">
        <h3>Выплаты</h3>
        <label>Заголовок<input value={L.payments.title} onChange={(e) => patch("payments.title", e.target.value)} /></label>
        <label>Подзаголовок<input value={L.payments.subtitle} onChange={(e) => patch("payments.subtitle", e.target.value)} /></label>
        <ListEditor items={L.payments.items} onChange={(v) => patch("payments.items", v)} />
      </div>

      <div className="admin-block">
        <h3>Этапы</h3>
        <label>Заголовок<input value={L.steps.title} onChange={(e) => patch("steps.title", e.target.value)} /></label>
        <label>Подзаголовок<input value={L.steps.subtitle} onChange={(e) => patch("steps.subtitle", e.target.value)} /></label>
        <ListEditor
          items={L.steps.items}
          onChange={(v) => patch("steps.items", v)}
          fields={[
            { key: "title", label: "Название" },
            { key: "text", label: "Описание", multiline: true },
          ]}
        />
      </div>

      <div className="admin-block">
        <h3>Кураторы</h3>
        <label>Заголовок<input value={L.support.title} onChange={(e) => patch("support.title", e.target.value)} /></label>
        <label>Текст<textarea value={L.support.text} onChange={(e) => patch("support.text", e.target.value)} rows={3} /></label>
        <ListEditor
          items={L.support.curators}
          onChange={(v) => patch("support.curators", v)}
          fields={[
            { key: "name", label: "Имя" },
            { key: "role", label: "Роль" },
          ]}
        />
      </div>

      <div className="admin-block">
        <h3>FAQ</h3>
        <label>Заголовок<input value={L.faq.title} onChange={(e) => patch("faq.title", e.target.value)} /></label>
        <ListEditor
          items={L.faq.items}
          onChange={(v) => patch("faq.items", v)}
          fields={[
            { key: "q", label: "Вопрос" },
            { key: "a", label: "Ответ", multiline: true },
          ]}
        />
      </div>

      <div className="admin-block">
        <h3>Отзывы</h3>
        <label>Заголовок<input value={L.reviews.title} onChange={(e) => patch("reviews.title", e.target.value)} /></label>
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

      <div className="admin-block">
        <h3>Форма и footer</h3>
        <div className="admin-grid">
          <label>Заголовок формы<input value={L.form.title} onChange={(e) => patch("form.title", e.target.value)} /></label>
          <label>Требования — заголовок<input value={L.form.requirementsTitle} onChange={(e) => patch("form.requirementsTitle", e.target.value)} /></label>
          <label>Submit<input value={L.form.submit} onChange={(e) => patch("form.submit", e.target.value)} /></label>
          <label>Success<input value={L.form.success} onChange={(e) => patch("form.success", e.target.value)} /></label>
        </div>
        <ListEditor items={L.form.requirements} onChange={(v) => patch("form.requirements", v)} />
        <label>Copyright<input value={L.footer.copyright} onChange={(e) => patch("footer.copyright", e.target.value)} style={{ width: "100%", marginTop: 12 }} /></label>
        <label>SEO<textarea value={L.footer.seo} onChange={(e) => patch("footer.seo", e.target.value)} rows={2} style={{ width: "100%" }} /></label>
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
  } = useSite();

  const [tab, setTab] = useState("brand");
  const [draft, setDraft] = useState(data);
  const [saved, setSaved] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  function save() {
    const next = { ...draft };
    if (newPassword.trim()) next.adminPassword = newPassword.trim();
    updateData(next).then((saved) => {
      setDraft(saved);
      setNewPassword("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = importData(reader.result);
        setDraft(parsed);
      } catch {
        alert("Неверный JSON");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="admin-page admin-layout">
      <aside className="admin-sidebar">
        <h2>LifeGift Admin</h2>
        <nav className="admin-nav">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={tab === t.id ? "active" : ""}
              onClick={() => setTab(t.id)}
            >
              {t.label}
              {t.id === "submissions" ? ` (${submissions.length})` : ""}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <Link to="/" target="_blank">↗ Открыть сайт</Link>
          <button type="button" onClick={logout}>Выйти</button>
        </div>
      </aside>

      <main className="admin-main">
        <div className="admin-header">
          <h1>{TABS.find((t) => t.id === tab)?.label}</h1>
          <button type="button" className="admin-save" onClick={save}>
            {saved ? "Сохранено ✓" : "Сохранить"}
          </button>
        </div>

        {tab === "brand" && (
          <div className="admin-grid">
            <label>Название<input value={draft.brand.name} onChange={(e) => setDraft({ ...draft, brand: { ...draft.brand, name: e.target.value } })} /></label>
            <label>Подзаголовок<input value={draft.brand.subtitle} onChange={(e) => setDraft({ ...draft, brand: { ...draft.brand, subtitle: e.target.value } })} /></label>
            <label>Акцент<input type="color" value={draft.theme.accent} onChange={(e) => setDraft({ ...draft, theme: { ...draft.theme, accent: e.target.value } })} /></label>
            <label>Светлый<input type="color" value={draft.theme.accentLight} onChange={(e) => setDraft({ ...draft, theme: { ...draft.theme, accentLight: e.target.value } })} /></label>
            <label>Тёмный<input type="color" value={draft.theme.dark} onChange={(e) => setDraft({ ...draft, theme: { ...draft.theme, dark: e.target.value } })} /></label>
            <label>Фон<input type="color" value={draft.theme.surface} onChange={(e) => setDraft({ ...draft, theme: { ...draft.theme, surface: e.target.value } })} /></label>
          </div>
        )}

        {tab === "contacts" && (
          <div className="admin-grid">
            <label>Телефон<input value={draft.contacts.phone} onChange={(e) => setDraft({ ...draft, contacts: { ...draft.contacts, phone: e.target.value } })} /></label>
            <label>Email<input value={draft.contacts.email} onChange={(e) => setDraft({ ...draft, contacts: { ...draft.contacts, email: e.target.value } })} /></label>
          </div>
        )}

        {tab === "ru" && <LangEditor langKey="ru" draft={draft} setDraft={setDraft} />}
        {tab === "kg" && <LangEditor langKey="kg" draft={draft} setDraft={setDraft} />}

        {tab === "submissions" && (
          <>
            <button type="button" className="admin-add" style={{ maxWidth: 240, marginBottom: 16 }} onClick={clearAllSubmissions}>
              Очистить все заявки
            </button>
            {submissions.length === 0 ? (
              <p style={{ color: "#94a3b8" }}>Заявок пока нет</p>
            ) : (
              submissions.map((s) => (
                <div className="sub-card" key={s.id}>
                  <header>
                    <strong>{s.name}</strong>
                    <time style={{ color: "#94a3b8", fontSize: 12 }}>{new Date(s.createdAt).toLocaleString("ru-RU")}</time>
                  </header>
                  <p>📞 {s.phone}</p>
                  {s.email && <p>✉ {s.email}</p>}
                  {s.message && <p>💬 {s.message}</p>}
                  <p>Язык: {s.lang?.toUpperCase()}</p>
                  <button type="button" className="admin-row-actions" style={{ marginTop: 8 }} onClick={() => removeSubmission(s.id)}>
                    Удалить
                  </button>
                </div>
              ))
            )}
          </>
        )}

        {tab === "settings" && (
          <>
            <div className="admin-block">
              <h3>Пароль</h3>
              <label>Новый пароль<input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Оставьте пустым, чтобы не менять" /></label>
            </div>
            <div className="admin-block">
              <h3>Экспорт / Импорт</h3>
              <button type="button" onClick={() => {
                const blob = new Blob([exportData()], { type: "application/json" });
                const a = document.createElement("a");
                a.href = URL.createObjectURL(blob);
                a.download = "site-data.json";
                a.click();
              }}>Скачать JSON</button>
              <label style={{ display: "block", marginTop: 12 }}>Загрузить JSON<input type="file" accept=".json" onChange={handleImport} /></label>
            </div>
            <div className="admin-block">
              <h3>Сброс</h3>
              <button type="button" onClick={() => {
                if (confirm("Сбросить все данные?")) {
                  resetData().then(setDraft);
                }
              }}>
                Сбросить к начальным
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function AdminPage() {
  const { isAdmin } = useSite();
  return isAdmin ? <AdminDashboard /> : <LoginForm />;
}
