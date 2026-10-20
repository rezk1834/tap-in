import { createContext, useContext, useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Link, useParams, useLocation } from "react-router-dom";
import { copy, WHATSAPP } from "./data.js";
import { customers, categories } from "./config.js";

import { Ctx, useL } from "./ctx.js";
import Customer from "./Customer.jsx";
import Qr from "./Qr.jsx";

function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem("lang") || "ar");
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("lang", lang);
  }, [lang]);
  return <Ctx.Provider value={{ lang, setLang, t: copy[lang] }}>{children}</Ctx.Provider>;
}

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

function Header() {
  const { lang, setLang, t } = useL();
  return (
    <header className="bar">
      <Link to="/"><img className="logo" src="/logo.svg" alt="Tap In" /></Link>
      <button className="lang" onClick={() => setLang(lang === "en" ? "ar" : "en")}>{t.nav}</button>
    </header>
  );
}

const waLink = (text) => `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;

function Footer() {
  const { t } = useL();
  return (
    <footer className="foot">
      <a className="btn solid" href={waLink(t.wa)} target="_blank" rel="noreferrer">{t.cta}</a>
      <p>© Tap In · tapineg.site</p>
    </footer>
  );
}

function Home() {
  const { lang, t } = useL();
  return (
    <>
      <section className="hero">
        <div className="hero-text">
          <h1>{t.heroTitle}</h1>
          <p>{t.heroText}</p>
          <div className="row">
            <a className="btn solid" href={waLink(t.wa)} target="_blank" rel="noreferrer">{t.cta}</a>
            <a className="btn ghost" href="#places">{t.listTitle}</a>
          </div>
        </div>
        <div className="tap" aria-hidden="true">
          <span className="ring r1" /><span className="ring r2" /><span className="ring r3" />
          <div className="card-vis"><img src="/logo.svg" alt="" /></div>
          <div className="phone" />
        </div>
      </section>

      <section className="sec tint">
        <h2>{t.howTitle}</h2>
        <ol className="steps">
          {t.steps.map(([h, p], i) => (
            <li key={i}><b>{h}</b><span>{p}</span></li>
          ))}
        </ol>
      </section>

      <section className="sec">
        <h2>{t.whyTitle}</h2>
        <div className="why">
          {t.why.map(([h, p]) => (<div key={h}><b>{h}</b><span>{p}</span></div>))}
        </div>
      </section>

      <section className="sec navy" id="places">
        <h2>{t.listTitle}</h2>
        <p className="sub">{t.listText}</p>
        <div className="grid">
          {customers.map((c) => (
            <Link key={c.slug} to={`/place/${c.slug}`} className="place">
              <small>{categories[c.category][lang]}</small>
              <strong>{c.name[lang]}</strong>
              <span>{c.tagline[lang]}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

export default function App() {
  return (
    <LangProvider>
      <BrowserRouter>
        <ScrollTop />
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/place/:slug" element={<Customer />} />
            <Route path="/place/:slug/qr" element={<Qr />} />
            <Route path="/:slug" element={<Customer />} />
          </Routes>
        </main>
        <Footer />
      </BrowserRouter>
    </LangProvider>
  );
}
