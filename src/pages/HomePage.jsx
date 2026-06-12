import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import WhatsAppWidget from "../components/WhatsAppWidget";
import { useSite } from "../context/SiteContext";

export default function HomePage() {
  const { data, submitLead } = useSite();
  const [lang, setLang] = useState("ru");
  const [navOpen, setNavOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);
  const [toast, setToast] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [phoneError, setPhoneError] = useState("");

  const L = data[lang];

  useEffect(() => {
    document.title = L.meta.title;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.content = L.meta.description;
    else {
      const el = document.createElement("meta");
      el.name = "description";
      el.content = L.meta.description;
      document.head.appendChild(el);
    }
  }, [L.meta, lang]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.phone.replace(/\D/g, "").length < 9) {
      setPhoneError(lang === "ru" ? "Введите корректный номер" : "Телефон номерин туура киргизиңиз");
      return;
    }
    setPhoneError("");
    try {
      await submitLead({ ...form, lang });
      setForm({ name: "", phone: "", email: "", message: "" });
      setToast(L.form.success);
      setTimeout(() => setToast(""), 4000);
    } catch {
      setPhoneError(lang === "ru" ? "Ошибка отправки. Попробуйте позже." : "Жөнөтүүдө ката. Кийинчерээк кайра аракет кылыңыз.");
    }
  }

  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <Link className="brand" to="/">
            <div className="brand-mark">{data.brand.name.slice(0, 2).toUpperCase()}</div>
            <div className="brand-text">
              <strong>{data.brand.name}</strong>
              <span>{data.brand.subtitle}</span>
            </div>
          </Link>
          <nav className={`topbar-nav ${navOpen ? "open" : ""}`}>
            <a href="#about" onClick={() => setNavOpen(false)}>{L.nav.about}</a>
            <a href="#pay" onClick={() => setNavOpen(false)}>{L.nav.pay}</a>
            <a href="#steps" onClick={() => setNavOpen(false)}>{L.nav.steps}</a>
            <a href="#faq" onClick={() => setNavOpen(false)}>{L.nav.faq}</a>
            <a href="#form" onClick={() => setNavOpen(false)}>{L.nav.form}</a>
          </nav>
          <div className="topbar-actions">
            <a className="phone-link" href={`tel:${data.contacts.phone.replace(/\s/g, "")}`}>{data.contacts.phone}</a>
            <div className="lang-switch">
              <button type="button" className={lang === "ru" ? "active" : ""} onClick={() => setLang("ru")}>RU</button>
              <button type="button" className={lang === "kg" ? "active" : ""} onClick={() => setLang("kg")}>KG</button>
            </div>
            <button type="button" className="menu-toggle" onClick={() => setNavOpen((v) => !v)}>☰</button>
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="hero-bg" />
        <div className="hero-grid">
          <div>
            <div className="hero-badge">{L.hero.badge}</div>
            <h1 className="serif">{L.hero.title}</h1>
            <p className="hero-sub">{L.hero.subtitle}</p>
            <a className="btn btn-primary" href="#form">{L.hero.cta}</a>
          </div>
          <div className="hero-card">
            <h3>{lang === "ru" ? "Ключевые цифры" : "Негизги сандар"}</h3>
            <div className="stat-grid">
              {L.hero.stats.map((s) => (
                <div className="stat-item" key={s.label}>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="about">
        <div className="section-inner">
          <div className="section-head center">
            <span className="section-label">{L.nav.about}</span>
            <h2 className="serif">{L.why.title}</h2>
            <p>{L.why.text}</p>
          </div>
          <div className="feature-grid">
            {L.why.features.map((f) => (
              <article className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-dark" id="pay">
        <div className="section-inner">
          <div className="section-head center">
            <span className="section-label">{L.nav.pay}</span>
            <h2 className="serif">{L.payments.title}</h2>
            <p>{L.payments.subtitle}</p>
          </div>
          <div className="pay-grid">
            {L.payments.items.map((item) => (
              <div className="pay-item" key={item}>{item}</div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="steps">
        <div className="section-inner">
          <div className="section-head center">
            <span className="section-label">{L.nav.steps}</span>
            <h2 className="serif">{L.steps.title}</h2>
            <p>{L.steps.subtitle}</p>
          </div>
          <div className="steps-track">
            {L.steps.items.map((step, i) => (
              <article className="step-card" key={step.title}>
                <div className="step-num">{i + 1}</div>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner support-layout">
          <div className="section-head">
            <span className="section-label">{lang === "ru" ? "Поддержка" : "Колдоо"}</span>
            <h2 className="serif">{L.support.title}</h2>
            <p>{L.support.text}</p>
            <a className="btn btn-primary" href={`mailto:${data.contacts.email}`} style={{ marginTop: 20 }}>
              {lang === "ru" ? "Написать нам" : "Бизге жазуу"}
            </a>
          </div>
          <div className="curator-grid">
            {L.support.curators.map((c) => (
              <div className="curator-card" key={c.name}>
                <div className="curator-avatar">{c.name.charAt(0)}</div>
                <div>
                  <strong>{c.name}</strong>
                  <span>{c.role}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="faq" style={{ background: "#eef2ff" }}>
        <div className="section-inner">
          <div className="section-head center">
            <span className="section-label">FAQ</span>
            <h2 className="serif">{L.faq.title}</h2>
          </div>
          <div className="faq-list">
            {L.faq.items.map((item, i) => (
              <div className={`faq-item ${openFaq === i ? "open" : ""}`} key={item.q}>
                <button type="button" className="faq-q" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                  <span>{item.q}</span>
                  <span>+</span>
                </button>
                <div className="faq-a">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="section-inner">
          <div className="section-head center">
            <span className="section-label">{lang === "ru" ? "Отзывы" : "Пикирлер"}</span>
            <h2 className="serif">{L.reviews.title}</h2>
          </div>
          <div className="reviews-grid">
            {L.reviews.items.map((r) => (
              <article className="review-card" key={`${r.name}-${r.city}`}>
                <div className="review-top">
                  <div className="review-avatar">{r.name}</div>
                  <div className="review-meta">
                    <strong>{r.name}</strong>
                    <span>{r.city}</span>
                  </div>
                </div>
                <p className="review-text">«{r.text}»</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section" id="form">
        <div className="section-inner">
          <div className="form-layout">
            <div className="req-box">
              <h3>{L.form.requirementsTitle}</h3>
              <ul className="req-list">
                {L.form.requirements.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            </div>
            <div className="form-box">
              <h3>{L.form.title}</h3>
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value.replace(/\d/g, "") })}
                    placeholder={L.form.namePh}
                  />
                </div>
                <div className={`field ${phoneError ? "error" : ""}`}>
                  <input
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+996 XXX XXX XXX"
                  />
                  {phoneError && <div className="error-text">{phoneError}</div>}
                </div>
                <div className="field">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder={L.form.emailPh}
                  />
                </div>
                <div className="field">
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder={L.form.messagePh}
                  />
                </div>
                <button className="btn btn-primary" type="submit" style={{ width: "100%" }}>
                  {L.form.submit}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-contacts">
            <a href={`tel:${data.contacts.phone.replace(/\s/g, "")}`}>{data.contacts.phone}</a>
            <a href={`mailto:${data.contacts.email}`}>{data.contacts.email}</a>
          </div>
          <div className="footer-copy">{L.footer.copyright}</div>
        </div>
        <div className="footer-seo">{L.footer.seo}</div>
      </footer>

      {toast && <div className="toast">{toast}</div>}

      <WhatsAppWidget whatsapp={data.whatsapp} lang={lang} />
    </>
  );
}
