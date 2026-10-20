import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { useL } from "./ctx.js";
import { customers, categories, fonts, defaults, icons, linkHref, linkLabel, resolveSlug, SITE } from "./config.js";

const T = {
  ar: { back: "كل الأماكن", hours: "ساعات العمل", noLinks: "لم تتم إضافة روابط بعد.", powered: "بدعم من Tap In", nf: "لم نجد هذه الصفحة.", qr: "رمز QR" },
  en: { back: "All places", hours: "Opening hours", noLinks: "No links have been added yet.", powered: "Powered by Tap In", nf: "We couldn't find this page.", qr: "QR code" },
};

export function Icon({ name, size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={icons[name] || icons.pin} />
    </svg>
  );
}

export function setMeta(title, desc, noindex) {
  document.title = title;
  let m = document.querySelector('meta[name="description"]');
  if (m && desc) m.content = desc;
  let r = document.querySelector('meta[name="robots"]');
  if (!r) { r = document.createElement("meta"); r.name = "robots"; document.head.appendChild(r); }
  r.content = noindex ? "noindex" : "index,follow";
}

export default function Customer() {
  const { slug } = useParams();
  const { lang } = useL();
  const t = T[lang];
  const real = resolveSlug(slug);
  const c = customers.find((x) => x.slug === real);

  useEffect(() => {
    if (c) setMeta(`${c.name[lang]} | Tap In`, c.tagline[lang], false);
    else setMeta("Tap In", "", true);
  }, [c, lang]);

  if (real !== slug) return <Navigate to={`/place/${real}`} replace />;
  if (!c) return <section className="sec"><p>{t.nf}</p><Link className="btn ghost" to="/">{t.back}</Link></section>;

  const th = { ...defaults, ...c.theme };
  const cat = categories[c.category] || categories.other;
  const style = {
    "--deep": th.accent, "--bright": th.accent2, "--navy": th.text, "--bg": th.bg, "--r": th.radius + "px",
    "--ff": fonts[th.font].css, "--hf": fonts[th.headingFont || th.font].css, "--icon": th.iconSize + "px", textAlign: th.align,
  };
  const links = c.links.filter((l) => l.visible !== false && linkHref(l));
  const blocks = {
    about: () => c.description?.[lang] && <p key="about" className="about">{c.description[lang]}</p>,
    hours: () => c.hours?.[lang] && <div key="hours" className="hours"><b>{t.hours}</b><span>{c.hours[lang]}</span></div>,
    links: () => (
      <div key="links" className="links">
        {links.length === 0 && <p className="empty">{t.noLinks}</p>}
        {links.map((l, i) => (
          <a key={l.kind + i} className={`btn link ${th.buttons === "outline" || (th.buttons === "gradient" && i > 0) ? "" : "solid"} ${th.buttons === "solid" ? "flat" : ""}`}
            href={linkHref(l)} target={l.kind === "call" || l.kind === "email" ? undefined : "_blank"} rel="noreferrer">
            {linkLabel(l, lang)}
          </a>
        ))}
      </div>
    ),
  };

  return (
    <section className="cust" style={style} data-shape={th.iconShape}>
      <Link to="/" className="back">{t.back}</Link>
      <div className="biz-icon">
        {c.logo ? <img src={c.logo} alt={c.name[lang]} /> : <Icon name={c.icon || cat.icon} size={Math.round(th.iconSize * 0.5)} />}
      </div>
      <small>{cat[lang]}</small>
      <h1>{c.name[lang]}</h1>
      <p className="tag">{c.tagline[lang]}</p>
      {c.sections.filter((s) => s.visible !== false).map((s) => blocks[s.id]?.())}
      <p className="powered">{t.powered} · <Link to={`/place/${c.slug}/qr`}>{t.qr}</Link></p>
    </section>
  );
}
