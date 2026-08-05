"use client";
import { useState, useMemo, useEffect, useRef } from "react";

const C = { accent: "#72F94C", accentDark: "#4AD42F", dark: "#0f0f1a", darkMid: "#1a1a2e", darkLight: "#16213e" };
const UNTOLD_API_URL = "https://script.google.com/macros/s/AKfycbwkG2HshB4Eh-OXWmynenhfos6a4oPKriMfmwcBbrLkm4su0zGNkjcBtB0FEz3Lx-8ELA/exec";
const UNTOLD_WHATSAPP_GROUP = "https://chat.whatsapp.com/JwKziJ2soz90V00Z7b9vJl";
// Poziţii cu training de departament fix, fără rezervare. Trebuie ţinut sincronizat
// cu TRAINING_DEPT_FIX din backend, care respinge şi rezervările făcute direct.
const U_TRAINING_FIX = {
  "HelpDesk": "Miercuri, 5 August 2026, 18:30",
  "Lockers":  "Miercuri, 5 August 2026, 17:00",
};
// Poziţii care nu fac trainingul de SSM şi PSI — rândul nu se afişează deloc.
// Sincronizat cu POZITII_FARA_SSM din backend, care respinge şi rezervarea directă.
const U_FARA_SSM = ["Lockers"];

// Apps Script raspunde uneori cu o pagina HTML in loc de JSON: sub incarcare,
// cand executiile se aglomereaza, sau la o redirectionare esuata. E aleator si
// loveste orice utilizator. Reincercam de cateva ori inainte sa dam eroare.
async function uFetchJson(url, incercari) {
  incercari = incercari || 3;
  let ultimaEroare = null;
  for (let i = 0; i < incercari; i++) {
    try {
      const sep = url.indexOf("?") >= 0 ? "&" : "?";
      const resp = await fetch(url + sep + "t=" + Date.now() + "_" + i,
                               { method: "GET", cache: "no-store", credentials: "omit" });
      const text = await resp.text();
      try {
        return JSON.parse(text);
      } catch (parseErr) {
        ultimaEroare = text.slice(0, 80);
        // raspuns HTML - asteptam putin si reincercam
        if (i < incercari - 1) await new Promise(r => setTimeout(r, 700 * (i + 1)));
      }
    } catch (netErr) {
      ultimaEroare = netErr.message;
      if (i < incercari - 1) await new Promise(r => setTimeout(r, 700 * (i + 1)));
    }
  }
  return { success: false, _parseFail: true, error: "Nu am primit raspuns de la server (pagina). Detalii: " + String(ultimaEroare || "").slice(0, 60), _detalii: ultimaEroare };
}

// Ultimul status cunoscut, tinut local. Il afisam INSTANT la deschidere,
// apoi improspatam in fundal. Fara asta, omul se uita la un ecran gol cat
// dureaza raspunsul Apps Script - uneori peste 10 secunde pe telefon.
const U_STATUS_CACHE = "untold_status_cache";

function uSalveazaStatus(st) {
  try { window.localStorage.setItem(U_STATUS_CACHE, JSON.stringify({ t: Date.now(), st: st })); } catch (e) {}
}
function uCitesteStatus() {
  try {
    const raw = window.localStorage.getItem(U_STATUS_CACHE);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (!o || !o.st) return null;
    // mai vechi de 24h: nu-l mai aratam
    if (Date.now() - (o.t || 0) > 24 * 3600 * 1000) return null;
    return o.st;
  } catch (e) { return null; }
}

// Curata tot ce tine browserul in cache pentru site, PASTRAND logarea.
// Fara asta, oamenii raman pe o versiune veche a paginii si cred ca portalul e stricat;
// singura solutie era sa-si goleasca manual datele din browser si sa se logheze din nou.
async function uReincarcaCurat() {
  let phone = null, cnp = null;
  try {
    phone = window.localStorage.getItem("untold_login_phone");
    cnp = window.localStorage.getItem("untold_login_cnp");
  } catch (e) {}

  try { window.localStorage.clear(); } catch (e) {}
  try { window.sessionStorage.clear(); } catch (e) {}

  // Cookie-urile proprii (cele httpOnly nu pot fi atinse din JS)
  try {
    document.cookie.split(";").forEach(function (c) {
      const nume = c.split("=")[0].trim();
      if (!nume) return;
      const parti = window.location.hostname.split(".");
      ["/", window.location.pathname].forEach(function (cale) {
        document.cookie = nume + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=" + cale;
        for (let i = 0; i < parti.length - 1; i++) {
          const dom = "." + parti.slice(i).join(".");
          document.cookie = nume + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=" + cale + ";domain=" + dom;
        }
      });
    });
  } catch (e) {}

  // Cache Storage si service workers - aici sta de obicei versiunea veche
  try {
    if (window.caches && caches.keys) {
      const chei = await caches.keys();
      await Promise.all(chei.map(function (k) { return caches.delete(k); }));
    }
  } catch (e) {}
  try {
    if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(function (r) { return r.unregister(); }));
    }
  } catch (e) {}

  // Pun logarea la loc. NU si cache-ul de date: butonul asta exista tocmai
  // ca sa forteze date proaspete.
  try {
    if (phone) window.localStorage.setItem("untold_login_phone", phone);
    if (cnp) window.localStorage.setItem("untold_login_cnp", cnp);
  } catch (e) {}

  // Reincarc ocolind cache-ul: parametrul schimba URL-ul, deci nu se serveste din cache
  const u = new URL(window.location.href);
  u.searchParams.set("r", Date.now().toString(36));
  window.location.replace(u.toString());
}

function UReincarcaButton({ style }) {
  const [busy, setBusy] = useState(false);
  return (
    <button
      onClick={async () => {
        if (busy) return;
        setBusy(true);
        try { await uReincarcaCurat(); } catch (e) { window.location.reload(); }
      }}
      title="Goleste memoria browserului si reincarca pagina. Ramai logat."
      style={Object.assign({
        background: "rgba(124,77,255,0.12)", border: "1px solid rgba(124,77,255,0.35)",
        borderRadius: 8, padding: "6px 12px", fontSize: 11, color: "#B39DFF",
        cursor: busy ? "default" : "pointer", whiteSpace: "nowrap",
      }, style || {})}
    >{busy ? "Se reincarca..." : "\u21bb Reincarca"}</button>
  );
}
const VIEWS = { HOME: "home", APPLY: "apply", STATUS: "status", SHIFTS: "shifts", TEAM: "team", ADMIN: "admin" };

function Nav({ view, setView, hasShifts, hasTeam, isAdmin, accent, accentDark }) {
  // Default colors (Beach Please verde) dacă nu sunt date
  const navAccent = accent || "#72F94C";
  const navAccentDark = accentDark || "#4AD42F";
  const navAccentRGB = navAccent === "#72F94C" ? "114,249,76" : "233,29,99";
  
  const buttons = [
    { v: VIEWS.HOME, l: "Acasă" },
    { v: VIEWS.APPLY, l: "Aplică" },
    { v: VIEWS.STATUS, l: "Status" },
  ];
  if (hasShifts) buttons.push({ v: VIEWS.SHIFTS, l: "Turele mele" });
  if (hasTeam) buttons.push({ v: VIEWS.TEAM, l: "Echipa mea" });
  if (isAdmin) buttons.push({ v: VIEWS.ADMIN, l: "Admin" });
  
  // Pe ecran mai îngust (sub 600px), ascundem brand-ul ca să încapă tab-urile
  const compactBrand = buttons.length > 4;
  
  // Detectăm dacă suntem pe un subdomain (pentru butonul de back)
  const isOnSubdomain = typeof window !== "undefined" && 
    (window.location.hostname.startsWith("kapital.") || 
     window.location.hostname.startsWith("beachplease.") || 
     window.location.hostname.startsWith("untold."));
  
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(15,15,26,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 12px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, gap: 8 }}>
        <button onClick={() => setView(VIEWS.HOME)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: `linear-gradient(135deg, ${navAccent}, ${navAccentDark})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", fontWeight: 700 }}>C</div>
          <span style={{ 
            fontSize: 13, fontWeight: 600, color: "#fff", letterSpacing: "0.02em",
            display: compactBrand ? "none" : "inline",
          }} className="nav-brand-text">Cashless</span>
        </button>
        <div style={{ display: "flex", gap: 2, justifyContent: "flex-end", overflow: "hidden", flex: 1, alignItems: "center" }}>
          {buttons.map(b => (
            <button key={b.v} onClick={() => setView(b.v)} style={{
              background: view === b.v ? `rgba(${navAccentRGB},0.15)` : "transparent",
              border: view === b.v ? `1px solid rgba(${navAccentRGB},0.3)` : "1px solid transparent",
              borderRadius: 18, padding: "6px 10px", fontSize: 12, fontWeight: 500, cursor: "pointer",
              color: view === b.v ? navAccent : "rgba(232,230,227,0.6)",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}>{b.l}</button>
          ))}
          {isOnSubdomain && (
            <a 
              href="https://angajarifestival.ro" 
              title="Înapoi la toate festivalurile"
              onClick={(e) => {
                // Force full page reload (nu doar pushState)
                e.preventDefault();
                window.location.href = "https://angajarifestival.ro";
              }}
              style={{
                marginLeft: 4,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 18, padding: "6px 10px", fontSize: 12, fontWeight: 500,
                color: "rgba(232,230,227,0.5)",
                textDecoration: "none",
                whiteSpace: "nowrap",
                flexShrink: 0,
                cursor: "pointer",
              }}
            >← Toate</a>
          )}
        </div>
      </div>
    </nav>
  );
}


const STEPS = ["Date personale", "Screening", "Date CI", "Confirmare"];

function FormField({ label, required, children, error, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "rgba(232,230,227,0.7)", marginBottom: 6 }}>
        {label} {required && <span style={{ color: C.accent }}>*</span>}
      </label>
      {hint && <div style={{ fontSize: 11, color: "rgba(232,230,227,0.4)", marginBottom: 6, lineHeight: 1.45 }}>{hint}</div>}
      {children}
      {error && <div style={{ fontSize: 12, color: "#ff6b6b", marginTop: 4 }}>{error}</div>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", style: customStyle, ...props }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10, padding: "12px 14px", fontSize: 15, color: "#e8e6e3", outline: "none",
        boxSizing: "border-box", transition: "border-color 0.2s",
        ...(customStyle || {}),
      }}
      onFocus={e => { if (!props.readOnly) e.target.style.borderColor = "rgba(114,249,76,0.4)"; }}
      onBlur={e => { if (!props.readOnly) e.target.style.borderColor = "rgba(255,255,255,0.1)"; }}
      {...props}
    />
  );
}

function Select({ value, onChange, options, placeholder }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10, padding: "12px 14px", fontSize: 15, color: value ? "#e8e6e3" : "rgba(232,230,227,0.4)",
        outline: "none", boxSizing: "border-box", appearance: "none",
      }}>
      <option value="" style={{ background: "#1a1a2e" }}>{placeholder}</option>
      {options.map(o => <option key={o} value={o} style={{ background: "#1a1a2e" }}>{o}</option>)}
    </select>
  );
}

function TextArea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{
        width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10, padding: "12px 14px", fontSize: 15, color: "#e8e6e3", outline: "none",
        boxSizing: "border-box", resize: "vertical", fontFamily: "inherit",
      }}
      onFocus={e => e.target.style.borderColor = "rgba(114,249,76,0.4)"}
      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
    />
  );
}

// Parsare CNP românesc → returnează {sex: "M"|"F", dataNasterii: "YYYY-MM-DD"} sau null
function parseCNP(cnp) {
  if (!cnp || cnp.length !== 13 || !/^\d{13}$/.test(cnp)) return null;
  const s = parseInt(cnp[0]);
  // Sex: cifrele impare (1,3,5,7,9) = M; pare (2,4,6,8) = F
  const sex = (s % 2 === 1) ? "M" : "F";
  // Secol în funcție de prima cifră
  let secol;
  if (s === 1 || s === 2) secol = 1900;
  else if (s === 3 || s === 4) secol = 1800;
  else if (s === 5 || s === 6) secol = 2000;
  else if (s === 7 || s === 8 || s === 9) {
    // Rezident străin - fără cetățenie. Estimăm pe baza anului
    const yy = parseInt(cnp.substring(1, 3));
    secol = yy <= 30 ? 2000 : 1900;
  } else return null;
  
  const yy = parseInt(cnp.substring(1, 3));
  const mm = parseInt(cnp.substring(3, 5));
  const dd = parseInt(cnp.substring(5, 7));
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) return null;
  
  const an = secol + yy;
  const dataNasterii = `${an}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`;
  return { sex, dataNasterii };
}


// ============================================
// SIGNATURE PAD MODAL
// ============================================

function SignaturePadModal({ isOpen, onClose, onSave, title, docName }) {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    // Setup canvas
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = "#0a0a0a";
    // Fill white background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
    setError(null);
  }, [isOpen]);

  function getEventPos(e) {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    if (e.touches && e.touches[0]) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function startDrawing(e) {
    e.preventDefault();
    setIsDrawing(true);
    const ctx = canvasRef.current.getContext("2d");
    const pos = getEventPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const pos = getEventPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    setHasDrawn(true);
  }

  function stopDrawing(e) {
    if (e) e.preventDefault();
    setIsDrawing(false);
  }

  function clearSignature() {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const rect = canvas.getBoundingClientRect();
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
    setError(null);
  }

  function saveSignature() {
    if (!hasDrawn) {
      setError("Te rog desenează semnătura ta.");
      return;
    }
    const canvas = canvasRef.current;
    // Generate PNG with white background trimmed (we already have white BG)
    const dataUrl = canvas.toDataURL("image/png");
    const base64 = dataUrl.split(",")[1];
    onSave(base64);
  }

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 12,
    }} onClick={onClose}>
      <div style={{
        background: C.darkMid, borderRadius: 16, padding: 20, maxWidth: 480, width: "100%",
        border: "1px solid rgba(255,255,255,0.1)",
      }} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 12, color: "rgba(232,230,227,0.5)", marginBottom: 16 }}>
          Document: {docName}
        </div>
        <div style={{ fontSize: 11, color: "rgba(232,230,227,0.45)", marginBottom: 8, lineHeight: 1.5 }}>
          Desenează semnătura ta în spațiul de mai jos. Folosește mouse-ul (desktop) sau degetul (mobil).
        </div>
        <canvas
          ref={canvasRef}
          style={{
            width: "100%", height: 180, background: "#ffffff",
            borderRadius: 10, border: "1px solid rgba(255,255,255,0.15)",
            touchAction: "none", display: "block",
          }}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {error && <div style={{ fontSize: 12, color: "#ff6b6b", marginTop: 6 }}>{error}</div>}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button onClick={clearSignature} style={{
            flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10, padding: "12px", fontSize: 14, color: "rgba(232,230,227,0.7)", cursor: "pointer",
          }}>Șterge</button>
          <button onClick={onClose} style={{
            flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 10, padding: "12px", fontSize: 14, color: "rgba(232,230,227,0.7)", cursor: "pointer",
          }}>Anulează</button>
          <button onClick={saveSignature} style={{
            flex: 2, background: `linear-gradient(135deg, #72F94C, #4AD42F)`, border: "none",
            borderRadius: 10, padding: "12px", fontSize: 14, fontWeight: 700, color: "#0a0a0a", cursor: "pointer",
          }}>Semnează</button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// DOCUMENT CARD
// ============================================

function DocumentCard({ title, signed, signedDate, viewUrl, pdfUrl, onSign, busy }) {
  return (
    <div style={{
      background: signed ? "rgba(114,249,76,0.06)" : "rgba(255,255,255,0.04)",
      border: signed ? "1px solid rgba(114,249,76,0.3)" : "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12, padding: 14, marginBottom: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: signed ? 0 : 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{signed ? "✅" : "📄"}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{title}</div>
            {signed && <div style={{ fontSize: 11, color: C.accent, marginTop: 2 }}>Semnat</div>}
          </div>
        </div>
      </div>
      {!signed && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {viewUrl && (
            <a href={viewUrl} target="_blank" rel="noopener noreferrer" style={{
              flex: "1 1 auto", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "rgba(232,230,227,0.7)",
              textAlign: "center", textDecoration: "none", cursor: "pointer",
            }}>👁 Citește</a>
          )}
          {pdfUrl && (
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={{
              flex: "1 1 auto", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8, padding: "8px 12px", fontSize: 12, color: "rgba(232,230,227,0.7)",
              textAlign: "center", textDecoration: "none", cursor: "pointer",
            }}>⬇ PDF</a>
          )}
          <button onClick={onSign} disabled={busy} style={{
            flex: "2 1 auto", background: busy ? "rgba(114,249,76,0.3)" : `linear-gradient(135deg, #72F94C, #4AD42F)`,
            border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 12, fontWeight: 700,
            color: "#0a0a0a", cursor: busy ? "wait" : "pointer", opacity: busy ? 0.6 : 1,
          }}>{busy ? "Se procesează..." : "✍ Semnează"}</button>
        </div>
      )}
    </div>
  );
}

// ============================================
// CI UPLOAD CARD
// ============================================

function CIUploadCard({ uploaded, onUpload, busy }) {
  const fileRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);

  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError(null);
    
    // Validare dimensiune (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Fișierul este prea mare (max 5MB).");
      return;
    }
    
    // Validare tip
    if (!file.type.match(/^image\/(jpeg|png|jpg)$/) && file.type !== "application/pdf") {
      setError("Doar JPG, PNG sau PDF.");
      return;
    }

    const reader = new FileReader();
    reader.onload = ev => {
      const base64 = ev.target.result.split(",")[1];
      setPreview(file.type.startsWith("image/") ? ev.target.result : null);
      onUpload(base64, file.type, file.name);
    };
    reader.readAsDataURL(file);
  }

  return (
    <div style={{
      background: uploaded ? "rgba(114,249,76,0.06)" : "rgba(255,255,255,0.04)",
      border: uploaded ? "1px solid rgba(114,249,76,0.3)" : "1px solid rgba(255,255,255,0.08)",
      borderRadius: 12, padding: 14, marginBottom: 10,
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: uploaded ? 0 : 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{uploaded ? "✅" : "🪪"}</span>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Copie CI</div>
            {uploaded && <div style={{ fontSize: 11, color: C.accent, marginTop: 2 }}>Încărcat</div>}
            {!uploaded && <div style={{ fontSize: 11, color: "rgba(232,230,227,0.45)", marginTop: 2 }}>Foto sau scan al cărții de identitate</div>}
          </div>
        </div>
      </div>
      {!uploaded && (
        <>
          <button onClick={() => fileRef.current?.click()} disabled={busy} style={{
            width: "100%", padding: "12px", borderRadius: 8,
            border: "2px dashed rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)",
            color: "rgba(232,230,227,0.6)", fontSize: 13, cursor: busy ? "wait" : "pointer",
            opacity: busy ? 0.5 : 1,
          }}>📎 {busy ? "Se încarcă..." : "Alege fișier (JPG, PNG, PDF)"}</button>
          <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/jpg,application/pdf"
            onChange={handleFile} style={{ display: "none" }} />
          {error && <div style={{ fontSize: 12, color: "#ff6b6b", marginTop: 6 }}>{error}</div>}
        </>
      )}
    </div>
  );
}


// ============================================
// MY SHIFTS - turele mele
// ============================================


// ===== TRAINING SECTION =====
// Buton "Programare training" pentru candidați Confirmat. Deschide modal cu:
//   - dacă nu are rezervare: lista de sloturi + Rezervă
//   - dacă are rezervare: cardul cu data/ora + Anulează (cu confirmare)

// Training SSM/PSI — 2 sloturi hardcoded, fără limită de locuri. Doar pentru Untold.


// ============================================
// SHIFTS PAGE - tab dedicat "Turele mele"
// ============================================


// ============================================
// TEAM PAGE - tab dedicat "Echipa mea" (doar pentru Supervizori)
// ============================================


// ============================================
// ADMIN PAGE - acces admin pentru a vedea turele oricui
// ============================================


// Componentă pentru afișarea turelor în Admin (similar cu MyShifts dar fără fetch)


function BeachPleaseApp() {
  const [view, setView] = useState(VIEWS.HOME);
  // Telefonul utilizatorului care a făcut status check și e Complete
  const [completePhone, setCompletePhone] = useState(null);
  const [userPosition, setUserPosition] = useState("Casier");
  const [isAdmin, setIsAdmin] = useState(false);
  
  // Restore din localStorage la primul render
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem("bp_complete_phone");
        const savedPos = window.localStorage.getItem("bp_user_position");
        const savedAdmin = window.localStorage.getItem("bp_admin_code");
        if (saved) setCompletePhone(saved);
        if (savedPos) setUserPosition(savedPos);
        if (savedAdmin) setIsAdmin(true);
      } catch (e) {}
    }
  }, []);
  
  // Salvează în localStorage când se schimbă
  function updateCompletePhone(phone, position) {
    setCompletePhone(phone);
    if (position) setUserPosition(position);
    try {
      if (phone) {
        window.localStorage.setItem("bp_complete_phone", phone);
        if (position) window.localStorage.setItem("bp_user_position", position);
      } else {
        window.localStorage.removeItem("bp_complete_phone");
        window.localStorage.removeItem("bp_user_position");
      }
    } catch (e) {}
  }
  
  function handleLogout() {
    updateCompletePhone(null, null);
    setUserPosition("Casier");
    setView(VIEWS.HOME);
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(135deg, ${C.dark} 0%, ${C.darkMid} 40%, ${C.darkLight} 100%)`,
      fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif",
      color: "#e8e6e3",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" />
      <link href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.min.css" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
        input::placeholder, textarea::placeholder { color: rgba(232,230,227,0.3); }
        select option { background: #1a1a2e; color: #e8e6e3; }
      `}</style>

      <div style={{ position: "fixed", inset: 0, opacity: 0.03, pointerEvents: "none",
        backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }} />
      <div style={{ position: "fixed", top: "-30%", right: "-20%", width: "60vw", height: "60vw",
        background: "radial-gradient(circle, rgba(114,249,76,0.05) 0%, transparent 70%)", pointerEvents: "none",
      }} />

      <Nav view={view} setView={setView} 
        hasShifts={false}
        hasTeam={false}
        isAdmin={false} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Festival Beach Please 2026 s-a încheiat. Toate view-urile sunt înlocuite cu ecranul „Completed". */}
        <div style={{ maxWidth: 500, margin: "60px auto", padding: "40px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 72, marginBottom: 24 }}>🏖️</div>
          <div style={{
            display: "inline-block", padding: "6px 14px", marginBottom: 20,
            background: "rgba(114,249,76,0.15)", border: "1px solid rgba(114,249,76,0.35)",
            borderRadius: 999, fontSize: 12, letterSpacing: "0.15em", fontWeight: 700, color: C.accent,
          }}>COMPLETED</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.02em" }}>
            Beach Please 2026
          </h1>
          <p style={{ fontSize: 15, color: "rgba(232,230,227,0.65)", lineHeight: 1.6, margin: "0 0 32px" }}>
            Festivalul s-a încheiat. Mulțumim tuturor celor peste 200 de casieri și supervizori care au făcut parte din echipa Cashless Payment Systems!
          </p>
          <div style={{
            background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12, padding: 20, textAlign: "left",
          }}>
            <div style={{ fontSize: 13, color: "rgba(232,230,227,0.5)", marginBottom: 8, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Următoarea ediție
            </div>
            <div style={{ fontSize: 15, color: "#e8e6e3", lineHeight: 1.6 }}>
              Aplicațiile pentru Beach Please 2027 se vor deschide în luna mai 2027. Urmărește-ne pe rețelele sociale pentru anunțuri.
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: "center", padding: "24px 16px 32px", borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 11, color: "rgba(232,230,227,0.2)", fontFamily: "monospace" }}>
        Cashless Payment Systems · Beach Please 2026<br />
        Contact: recrutarifestival@gmail.com
      </div>
    </div>
  );
}

// ============================================
// LANDING PAGE (angajarifestival.ro fără subdomain)
// ============================================

function LandingPage() {
  const festivals = [
    {
      key: "beachplease",
      name: "Beach Please",
      dateLabel: "8-12 Iulie 2026",
      location: "Costinești",
      enabled: true,
      colors: { accent: "#72F94C", accentDark: "#4AD42F" },
      subdomain: "beachplease",
    },
    {
      key: "untold",
      name: "Untold",
      dateLabel: "6-9 August 2026",
      location: "Cluj-Napoca",
      enabled: true,
      colors: { accent: "#7C4DFF", accentDark: "#5E35B1" },
      subdomain: "untold",
    },
  ];
  
  function handleClick(festival) {
    if (!festival.enabled) return;
    window.location.href = `https://${festival.subdomain}.angajarifestival.ro`;
  }
  
  return (
    <div style={{
      minHeight: "100vh",
      background: `linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)`,
      fontFamily: "'Geist', 'DM Sans', system-ui, sans-serif",
      color: "#e8e6e3",
      padding: "40px 16px",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap" />
      <link href="https://cdn.jsdelivr.net/npm/geist@1.3.1/dist/fonts/geist-sans/style.min.css" rel="stylesheet" />
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }
      `}</style>
      
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 48, paddingTop: 32 }}>
          <div style={{ 
            display: "inline-block", padding: "6px 16px", borderRadius: 24, 
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", 
            fontSize: 12, fontFamily: "monospace", color: "rgba(255,255,255,0.5)", 
            letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 24 
          }}>
            Recrutări 2026
          </div>
          <h1 style={{ 
            fontSize: 42, fontWeight: 800, margin: "0 0 16px", lineHeight: 1.1, 
            letterSpacing: "-0.03em", color: "#fff" 
          }}>
            Angajări festivaluri
          </h1>
          <p style={{ 
            fontSize: 16, color: "rgba(232,230,227,0.5)", margin: 0, lineHeight: 1.6, 
            maxWidth: 480, marginLeft: "auto", marginRight: "auto" 
          }}>
            Alătură-te echipei de Cashless Payment Systems la unul dintre festivalurile verii.
            Plată, cazare și acces la festival.
          </p>
        </div>
        
        {/* Festival cards */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 32 }}>
          {festivals.map(f => {
            const isAvailable = f.enabled;
            return (
              <div 
                key={f.key}
                onClick={() => handleClick(f)}
                style={{
                  background: isAvailable 
                    ? `linear-gradient(135deg, ${f.colors.accent}15, ${f.colors.accentDark}08)`
                    : "rgba(255,255,255,0.03)",
                  border: isAvailable 
                    ? `1px solid ${f.colors.accent}40`
                    : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 20,
                  padding: "24px 24px",
                  cursor: isAvailable ? "pointer" : "default",
                  transition: "all 0.3s",
                  opacity: isAvailable ? 1 : 0.55,
                  position: "relative",
                  overflow: "hidden",
                }}
                onMouseEnter={e => {
                  if (isAvailable) {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = `0 8px 32px ${f.colors.accent}25`;
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "";
                  e.currentTarget.style.boxShadow = "";
                }}
              >
                {isAvailable && (
                  <div style={{
                    position: "absolute", top: "-30%", right: "-10%", width: 200, height: 200,
                    background: `radial-gradient(circle, ${f.colors.accent}30 0%, transparent 70%)`,
                    pointerEvents: "none",
                  }} />
                )}
                
                <div style={{ position: "relative" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <h2 style={{ 
                      fontSize: 28, fontWeight: 800, margin: 0, letterSpacing: "-0.02em",
                      color: isAvailable ? f.colors.accent : "rgba(232,230,227,0.5)",
                    }}>
                      {f.name}
                    </h2>
                    {!isAvailable && (
                      <span style={{
                        fontSize: 10, color: "rgba(255,255,255,0.5)", 
                        background: "rgba(255,255,255,0.08)", padding: "4px 10px", borderRadius: 12,
                        fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em",
                      }}>În curând</span>
                    )}
                  </div>
                  
                  <div style={{ fontSize: 14, color: "rgba(232,230,227,0.6)", marginBottom: 6 }}>
                    📅 {f.dateLabel}
                  </div>
                  
                  {f.location && (
                    <div style={{ fontSize: 13, color: "rgba(232,230,227,0.4)", marginBottom: 16 }}>
                      📍 {f.location}
                    </div>
                  )}
                  
                  {isAvailable ? (
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 6,
                      fontSize: 14, fontWeight: 600, color: f.colors.accent,
                    }}>
                      Aplică acum
                      <span style={{ fontSize: 16 }}>→</span>
                    </div>
                  ) : (
                    <div style={{ fontSize: 13, color: "rgba(232,230,227,0.4)", fontStyle: "italic" }}>
                      Aplicările vor fi deschise în curând.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 48, fontSize: 11, color: "rgba(232,230,227,0.25)", fontFamily: "monospace" }}>
          Cashless Payment Systems · Contact: recrutarifestival@gmail.com
        </div>
      </div>
    </div>
  );
}


// === UNTOLD HomePage clone ===

function UHomePage({ setView }) {
  const C = { accent: "#7C4DFF", accentDark: "#5E35B1", dark: "#0f0f1a", darkMid: "#1a1a2e", darkLight: "#16213e" };
  return (<>
    <UHero setView={setView} />
    <UInfoCards />
    <UFAQ />
    <div style={{ textAlign: "center", padding: "0 16px 40px" }}>
      <button onClick={() => setView(VIEWS.APPLY)} style={{
        background: `linear-gradient(135deg, #7C4DFF, #5E35B1)`, border: "none", borderRadius: 14,
        padding: "16px 48px", fontSize: 16, fontWeight: 700, color: "#0a0a0a", cursor: "pointer",
        boxShadow: "0 4px 20px rgba(124,77,255,0.3)",
      }}>Aplică acum</button>
    </div>
  </>);
}

function UHero({ setView }) {
  const C = { accent: "#7C4DFF", accentDark: "#5E35B1", dark: "#0f0f1a", darkMid: "#1a1a2e", darkLight: "#16213e" };
  return (
    <div style={{ textAlign: "center", padding: "48px 20px 40px" }}>
      <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: 20, background: "rgba(124,77,255,0.12)", border: "1px solid rgba(124,77,255,0.2)", fontSize: 12, fontFamily: "monospace", color: C.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
        Recrutări 2026
      </div>
      <h1 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 12px", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
        <span style={{ color: "#fff" }}>Fii parte din echipa</span><br />
        <span style={{ background: `linear-gradient(135deg, ${C.accent}, #B388FF)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Untold</span>
      </h1>
      <p style={{ fontSize: 16, color: "rgba(232,230,227,0.55)", margin: "0 0 28px", lineHeight: 1.6, maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
        Alătură-te departamentului de Cashless Payment Systems. Plată, acces la festival și experiență unică.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
        <button onClick={() => setView(VIEWS.APPLY)} style={{
          background: `linear-gradient(135deg, #7C4DFF, #5E35B1)`, border: "none", borderRadius: 14,
          padding: "16px 40px", fontSize: 16, fontWeight: 700, color: "#0a0a0a", cursor: "pointer",
          boxShadow: "0 4px 20px rgba(124,77,255,0.3)", transition: "transform 0.2s, box-shadow 0.2s",
        }} onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 6px 28px rgba(124,77,255,0.4)"; }}
           onMouseLeave={e => { e.target.style.transform = ""; e.target.style.boxShadow = "0 4px 20px rgba(124,77,255,0.3)"; }}>
          Aplică acum
        </button>
        <button onClick={() => setView(VIEWS.STATUS)} style={{
          background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 14,
          padding: "12px 32px", fontSize: 14, color: "rgba(232,230,227,0.6)", cursor: "pointer",
        }}>
          Verifică statusul aplicației
        </button>
      </div>
    </div>
  );
}

function UInfoCards() {
  const C = { accent: "#7C4DFF", accentDark: "#5E35B1", dark: "#0f0f1a", darkMid: "#1a1a2e", darkLight: "#16213e" };
  const cards = [
    { icon: "💰", title: "Plată", desc: "20 lei net/oră, 32-40 ore lucrate pe durata festivalului. Plata se face după festival." },
    { icon: "🏙️", title: "În Cluj-Napoca", desc: "Locația e în Cluj-Napoca. Cazarea e responsabilitatea ta." },
    { icon: "🎓", title: "Training inclus", desc: "Trainingurile încep din 3 August și sunt obligatorii pentru toți membrii echipei." },
    { icon: "🔄", title: "Flexibilitate", desc: "Îți alegi singur ce model de ture preferi dintre cele 3 opțiuni disponibile." },
    { icon: "🎪", title: "Acces festival", desc: "Ai acces în perimetrul festivalului și în afara turelor de lucru." },
    { icon: "🍕", title: "Mâncare + apă", desc: "Primești mâncare și apă pe durata turei de lucru." },
  ];
  return (
    <div style={{ padding: "0 16px 32px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {cards.map(c => (
          <div key={c.title} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "18px 16px" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{c.title}</div>
            <div style={{ fontSize: 12, color: "rgba(232,230,227,0.45)", lineHeight: 1.5 }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function UFAQ() {
  const C = { accent: "#7C4DFF", accentDark: "#5E35B1", dark: "#0f0f1a", darkMid: "#1a1a2e", darkLight: "#16213e" };
  const [open, setOpen] = useState(null);
  const items = [
    { q: "Care e vârsta minimă?", a: "18 ani împliniți la data festivalului." },
    { q: "Ce modele de ture există și când încep?", a: "Există 3 modele: NZZN (noapte-zi-zi-noapte), ZNNZ (zi-noapte-noapte-zi) sau Oricând (flexibil — coordonatorul îți alocă). Turele de zi încep la ora 15:00, iar cele de noapte în jurul orei 21:00-22:00." },
    { q: "Când încep training-urile?", a: "Training-urile încep din 3 August 2026 și sunt obligatorii pentru toți membrii echipei. Vei primi detalii exacte după acceptare." },
    { q: "Se oferă cazare?", a: "Nu. Nu se oferă cazare." },
    { q: "Se oferă parcare?", a: "Nu. Nu se oferă loc de parcare. Recomandăm transportul în comun sau organizarea cu alți colegi." },
    { q: "Voi avea tură în fiecare zi?", a: "Da, vei avea tură în fiecare zi de festival (6-9 August 2026), conform modelului de ture pe care îl alegi." },
    { q: "Ce se întâmplă dacă nu pot veni o zi?", a: "Anunți coordonatorul din timp și se stabilește recuperarea. Absența neanunțată = restricționare acces." },
    { q: "Am nevoie de experiență?", a: "Nu, oferim training complet. Ai nevoie doar de seriozitate și disponibilitate." },
    { q: "Când aflu dacă sunt acceptat?", a: "Verifici statusul aplicației oricând pe acest site, folosind numărul de telefon." },
  ];
  return (
    <div style={{ padding: "0 16px 40px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto" }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 16px", textAlign: "center" }}>Întrebări frecvente</h2>
        {items.map((item, i) => (
          <div key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <button onClick={() => setOpen(open === i ? null : i)} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%",
              background: "none", border: "none", padding: "16px 4px", cursor: "pointer", textAlign: "left",
            }}>
              <span style={{ fontSize: 14, fontWeight: 500, color: "rgba(232,230,227,0.8)" }}>{item.q}</span>
              <span style={{ fontSize: 18, color: "rgba(232,230,227,0.3)", transform: open === i ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>+</span>
            </button>
            {open === i && (
              <div style={{ padding: "0 4px 16px", fontSize: 13, color: "rgba(232,230,227,0.5)", lineHeight: 1.6 }}>{item.a}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// UNTOLD CLONES (real implementations)
// ============================================

function UApplyPage({ setView }) {
  const C = { accent: "#7C4DFF", accentDark: "#5E35B1", dark: "#0f0f1a", darkMid: "#1a1a2e", darkLight: "#16213e" };
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [selfieBase64, setSelfieBase64] = useState(null);
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    nume: "", prenume: "", telefon: "", email: "", oras: "", dataNasterii: "", socialType: "", socialLink: "",
    situatie: "", cazare: "", experienta: "", motivatie: "", turaPreferata: "", colegiPreferati: "",
    serieCi: "", numarCi: "", cnp: "", sex: "", eliberatDe: "", dataCi: "", dataExpirareCi: "", domiciliu: "", orasCi: "", judet: "", cetatenie: "",
    selfie: null,
    confirm1: false, confirm2: false, confirm3: false, gdprConsent: false, gdprMarketing: false,
  });
  const [errors, setErrors] = useState({});

  const upd = (key, val) => { setForm(prev => ({ ...prev, [key]: val })); setErrors(prev => ({ ...prev, [key]: null })); };

  function validateStep() {
    const e = {};
    if (step === 0) {
      if (!form.nume.trim()) e.nume = "Obligatoriu";
      if (!form.prenume.trim()) e.prenume = "Obligatoriu";
      if (!form.telefon.trim() || form.telefon.length < 10) e.telefon = "Număr valid de 10 cifre";
      if (!form.email.includes("@")) e.email = "Email valid";
      if (!form.oras.trim()) e.oras = "Obligatoriu";
      if (!form.socialType) e.socialType = "Selectează rețeaua";
      if (!form.socialLink.trim()) e.socialLink = "Obligatoriu";
    }
    if (step === 1) {
      if (!form.situatie) e.situatie = "Selectează o opțiune";
      if (!form.cazare) e.cazare = "Selectează o opțiune";
      if (!form.experienta) e.experienta = "Selectează o opțiune";
      if (!form.turaPreferata) e.turaPreferata = "Selectează o opțiune";
      if (!form.motivatie.trim() || form.motivatie.length < 20) e.motivatie = "Minim 20 de caractere";
      if (!form.selfie) e.selfie = "Selfie-ul este obligatoriu";
    }
    if (step === 2) {
      if (!form.serieCi.trim()) e.serieCi = "Obligatoriu";
      if (!form.numarCi.trim()) e.numarCi = "Obligatoriu";
      if (!form.cnp.trim() || form.cnp.length !== 13) e.cnp = "CNP-ul are 13 cifre";
      if (form.cnp.length === 13 && !parseCNP(form.cnp)) e.cnp = "CNP invalid";
      if (!form.sex) e.sex = "Obligatoriu (se completează automat din CNP)";
      if (!form.dataNasterii) e.dataNasterii = "Obligatoriu (se completează automat din CNP)";
      if (form.dataNasterii) {
        const age = (new Date(2026, 7, 6) - new Date(form.dataNasterii)) / (365.25 * 24 * 60 * 60 * 1000);
        if (age < 18) e.dataNasterii = "Trebuie să ai minim 18 ani la data festivalului";
      }
      if (!form.eliberatDe.trim()) e.eliberatDe = "Obligatoriu";
      if (!form.dataCi) e.dataCi = "Obligatoriu";
      if (!form.dataExpirareCi) e.dataExpirareCi = "Obligatoriu";
      if (form.dataCi && form.dataExpirareCi && new Date(form.dataExpirareCi) <= new Date(form.dataCi)) {
        e.dataExpirareCi = "Data expirării trebuie să fie după data eliberării";
      }
      if (form.dataExpirareCi && new Date(form.dataExpirareCi) < new Date(2026, 7, 10)) {
        e.dataExpirareCi = "CI expiră înainte de finalul festivalului (9 August 2026)";
      }
      if (!form.domiciliu.trim()) e.domiciliu = "Obligatoriu";
      if (!form.orasCi.trim()) e.orasCi = "Obligatoriu";
      if (!form.judet.trim()) e.judet = "Obligatoriu";
      if (!form.cetatenie.trim()) e.cetatenie = "Obligatoriu";
    }
    if (step === 3) {
      if (!form.confirm1) e.confirm1 = "Trebuie confirmat";
      if (!form.confirm2) e.confirm2 = "Trebuie confirmat";
      if (!form.confirm3) e.confirm3 = "Trebuie confirmat";
      if (!form.gdprConsent) e.gdprConsent = "Consimțământul GDPR este obligatoriu";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function next() {
    if (!validateStep()) return;
    if (step < 3) { setStep(step + 1); window.scrollTo(0, 0); return; }
    
    // Submit to API
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload = {
        action: "submit",
        ...form,
        selfieBase64: selfieBase64 || null,
      };
      delete payload.selfie;
      delete payload.confirm1;
      delete payload.confirm2;
      delete payload.confirm3;

      const resp = await fetch(UNTOLD_API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify(payload),
      });
      const result = await resp.json();
      
      if (result.success) {
        setSubmitted(true);
        window.scrollTo(0, 0);
      } else {
        setSubmitError(result.error || "A apărut o eroare. Încearcă din nou.");
      }
    } catch (err) {
      setSubmitError("Eroare de conexiune. Verifică internetul și încearcă din nou.");
    }
    setSubmitting(false);
  }

  function handleSelfie(e) {
    const file = e.target.files[0];
    if (file) {
      upd("selfie", file);
      const reader = new FileReader();
      reader.onload = ev => {
        setSelfiePreview(ev.target.result);
        setSelfieBase64(ev.target.result.split(",")[1]);
      };
      reader.readAsDataURL(file);
    }
  }

  if (submitted) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "rgba(99,153,34,0.15)", border: "1px solid rgba(99,153,34,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: 32 }}>✓</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 12px" }}>Aplicație trimisă!</h2>
        <p style={{ fontSize: 15, color: "rgba(232,230,227,0.5)", lineHeight: 1.6, maxWidth: 320, margin: "0 auto 24px" }}>
          Poți verifica oricând statusul aplicației tale folosind numărul de telefon <span style={{ color: "#fff" }}>{form.telefon}</span>.
        </p>
        <button onClick={() => setView(VIEWS.STATUS)} style={{
          background: `linear-gradient(135deg, #7C4DFF, #5E35B1)`, border: "none", borderRadius: 12,
          padding: "14px 32px", fontSize: 15, fontWeight: 600, color: "#0a0a0a", cursor: "pointer",
        }}>Verifică statusul</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "24px 16px 40px", maxWidth: 520, margin: "0 auto" }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 24px", textAlign: "center" }}>Formular de aplicare</h2>

      {/* Progress */}
      <div style={{ display: "flex", gap: 4, marginBottom: 28 }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1, textAlign: "center" }}>
            <div style={{ height: 3, borderRadius: 2, background: i <= step ? C.accent : "rgba(255,255,255,0.08)", transition: "background 0.3s", marginBottom: 6 }} />
            <span style={{ fontSize: 11, color: i <= step ? C.accent : "rgba(232,230,227,0.3)" }}>{s}</span>
          </div>
        ))}
      </div>

      {/* Step 0: Personal */}
      {step === 0 && (<div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Nume" required error={errors.nume}><Input value={form.nume} onChange={v => upd("nume", v)} placeholder="Popescu" /></FormField>
          <FormField label="Prenume" required error={errors.prenume}><Input value={form.prenume} onChange={v => upd("prenume", v)} placeholder="Maria" /></FormField>
        </div>
        <FormField label="Număr de telefon" required error={errors.telefon}><Input value={form.telefon} onChange={v => upd("telefon", v.replace(/[^0-9]/g, ""))} placeholder="07xxxxxxxx" type="tel" maxLength={10} /></FormField>
        <FormField label="Email" required error={errors.email}><Input value={form.email} onChange={v => upd("email", v)} placeholder="maria@email.com" type="email" /></FormField>
        <FormField label="Orașul de domiciliu" required error={errors.oras}><Input value={form.oras} onChange={v => upd("oras", v)} placeholder="București" /></FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
          <FormField label="Rețea socială" required error={errors.socialType}>
            <Select value={form.socialType} onChange={v => upd("socialType", v)} options={["Facebook", "Instagram", "TikTok"]} placeholder="Alege..." />
          </FormField>
          <FormField label="Link profil" required error={errors.socialLink}>
            <Input value={form.socialLink} onChange={v => upd("socialLink", v)} placeholder={form.socialType === "Instagram" ? "@username sau link" : form.socialType === "TikTok" ? "@username sau link" : "https://facebook.com/profil"} />
          </FormField>
        </div>
      </div>)}

      {/* Step 1: Screening */}
      {step === 1 && (<div>
        <FormField label="Care e situația ta actuală?" required error={errors.situatie}>
          <Select value={form.situatie} onChange={v => upd("situatie", v)} options={[
            "Elev XII (dau BAC 2026)",
            "Elev (alt an)",
            "Student",
            "Lucrez part-time / sezonier",
            "Lucrez full-time cu contract",
            "Nu lucrez și nu sunt la școală"
          ]} placeholder="Selectează..." />
        </FormField>
        <FormField label="Ai cazare asigurată în Cluj-Napoca?" required error={errors.cazare}>
          <Select value={form.cazare} onChange={v => upd("cazare", v)} options={["Locuiesc în Cluj-Napoca", "Voi sta la familie/prieteni", "Îmi voi asigura cazare singur/ă"]} placeholder="Selectează..." />
        </FormField>
        <FormField label="Ai mai participat la un festival major?" required error={errors.experienta}>
          <Select value={form.experienta} onChange={v => upd("experienta", v)} options={["Da, ca staff/voluntar", "Da, ca participant", "Nu, este prima dată"]} placeholder="Selectează..." />
        </FormField>
        <FormField label="Ce model de ture preferi?" required error={errors.turaPreferata} hint="Turele de zi încep la ora 15:00, cele de noapte în jurul orei 21-22. N = noapte, Z = zi.">
          <Select value={form.turaPreferata} onChange={v => upd("turaPreferata", v)} options={[
            "NZZN (noapte-zi-zi-noapte)",
            "ZNNZ (zi-noapte-noapte-zi)",
            "Oricând (flexibil)"
          ]} placeholder="Selectează..." />
        </FormField>
        <FormField label="Cu cine ai vrea să fii pe tură? (opțional)" hint="Dacă ai prieteni/cunoștințe care aplică și vrei să fiți pe aceeași tură, scrie aici numele lor. Lăsăm necompletat dacă nu e cazul.">
          <TextArea value={form.colegiPreferati} onChange={v => upd("colegiPreferati", v)} placeholder="Ex: Ion Popescu, Maria Ionescu..." rows={2} />
        </FormField>
        <FormField label="Ce te motivează să faci parte din echipă?" required error={errors.motivatie}>
          <TextArea value={form.motivatie} onChange={v => upd("motivatie", v)} placeholder="Spune-ne de ce vrei să fii parte din echipa Cashless..." rows={4} />
        </FormField>
        <FormField label="Selfie recent" required error={errors.selfie}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {selfiePreview ? (
              <div style={{ position: "relative" }}>
                <img src={selfiePreview} style={{ width: 80, height: 80, borderRadius: 12, objectFit: "cover" }} />
                <button onClick={() => { upd("selfie", null); setSelfiePreview(null); setSelfieBase64(null); }} style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: "50%", background: C.accent, border: "none", color: "#fff", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} style={{
                width: 80, height: 80, borderRadius: 12, border: "2px dashed rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.03)", display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 4,
              }}>
                <span style={{ fontSize: 24, color: "rgba(232,230,227,0.3)" }}>📷</span>
                <span style={{ fontSize: 10, color: "rgba(232,230,227,0.3)" }}>Adaugă</span>
              </button>
            )}
            <div style={{ fontSize: 12, color: "rgba(232,230,227,0.35)", lineHeight: 1.5 }}>
              Un selfie recent, clar, în care se vede fața ta. Ne ajută în procesul de selecție.
            </div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleSelfie} style={{ display: "none" }} />
        </FormField>
      </div>)}

      {/* Step 2: CI Data */}
      {step === 2 && (<div>
        <div style={{ background: "rgba(124,77,255,0.08)", border: "1px solid rgba(124,77,255,0.15)", borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 12, color: "rgba(232,230,227,0.5)", lineHeight: 1.5 }}>
          Datele din cartea de identitate sunt necesare pentru generarea contractului. Sex-ul și data nașterii se completează automat din CNP.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
          <FormField label="Serie CI" required error={errors.serieCi}><Input value={form.serieCi} onChange={v => upd("serieCi", v.toUpperCase())} placeholder="BZ" maxLength={2} /></FormField>
          <FormField label="Număr CI" required error={errors.numarCi}><Input value={form.numarCi} onChange={v => upd("numarCi", v.replace(/[^0-9]/g, ""))} placeholder="1234567" maxLength={7} /></FormField>
        </div>
        <FormField label="CNP" required error={errors.cnp}>
          <Input value={form.cnp} onChange={v => {
            const clean = v.replace(/[^0-9]/g, "");
            upd("cnp", clean);
            // Auto-fill sex și data nașterii când CNP-ul e complet
            if (clean.length === 13) {
              const parsed = parseCNP(clean);
              if (parsed) {
                setForm(prev => ({ ...prev, cnp: clean, sex: parsed.sex, dataNasterii: parsed.dataNasterii }));
                setErrors(prev => ({ ...prev, cnp: null, sex: null, dataNasterii: null }));
              }
            } else {
              // Reset sex și data dacă CNP-ul e incomplet
              if (form.sex || form.dataNasterii) {
                setForm(prev => ({ ...prev, cnp: clean, sex: "", dataNasterii: "" }));
              }
            }
          }} placeholder="1234567890123" maxLength={13} />
        </FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
          <FormField label="Sex" required error={errors.sex}>
            <Input value={form.sex} onChange={() => {}} placeholder="—" readOnly style={{ background: "rgba(124,77,255,0.05)", cursor: "not-allowed" }} />
          </FormField>
          <FormField label="Data nașterii" required error={errors.dataNasterii}>
            <Input value={form.dataNasterii} onChange={() => {}} type="date" readOnly style={{ background: "rgba(124,77,255,0.05)", cursor: "not-allowed" }} />
          </FormField>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Data eliberării CI" required error={errors.dataCi}><Input value={form.dataCi} onChange={v => upd("dataCi", v)} type="date" /></FormField>
          <FormField label="Data expirării CI" required error={errors.dataExpirareCi}><Input value={form.dataExpirareCi} onChange={v => upd("dataExpirareCi", v)} type="date" /></FormField>
        </div>
        <FormField label="Eliberat de" required error={errors.eliberatDe}><Input value={form.eliberatDe} onChange={v => upd("eliberatDe", v)} placeholder="SPCLEP Sector 1" /></FormField>
        <FormField label="Domiciliu complet" required error={errors.domiciliu}><Input value={form.domiciliu} onChange={v => upd("domiciliu", v)} placeholder="Str. Exemplu nr. 10, bl. A, ap. 5" /></FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Oraș" required error={errors.orasCi}><Input value={form.orasCi} onChange={v => upd("orasCi", v)} placeholder="București" /></FormField>
          <FormField label="Județ" required error={errors.judet}><Input value={form.judet} onChange={v => upd("judet", v)} placeholder="Buzău" /></FormField>
        </div>
        <FormField label="Cetățenie" required error={errors.cetatenie}><Input value={form.cetatenie} onChange={v => upd("cetatenie", v)} placeholder="Română" /></FormField>
      </div>)}

      {/* Step 3: Confirm */}
      {step === 3 && (<div>
        <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 12 }}>Rezumatul aplicației</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {[
              ["Nume", `${form.nume} ${form.prenume}`], ["Telefon", form.telefon],
              ["Email", form.email], ["Oraș", form.oras],
              ["Sex / Data n.", `${form.sex || "—"} / ${form.dataNasterii || "—"}`],
              ["Situație", form.situatie], ["Cazare", form.cazare],
              ["Tură preferată", form.turaPreferata],
              ["Profil", `${form.socialType}: ${form.socialLink}`],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: "rgba(232,230,227,0.35)" }}>{k}</div>
                <div style={{ fontSize: 13, color: "rgba(232,230,227,0.8)" }}>{v || "—"}</div>
              </div>
            ))}
          </div>
        </div>

        {[
          { key: "confirm1", text: "Confirm că am citit și înțeles condițiile: plata este de 20 lei/oră, locația e în Cluj-Napoca, nu se oferă cazare/parcare, voi avea tură zilnic." },
          { key: "confirm2", text: "Confirm că datele introduse sunt corecte și reale. Înțeleg că orice neconcordanță duce la excludere." },
          { key: "confirm3", text: "Mă angajez să fiu disponibil/ă pentru toată durata festivalului (6-9 August) și pentru training-urile premergătoare." },
        ].map(c => (
          <label key={c.key} style={{ display: "flex", gap: 10, marginBottom: 14, cursor: "pointer", alignItems: "flex-start" }}>
            <div onClick={() => upd(c.key, !form[c.key])} style={{
              width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 2,
              border: `2px solid ${form[c.key] ? C.accent : errors[c.key] ? "#ff6b6b" : "rgba(255,255,255,0.2)"}`,
              background: form[c.key] ? C.accent : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.2s",
            }}>
              {form[c.key] && <span style={{ color: "#0a0a0a", fontSize: 14, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, color: "rgba(232,230,227,0.6)", lineHeight: 1.5 }}>{c.text}</span>
          </label>
        ))}

        {/* GDPR Section */}
        <div style={{ marginTop: 20, padding: 16, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(232,230,227,0.7)", marginBottom: 10 }}>Protecția datelor personale (GDPR)</div>
          <div style={{ fontSize: 12, color: "rgba(232,230,227,0.4)", lineHeight: 1.7, marginBottom: 16 }}>
            Datele tale personale sunt colectate și prelucrate de echipa Cashless Payment Systems (operator de date contact: recrutarifestival@gmail.com) în scopul recrutării pentru poziția de casier în cadrul festivalului UNTOLD 2026.
            Datele colectate includ: date de identificare (nume, CNP, serie/nr CI), date de contact (telefon, email), adresă de domiciliu, imagine (selfie), profil social media.
            Temeiul prelucrării este consimțământul tău explicit. Datele vor fi stocate pe durata procesului de recrutare și pe o perioadă de maximum 2 ani ulterior, conform legislației muncii.
            Ai dreptul de acces, rectificare, ștergere, restricționare, portabilitate și de a te opune prelucrării, precum și dreptul de a depune plângere la ANSPDCP.
            Îți poți retrage consimțământul în orice moment prin email la recrutarifestival@gmail.com, fără a afecta legalitatea prelucrării anterioare.
          </div>

          <label style={{ display: "flex", gap: 10, marginBottom: 14, cursor: "pointer", alignItems: "flex-start" }}>
            <div onClick={() => upd("gdprConsent", !form.gdprConsent)} style={{
              width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 2,
              border: `2px solid ${form.gdprConsent ? C.accent : errors.gdprConsent ? "#ff6b6b" : "rgba(255,255,255,0.2)"}`,
              background: form.gdprConsent ? C.accent : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
            }}>
              {form.gdprConsent && <span style={{ color: "#0a0a0a", fontSize: 14, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, color: "rgba(232,230,227,0.6)", lineHeight: 1.5 }}>
              <strong style={{ color: "rgba(232,230,227,0.8)" }}>Consimțământ obligatoriu:</strong> Sunt de acord cu prelucrarea datelor mele personale în scopul recrutării pentru UNTOLD 2026, conform informațiilor de mai sus.
            </span>
          </label>
          {errors.gdprConsent && <div style={{ fontSize: 12, color: "#ff6b6b", marginTop: -8, marginBottom: 10, paddingLeft: 32 }}>{errors.gdprConsent}</div>}

          <label style={{ display: "flex", gap: 10, cursor: "pointer", alignItems: "flex-start" }}>
            <div onClick={() => upd("gdprMarketing", !form.gdprMarketing)} style={{
              width: 22, height: 22, borderRadius: 6, flexShrink: 0, marginTop: 2,
              border: `2px solid ${form.gdprMarketing ? C.accent : "rgba(255,255,255,0.2)"}`,
              background: form.gdprMarketing ? C.accent : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s",
            }}>
              {form.gdprMarketing && <span style={{ color: "#0a0a0a", fontSize: 14, fontWeight: 700 }}>✓</span>}
            </div>
            <span style={{ fontSize: 13, color: "rgba(232,230,227,0.6)", lineHeight: 1.5 }}>
              <strong style={{ color: "rgba(232,230,227,0.8)" }}>Opțional:</strong> Sunt de acord ca datele mele să fie păstrate și utilizate pentru viitoare campanii de recrutare organizate de echipa Cashless Payment Systems (inclusiv pentru alte festivaluri: Beach Please etc.). Pot retrage acest consimțământ oricând.
            </span>
          </label>
        </div>
      </div>)}

      {/* Submit error */}
      {submitError && (
        <div style={{ background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.3)", borderRadius: 10, padding: 12, marginTop: 16, fontSize: 13, color: "#ff6b6b", textAlign: "center" }}>
          {submitError}
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
        {step > 0 && !submitting && (
          <button onClick={() => { setStep(step - 1); window.scrollTo(0, 0); }} style={{
            flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12, padding: "14px", fontSize: 15, color: "rgba(232,230,227,0.6)", cursor: "pointer",
          }}>Înapoi</button>
        )}
        <button onClick={next} disabled={submitting} style={{
          flex: 2, background: submitting ? "rgba(124,77,255,0.3)" : `linear-gradient(135deg, #7C4DFF, #5E35B1)`, border: "none",
          borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 600, color: "#0a0a0a", cursor: submitting ? "wait" : "pointer",
          opacity: submitting ? 0.7 : 1,
        }}>
          {submitting ? "Se trimite..." : step === 3 ? "Trimite aplicația" : "Continuă"}
        </button>
      </div>
    </div>
  );
}

// Helper: calculează vârsta din data de naștere „dd.mm.yyyy" (formatul folosit de backend)
function _calcAgeFromDob(dobStr) {
  if (!dobStr) return null;
  const parts = String(dobStr).split(/[.\/-]/);
  if (parts.length !== 3) return null;
  const dd = parseInt(parts[0], 10), mm = parseInt(parts[1], 10), yyyy = parseInt(parts[2], 10);
  if (!dd || !mm || !yyyy) return null;
  const dob = new Date(yyyy, mm - 1, dd);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age;
}

// Card unificat pentru statusul „Complete" — Untold
function UCompleteInfoCard({ phone, statusInfo }) {
  const [deptBooking, setDeptBooking] = useState(null);
  const [ssmBooking, setSsmBooking] = useState(null);
  const [scheduleData, setScheduleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");

  // Stări pentru modalele de rezervare
  const [deptModalOpen, setDeptModalOpen] = useState(false);
  const [deptSlots, setDeptSlots] = useState([]);
  const [deptModalLoading, setDeptModalLoading] = useState(false);
  const [deptBusySlot, setDeptBusySlot] = useState(null);
  const [deptModalError, setDeptModalError] = useState("");

  const [ssmModalOpen, setSsmModalOpen] = useState(false);
  const [turaInfoOpen, setTuraInfoOpen] = useState(false);

  // Recapitulare (opţională)
  const [repBooking, setRepBooking] = useState(null);
  const [repModalOpen, setRepModalOpen] = useState(false);
  const [repSlots, setRepSlots] = useState([]);
  const [repModalLoading, setRepModalLoading] = useState(false);
  const [repBusySlot, setRepBusySlot] = useState(null);
  const [repModalError, setRepModalError] = useState("");
  const [ssmSlots, setSsmSlots] = useState([]);
  const [ssmModalLoading, setSsmModalLoading] = useState(false);
  const [ssmBusySlot, setSsmBusySlot] = useState(null);
  const [ssmModalError, setSsmModalError] = useState("");

  const cnp = statusInfo?.cnp || "";
  const age = _calcAgeFromDob(statusInfo?.dataNasterii);

  // Încarcă cele 3 fetch-uri în paralel: dept training, SSM, program
  useEffect(() => {
    if (!phone || !cnp) { setLoading(false); return; }
    (async () => {
      try {
        const cere = (act) => fetch(
          `${UNTOLD_API_URL}?action=${act}&phone=${encodeURIComponent(phone)}&cnp=${encodeURIComponent(cnp)}`,
          { cache: "no-store" }
        ).then(r => r.json()).catch(() => null);

        // Orarul din cache local, afisat instant. Se improspateaza mai jos.
        try {
          const raw = window.localStorage.getItem("untold_sched_cache");
          if (raw) {
            const o = JSON.parse(raw);
            if (o && o.phone === phone && o.sched && Date.now() - (o.t || 0) < 24 * 3600 * 1000) {
              setScheduleData(o.sched);
              setLoading(false);
            }
          }
        } catch (e) {}

        // Programul se cere primul, ca omul sa vada ceva rapid; restul vin dupa.
        // Inainte plecau 4 cereri simultane spre acelasi script, care le executa in coada.
        const sched = await cere("schedule");
        if (sched?.success) {
          setScheduleData(sched);
          try {
            window.localStorage.setItem("untold_sched_cache",
              JSON.stringify({ t: Date.now(), phone: phone, sched: sched }));
          } catch (e) {}
        }
        setLoading(false);

        const [d, s2, rep] = await Promise.all([
          cere("trainingMySlot"), cere("ssmMySlot"), cere("repMySlot"),
        ]);
        if (d?.success && d.booking) setDeptBooking(d.booking);
        if (s2?.success && s2.booking) setSsmBooking(s2.booking);
        if (rep?.success && rep.booking) setRepBooking(rep.booking);
        return;
      } catch (e) {}
      setLoading(false);
    })();
  }, [phone, cnp]);

  async function submitWithdraw() {
    setWithdrawing(true); setWithdrawError("");
    try {
      const url = `${UNTOLD_API_URL}?action=withdraw&phone=${encodeURIComponent(phone)}&cnp=${encodeURIComponent(cnp)}&t=${Date.now()}`;
      const r = await fetch(url, { cache: "no-store", credentials: "omit" });
      const j = JSON.parse(await r.text());
      if (j.success) {
        try {
          window.localStorage.removeItem("untold_login_phone");
          window.localStorage.removeItem("untold_login_cnp");
        } catch (e) {}
        window.location.reload();
      } else {
        setWithdrawError(j.error || "A apărut o eroare.");
      }
    } catch (e) { setWithdrawError("Eroare de conexiune."); }
    setWithdrawing(false);
  }

  const displayStatus = statusInfo?.status === "confirmed" ? "Confirmat" : "Acceptat";

  // Deschide modal training dept (Casier)
  async function openDeptModal() {
    setDeptModalOpen(true); setDeptModalError(""); setDeptModalLoading(true);
    try {
      const url = `${UNTOLD_API_URL}?action=trainingSlots&phone=${encodeURIComponent(phone)}&cnp=${encodeURIComponent(cnp)}&t=${Date.now()}`;
      const r = await fetch(url, { cache: "no-store" });
      const j = JSON.parse(await r.text());
      if (j.success) setDeptSlots(j.slots || []);
      else setDeptModalError(j.error || "Eroare la încărcare");
    } catch (e) { setDeptModalError("Eroare de conexiune"); }
    setDeptModalLoading(false);
  }

  async function bookDeptSlot(slotId) {
    setDeptBusySlot(slotId); setDeptModalError("");
    try {
      const url = `${UNTOLD_API_URL}?action=trainingBook&phone=${encodeURIComponent(phone)}&cnp=${encodeURIComponent(cnp)}&slotId=${encodeURIComponent(slotId)}&t=${Date.now()}`;
      const r = await fetch(url, { cache: "no-store" });
      const j = JSON.parse(await r.text());
      if (j.success) {
        // Reîncarc booking-ul
        const my = await fetch(`${UNTOLD_API_URL}?action=trainingMySlot&phone=${encodeURIComponent(phone)}&cnp=${encodeURIComponent(cnp)}&t=${Date.now()}`, { cache: "no-store" }).then(r => r.json()).catch(() => null);
        if (my?.success && my.booking) setDeptBooking(my.booking);
        setDeptModalOpen(false);
      } else {
        setDeptModalError(j.error || "Nu s-a putut rezerva");
      }
    } catch (e) { setDeptModalError("Eroare de conexiune"); }
    setDeptBusySlot(null);
  }

  // Deschide modal training SSM
  async function cancelDeptBooking() {
    if (!window.confirm("Sigur vrei să anulezi programarea la trainingul Casier?")) return;
    try {
      const url = `${UNTOLD_API_URL}?action=trainingCancel&phone=${encodeURIComponent(phone)}&cnp=${encodeURIComponent(cnp)}&t=${Date.now()}`;
      const r = await fetch(url, { cache: "no-store" });
      const j = JSON.parse(await r.text());
      if (j.success) setDeptBooking(null);
      else alert(j.error || "Nu s-a putut anula");
    } catch (e) { alert("Eroare de conexiune"); }
  }

  async function cancelSsmBooking() {
    if (!window.confirm("Sigur vrei să anulezi programarea SSM/PSI?")) return;
    try {
      const url = `${UNTOLD_API_URL}?action=ssmCancel&phone=${encodeURIComponent(phone)}&cnp=${encodeURIComponent(cnp)}&t=${Date.now()}`;
      const r = await fetch(url, { cache: "no-store" });
      const j = JSON.parse(await r.text());
      if (j.success) setSsmBooking(null);
      else alert(j.error || "Nu s-a putut anula");
    } catch (e) { alert("Eroare de conexiune"); }
  }

  async function openRepModal() {
    setRepModalOpen(true); setRepModalError(""); setRepModalLoading(true);
    try {
      const url = `${UNTOLD_API_URL}?action=repSlots&phone=${encodeURIComponent(phone)}&cnp=${encodeURIComponent(cnp)}&t=${Date.now()}`;
      const r = await fetch(url, { cache: "no-store" });
      const j = JSON.parse(await r.text());
      if (j.success) setRepSlots(j.slots || []);
      else setRepModalError(j.error || "Eroare la încărcare");
    } catch (e) { setRepModalError("Eroare de conexiune"); }
    setRepModalLoading(false);
  }

  async function bookRepSlot(slotId) {
    setRepBusySlot(slotId); setRepModalError("");
    try {
      const url = `${UNTOLD_API_URL}?action=repBook&phone=${encodeURIComponent(phone)}&cnp=${encodeURIComponent(cnp)}&slotId=${encodeURIComponent(slotId)}&t=${Date.now()}`;
      const r = await fetch(url, { cache: "no-store" });
      const j = JSON.parse(await r.text());
      if (j.success) { setRepBooking(j.booking); setRepModalOpen(false); }
      else setRepModalError(j.error || "Nu s-a putut înscrie");
    } catch (e) { setRepModalError("Eroare de conexiune"); }
    setRepBusySlot(null);
  }

  async function cancelRepBooking() {
    if (!window.confirm("Sigur vrei să anulezi înscrierea la recapitulare?")) return;
    try {
      const url = `${UNTOLD_API_URL}?action=repCancel&phone=${encodeURIComponent(phone)}&cnp=${encodeURIComponent(cnp)}&t=${Date.now()}`;
      const r = await fetch(url, { cache: "no-store" });
      const j = JSON.parse(await r.text());
      if (j.success) setRepBooking(null);
      else alert(j.error || "Nu s-a putut anula");
    } catch (e) { alert("Eroare de conexiune"); }
  }

  async function openSsmModal() {
    setSsmModalOpen(true); setSsmModalError(""); setSsmModalLoading(true);
    try {
      const url = `${UNTOLD_API_URL}?action=ssmSlots&phone=${encodeURIComponent(phone)}&cnp=${encodeURIComponent(cnp)}&t=${Date.now()}`;
      const r = await fetch(url, { cache: "no-store" });
      const j = JSON.parse(await r.text());
      if (j.success) setSsmSlots(j.slots || []);
      else setSsmModalError(j.error || "Eroare la încărcare");
    } catch (e) { setSsmModalError("Eroare de conexiune"); }
    setSsmModalLoading(false);
  }

  async function bookSsmSlot(slotId) {
    setSsmBusySlot(slotId); setSsmModalError("");
    try {
      const url = `${UNTOLD_API_URL}?action=ssmBook&phone=${encodeURIComponent(phone)}&cnp=${encodeURIComponent(cnp)}&slotId=${encodeURIComponent(slotId)}&t=${Date.now()}`;
      const r = await fetch(url, { cache: "no-store" });
      const j = JSON.parse(await r.text());
      if (j.success) {
        setSsmBooking(j.booking);
        setSsmModalOpen(false);
      } else {
        setSsmModalError(j.error || "Nu s-a putut rezerva");
      }
    } catch (e) { setSsmModalError("Eroare de conexiune"); }
    setSsmBusySlot(null);
  }

  return (
    <div>
      {/* Header card */}
      <div style={{ background: "rgba(99,153,34,0.08)", border: "1px solid rgba(99,153,34,0.3)", borderRadius: 16, padding: 20, marginBottom: 12, textAlign: "center" }}>
        <div style={{ fontSize: 36, marginBottom: 8 }}>🎉</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: "#97C459", marginBottom: 4 }}>
          Toate actele au fost verificate
        </div>
        <div style={{ fontSize: 12, color: "rgba(232,230,227,0.5)" }}>Ne vedem la Untold!</div>
      </div>

      {/* Grup WhatsApp */}
      <div style={{ background: "rgba(37,211,102,0.07)", border: "1px solid rgba(37,211,102,0.3)", borderRadius: 14, padding: 16, marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 4 }}>Grupul de WhatsApp</div>
        <div style={{ fontSize: 12, color: "rgba(232,230,227,0.65)", lineHeight: 1.5, marginBottom: 10 }}>
          Toate anunțurile importante despre training și ture vin pe grup. Intră astăzi, dacă nu ai făcut-o deja.
        </div>
        <a
          href={UNTOLD_WHATSAPP_GROUP}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: "block", textAlign: "center", textDecoration: "none",
            background: "rgba(37,211,102,0.18)", border: "1px solid rgba(37,211,102,0.5)",
            borderRadius: 10, padding: "11px", fontSize: 14, fontWeight: 700, color: "#25D366",
          }}
        >Intră în grup</a>
      </div>

      {/* Info card */}
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 18, marginBottom: 12 }}>
        <InfoRow label="Nume" value={statusInfo?.name || "—"} />
        {statusInfo?.dataNasterii && <InfoRow label="Data nașterii" value={statusInfo.dataNasterii} />}
        {age !== null && <InfoRow label="Vârsta" value={`${age} ani`} />}
        {statusInfo?.position && (
          <InfoRow
            label="Poziție"
            value={<span style={{ padding: "2px 10px", background: "rgba(124,77,255,0.15)", border: "1px solid rgba(124,77,255,0.35)", borderRadius: 999, fontSize: 12, fontWeight: 700, color: "#B39DFF" }}>{statusInfo.position}</span>}
          />
        )}
        {statusInfo?.turaPreferata && (
          <InfoRow
            label="Tip tură"
            value={(
              <span style={{ fontSize: 13, color: "#fff", display: "inline-flex", alignItems: "center", gap: 6 }}>
                {statusInfo.turaPreferata}
                <button onClick={() => setTuraInfoOpen(true)} style={{
                  background: "rgba(124,77,255,0.15)", border: "1px solid rgba(124,77,255,0.35)",
                  borderRadius: "50%", width: 20, height: 20, padding: 0,
                  fontSize: 11, fontWeight: 700, color: "#B39DFF", cursor: "pointer",
                  display: "inline-flex", alignItems: "center", justifyContent: "center", lineHeight: 1,
                }} title="Detalii ture">i</button>
              </span>
            )}
          />
        )}
        {U_FARA_SSM.indexOf(statusInfo?.position) < 0 && (
        <InfoRow
          label="Training SSM/PSI"
          value={loading ? "…" : (
            ssmBooking ? (
              <span style={{ fontSize: 13, color: "#fff" }}>
                {ssmBooking.label || `${ssmBooking.date} · ${ssmBooking.time}`}
                {" "}
                <a href="https://maps.app.goo.gl/JSb848nzmbAuVGDw7" target="_blank" rel="noopener noreferrer" style={{ color: "#ffc107", fontSize: 11, textDecoration: "none" }}>🗺️ direcții</a>
                {" · "}
                <a href="#" onClick={e => { e.preventDefault(); cancelSsmBooking(); }} style={{ color: "#ff8a8a", fontSize: 11, textDecoration: "none" }}>× anulează</a>
              </span>
            ) : (
              <a href="#" onClick={e => { e.preventDefault(); openSsmModal(); }} style={{ fontSize: 12, color: "#ffc107" }}>Rezervă loc training</a>
            )
          )}
        />
        )}
        {U_TRAINING_FIX[statusInfo?.position] ? (
          <InfoRow
            label={`Training ${statusInfo.position}`}
            value={(
              <span style={{ fontSize: 13, color: "#fff" }}>
                {U_TRAINING_FIX[statusInfo.position]}
                {" "}
                <a href="https://maps.app.goo.gl/zz3wbXgmXtZcEpTSA" target="_blank" rel="noopener noreferrer" style={{ color: "#B39DFF", fontSize: 11, textDecoration: "none" }}>🗺️ direcții</a>
              </span>
            )}
          />
        ) : (
        <InfoRow
          label={statusInfo?.position === "Supervizor" ? "Training Supervizor" : "Training Casier"}
          value={loading ? "…" : (
            deptBooking ? (
              <span style={{ fontSize: 13, color: "#fff" }}>
                {deptBooking.date} · ora {deptBooking.time}
                {" "}
                <a href="https://maps.app.goo.gl/zz3wbXgmXtZcEpTSA" target="_blank" rel="noopener noreferrer" style={{ color: "#B39DFF", fontSize: 11, textDecoration: "none" }}>🗺️ direcții</a>
                {" · "}
                <a href="#" onClick={e => { e.preventDefault(); cancelDeptBooking(); }} style={{ color: "#ff8a8a", fontSize: 11, textDecoration: "none" }}>× anulează</a>
              </span>
            ) : (
              <a href="#" onClick={e => { e.preventDefault(); openDeptModal(); }} style={{ fontSize: 12, color: "#B39DFF" }}>Rezervă loc training</a>
            )
          )}
        />
        )}
        <InfoRow
          label="Recapitulare"
          value={loading ? "…" : (
            repBooking ? (
              <span style={{ fontSize: 13, color: "#fff" }}>
                {repBooking.label || `${repBooking.date} · ${repBooking.time}`}
                {" "}
                <a href="https://maps.app.goo.gl/zz3wbXgmXtZcEpTSA" target="_blank" rel="noopener noreferrer" style={{ color: "#B39DFF", fontSize: 11, textDecoration: "none" }}>🗺️ direcții</a>
                {" · "}
                <a href="#" onClick={e => { e.preventDefault(); cancelRepBooking(); }} style={{ color: "#ff8a8a", fontSize: 11, textDecoration: "none" }}>× anulează</a>
              </span>
            ) : (
              <span style={{ fontSize: 12, color: "rgba(232,230,227,0.55)" }}>
                opțional{" · "}
                <a href="#" onClick={e => { e.preventDefault(); openRepModal(); }} style={{ fontSize: 12, color: "#B39DFF" }}>mă înscriu</a>
              </span>
            )
          )}
        />
        <InfoRow
          label="Status"
          value={<span style={{ padding: "2px 10px", background: "rgba(99,153,34,0.15)", border: "1px solid rgba(99,153,34,0.35)", borderRadius: 999, fontSize: 12, fontWeight: 700, color: "#97C459" }}>{displayStatus}</span>}
        />

        {/* Retrage candidatura button — roșu, incadrat, centrat */}
        <div style={{ marginTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 14, textAlign: "center" }}>
          {!showWithdraw ? (
            <button onClick={() => setShowWithdraw(true)} style={{
              background: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.5)",
              borderRadius: 10,
              padding: "10px 20px",
              fontSize: 13, fontWeight: 600, color: "#ff8a8a",
              cursor: "pointer",
              letterSpacing: "0.02em",
            }}>Retrage candidatura</button>
          ) : (
            <div style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 4 }}>Sigur vrei să te retragi?</div>
              <div style={{ fontSize: 11, color: "rgba(232,230,227,0.6)", marginBottom: 10, lineHeight: 1.5 }}>
                Locul tău va fi redistribuit. Vei primi email de confirmare.
              </div>
              {withdrawError && <div style={{ fontSize: 11, color: "#ff8a8a", marginBottom: 8 }}>{withdrawError}</div>}
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => { setShowWithdraw(false); setWithdrawError(""); }} disabled={withdrawing} style={{
                  flex: 1, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 6, padding: "8px", fontSize: 12, color: "rgba(232,230,227,0.7)",
                  cursor: withdrawing ? "default" : "pointer",
                }}>Nu, renunț</button>
                <button onClick={submitWithdraw} disabled={withdrawing} style={{
                  flex: 1, background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)",
                  borderRadius: 6, padding: "8px", fontSize: 12, fontWeight: 600, color: "#ff8a8a",
                  cursor: withdrawing ? "default" : "pointer",
                }}>{withdrawing ? "…" : "Da, retrage-mă"}</button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Card 3: Sumar ture + Card 4: Următoarea tură */}
      {(() => {
        // Nu avem program încă (nu published, empty, sau eroare) → placeholder
        if (!scheduleData || !scheduleData.published || scheduleData.empty) {
          return (
            <div style={{ background: "rgba(124,77,255,0.06)", border: "1px solid rgba(124,77,255,0.2)", borderRadius: 12, padding: 16, textAlign: "center", marginTop: 12 }}>
              <div style={{ fontSize: 20, marginBottom: 6 }}>📅</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>Turele mele</div>
              <div style={{ fontSize: 12, color: "rgba(232,230,227,0.6)", lineHeight: 1.5 }}>
                {scheduleData?.message || "Turele vor fi disponibile în data de 3 August 2026."}
              </div>
            </div>
          );
        }

        // Calculez sumar
        const shifts = scheduleData.shifts || [];
        function _parseD(s) {
          if (!s) return null;
          const m = String(s).match(/^(\d{1,2})[.\/-](\d{1,2})[.\/-](\d{4})$/);
          if (m) return new Date(parseInt(m[3], 10), parseInt(m[2], 10) - 1, parseInt(m[1], 10));
          const d = new Date(s); return isNaN(d.getTime()) ? null : d;
        }
        const today = new Date(); today.setHours(0, 0, 0, 0);
        let totalHours = 0, workedHours = 0, remainingHours = 0;
        const shiftsWithDate = shifts.map(sh => {
          const d = _parseD(sh.date);
          const isPast = d ? d < today : false;
          const h = sh.hours || 0;
          totalHours += h;
          if (isPast) workedHours += h; else remainingHours += h;
          return { ...sh, _dateObj: d, isPast };
        });
        totalHours = Math.round(totalHours * 10) / 10;
        workedHours = Math.round(workedHours * 10) / 10;
        remainingHours = Math.round(remainingHours * 10) / 10;

        // Următoarea tură (prima non-past, sortată după dată)
        const futureShifts = shiftsWithDate
          .filter(s => !s.isPast)
          .sort((a, b) => (a._dateObj?.getTime() || 0) - (b._dateObj?.getTime() || 0));
        const nextShift = futureShifts[0] || null;

        return (
          <>
            {/* Card 3: Sumar ture */}
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(232,230,227,0.75)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Turele mele</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 12 }}>
                <div style={{ background: "rgba(124,77,255,0.08)", border: "1px solid rgba(124,77,255,0.15)", borderRadius: 10, padding: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{shifts.length}</div>
                  <div style={{ fontSize: 10, color: "rgba(232,230,227,0.75)", marginTop: 2 }}>ture</div>
                </div>
                <div style={{ background: "rgba(124,77,255,0.08)", border: "1px solid rgba(124,77,255,0.15)", borderRadius: 10, padding: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{totalHours}</div>
                  <div style={{ fontSize: 10, color: "rgba(232,230,227,0.75)", marginTop: 2 }}>ore total</div>
                </div>
                <div style={{ background: "rgba(99,153,34,0.10)", border: "1px solid rgba(99,153,34,0.25)", borderRadius: 10, padding: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#97C459" }}>{workedHours}</div>
                  <div style={{ fontSize: 10, color: "rgba(232,230,227,0.75)", marginTop: 2 }}>ore lucrate</div>
                </div>
                <div style={{ background: "rgba(186,117,23,0.08)", border: "1px solid rgba(186,117,23,0.2)", borderRadius: 10, padding: 10, textAlign: "center" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#EF9F27" }}>{remainingHours}</div>
                  <div style={{ fontSize: 10, color: "rgba(232,230,227,0.75)", marginTop: 2 }}>ore rămase</div>
                </div>
              </div>
            </div>

            {/* Card 4: Următoarea tură */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(232,230,227,0.75)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.06em" }}>Următoarea tură</div>
              {nextShift ? (
                <div style={{
                  background: nextShift.isNight ? "rgba(74,144,226,0.08)" : "rgba(255,255,255,0.04)",
                  border: nextShift.isNight ? "1px solid rgba(74,144,226,0.25)" : "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 12, padding: 14,
                }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {nextShift.dayLabel} · {nextShift.date}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                    <span>{nextShift.isNight ? "🌙" : "☀️"}</span>
                    <span>{nextShift.time}</span>
                  </div>
                  {nextShift.esteRezerva ? (
                    <div style={{ background: "rgba(255,193,7,0.07)", border: "1px solid rgba(255,193,7,0.2)", borderRadius: 8, padding: "8px 10px" }}>
                      <div style={{ fontSize: 12, color: "#FFC107", fontWeight: 700, marginBottom: 2 }}>🔁 Tură de rezervă</div>
                      <div style={{ fontSize: 11, color: "rgba(232,230,227,0.7)", lineHeight: 1.5 }}>
                        Postul se stabilește în ziua turei, în funcție de necesități. Se plătește la fel ca o tură principală.
                      </div>
                    </div>
                  ) : (
                    <>
                      {nextShift.cp && (
                        <div style={{ fontSize: 12, color: "rgba(232,230,227,0.7)", marginBottom: 3 }}>
                          <span style={{ color: "#fff", fontFamily: "monospace", background: "rgba(124,77,255,0.25)", padding: "2px 8px", borderRadius: 6, fontSize: 11 }}>{nextShift.cp}</span>
                        </div>
                      )}
                      {nextShift.zone && (
                        <div style={{ fontSize: 12, color: "rgba(232,230,227,0.7)", marginBottom: 3 }}>📍 {nextShift.zone}</div>
                      )}
                      {nextShift.supervisor && (
                        <div style={{ fontSize: 12, color: "rgba(232,230,227,0.6)" }}>
                          👤 Supervizor: <span style={{ color: "rgba(232,230,227,0.85)" }}>{nextShift.supervisor}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div style={{ background: "rgba(99,153,34,0.08)", border: "1px solid rgba(99,153,34,0.2)", borderRadius: 12, padding: 14, textAlign: "center" }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>🎉</div>
                  <div style={{ fontSize: 13, color: "rgba(232,230,227,0.75)" }}>Nu mai ai ture următoare — mulțumim!</div>
                </div>
              )}
            </div>
          </>
        );
      })()}

      {/* Modal rezervare training Casier (dept) */}
      {deptModalOpen && (
        <div onClick={() => setDeptModalOpen(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16, padding: 20, maxWidth: 400, width: "100%", maxHeight: "80vh", overflowY: "auto",
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Alege slot pentru training {statusInfo?.position === "Supervizor" ? "Supervizor" : "Casier"}</div>
            {deptModalLoading ? (
              <div style={{ fontSize: 13, color: "rgba(232,230,227,0.55)" }}>Se încarcă sloturile...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {deptSlots.length === 0 && <div style={{ fontSize: 12, color: "rgba(232,230,227,0.4)" }}>Nu sunt sloturi disponibile.</div>}
                {deptSlots.map(s => {
                  const full = s.available <= 0;
                  return (
                    <button key={s.slotId} onClick={() => bookDeptSlot(s.slotId)} disabled={full || deptBusySlot === s.slotId} style={{
                      background: full ? "rgba(255,255,255,0.04)" : "rgba(124,77,255,0.12)",
                      border: "1px solid " + (full ? "rgba(255,255,255,0.08)" : "rgba(124,77,255,0.35)"),
                      borderRadius: 10, padding: "12px 14px", textAlign: "left",
                      color: full ? "rgba(232,230,227,0.4)" : "#fff",
                      fontSize: 13, cursor: full || deptBusySlot === s.slotId ? "default" : "pointer",
                    }}>
                      <div style={{ fontWeight: 600 }}>{s.date} · ora {s.time}</div>
                      {s.note && <div style={{ fontSize: 11, color: "rgba(232,230,227,0.55)", marginTop: 2 }}>{s.note}</div>}
                      <div style={{ fontSize: 11, marginTop: 3, color: full ? "#ff8a8a" : "rgba(151,196,89,0.85)" }}>
                        {full ? "Plin" : `${s.available} locuri disponibile`}
                        {deptBusySlot === s.slotId && " · Se rezervă..."}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            {deptModalError && <div style={{ fontSize: 12, color: "#ff8a8a", marginTop: 10 }}>{deptModalError}</div>}
            <button onClick={() => setDeptModalOpen(false)} style={{
              width: "100%", marginTop: 12, background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
              padding: "10px", fontSize: 13, color: "rgba(232,230,227,0.7)", cursor: "pointer",
            }}>Închide</button>
          </div>
        </div>
      )}

      {/* Modal rezervare training SSM/PSI */}
      {ssmModalOpen && (
        <div onClick={() => setSsmModalOpen(false)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#1a1a2e", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 16, padding: 20, maxWidth: 400, width: "100%",
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Alege data pentru training SSM/PSI</div>
            {ssmModalLoading ? (
              <div style={{ fontSize: 13, color: "rgba(232,230,227,0.55)" }}>Se încarcă sloturile...</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {ssmSlots.map(s => (
                  <button key={s.id} onClick={() => bookSsmSlot(s.id)} disabled={ssmBusySlot === s.id} style={{
                    background: "rgba(255,193,7,0.1)", border: "1px solid rgba(255,193,7,0.3)",
                    borderRadius: 10, padding: "12px 14px", textAlign: "left",
                    color: "#fff", fontSize: 14, cursor: ssmBusySlot === s.id ? "default" : "pointer",
                  }}>
                    {ssmBusySlot === s.id ? "Se rezervă..." : s.label}
                  </button>
                ))}
              </div>
            )}
            {ssmModalError && <div style={{ fontSize: 12, co
