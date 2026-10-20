import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import QRCode from "qrcode";
import { useL } from "./ctx.js";
import { customers, SITE } from "./config.js";
import { setMeta } from "./Customer.jsx";

const T = {
  ar: { h: "رمز QR", fg: "لون الرمز", bg: "لون الخلفية", size: "الحجم (بكسل)", src: "اسم مكان الوضع (اختياري، مثل: الطاولة)", png: "تحميل PNG", svg: "تحميل SVG", warn: "التباين ضعيف وقد لا يُمسح الرمز. استخدم رمزًا داكنًا على خلفية فاتحة.", err: "تعذر إنشاء الرمز.", dest: "الرابط المُرمَّز" },
  en: { h: "QR code", fg: "Code color", bg: "Background color", size: "Size (px)", src: "Placement name (optional, e.g. table)", png: "Download PNG", svg: "Download SVG", warn: "Low contrast: this code may not scan. Use a dark code on a light background.", err: "Could not generate the code.", dest: "Encoded link" },
};
const lum = (h) => { const [r, g, b] = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

export default function Qr() {
  const { slug } = useParams();
  const { lang } = useL();
  const t = T[lang];
  const c = customers.find((x) => x.slug === slug);
  const [fg, setFg] = useState("#0F1A3D"), [bg, setBg] = useState("#FFFFFF"), [size, setSize] = useState(1024), [src, setSrc] = useState("");
  const [png, setPng] = useState(""), [err, setErr] = useState(false);
  const url = `${SITE}/place/${slug}${src.trim() ? `?src=${encodeURIComponent(src.trim())}` : ""}`;
  const opts = { margin: 2, errorCorrectionLevel: "M", color: { dark: fg, light: bg } };
  const bad = ratio(fg, bg) < 4 || lum(fg) >= lum(bg);

  useEffect(() => setMeta("QR | Tap In", "", true), []);
  useEffect(() => {
    setErr(false);
    QRCode.toDataURL(url, { ...opts, width: Math.min(Math.max(+size || 512, 256), 4096) }).then(setPng).catch(() => setErr(true));
  }, [url, fg, bg, size]);

  async function dlSvg() {
    const s = await QRCode.toString(url, { ...opts, type: "svg" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([s], { type: "image/svg+xml" }));
    a.download = `tapin-${slug}-qr.svg`; a.click();
  }
  if (!c) return <section className="sec"><p>—</p></section>;
  return (
    <section className="cust">
      <h1>{t.h}: {c.name[lang]}</h1>
      {err ? <p role="alert">{t.err}</p> : png && <img className="qr" src={png} alt={`${t.h} ${c.name[lang]}`} />}
      {bad && <p role="alert" className="warn">{t.warn}</p>}
      <div className="form">
        <label>{t.fg}<input type="color" value={fg} onChange={(e) => setFg(e.target.value.toUpperCase())} /></label>
        <label>{t.bg}<input type="color" value={bg} onChange={(e) => setBg(e.target.value.toUpperCase())} /></label>
        <label>{t.size}<input type="number" min="256" max="4096" step="128" value={size} onChange={(e) => setSize(e.target.value)} /></label>
        <label>{t.src}<input type="text" value={src} onChange={(e) => setSrc(e.target.value)} maxLength="40" /></label>
      </div>
      <p className="powered" dir="ltr">{t.dest}: {url}</p>
      <div className="links">
        <a className="btn link solid" href={png} download={`tapin-${slug}-qr.png`}>{t.png}</a>
        <button className="btn link" onClick={dlSvg}>{t.svg}</button>
      </div>
    </section>
  );
}
