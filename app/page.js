"use client";
import { useState, useMemo, useEffect, useRef } from "react";

const C = { accent: "#72F94C", accentDark: "#4AD42F", dark: "#0f0f1a", darkMid: "#1a1a2e", darkLight: "#16213e" };
const API_URL = "https://script.google.com/macros/s/AKfycbyBvRDNA7V9HDpwqQTKeLh6q_thnddCcSMGKlYZHMuNvV-5plWUEDHxGkUpv9hGzRltXQ/exec";
const VIEWS = { HOME: "home", APPLY: "apply", STATUS: "status", SHIFTS: "shifts", PAST_SHIFTS: "past_shifts", TEAM: "team" };

function Nav({ view, setView, hasShifts, hasTeam }) {
  const buttons = [
    { v: VIEWS.HOME, l: "Acasă" },
    { v: VIEWS.APPLY, l: "Aplică" },
    { v: VIEWS.STATUS, l: "Status" },
  ];
  if (hasShifts) buttons.push({ v: VIEWS.SHIFTS, l: "Turele mele" });
  if (hasShifts) buttons.push({ v: VIEWS.PAST_SHIFTS, l: "Ture complete" });
  if (hasTeam) buttons.push({ v: VIEWS.TEAM, l: "Echipa mea" });
  
  // Pe ecran mai îngust (sub 600px), ascundem brand-ul ca să încapă tab-urile
  const compactBrand = buttons.length > 4;
  
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(15,15,26,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 12px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56, gap: 8 }}>
        <button onClick={() => setView(VIEWS.HOME)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: `linear-gradient(135deg, #72F94C, #4AD42F)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", fontWeight: 700 }}>C</div>
          <span style={{ 
            fontSize: 13, fontWeight: 600, color: "#fff", letterSpacing: "0.02em",
            display: compactBrand ? "none" : "inline",
          }} className="nav-brand-text">Cashless</span>
        </button>
        <div style={{ display: "flex", gap: 2, justifyContent: "flex-end", overflow: "hidden", flex: 1 }}>
          {buttons.map(b => (
            <button key={b.v} onClick={() => setView(b.v)} style={{
              background: view === b.v ? "rgba(114,249,76,0.15)" : "transparent",
              border: view === b.v ? "1px solid rgba(114,249,76,0.3)" : "1px solid transparent",
              borderRadius: 18, padding: "6px 10px", fontSize: 12, fontWeight: 500, cursor: "pointer",
              color: view === b.v ? C.accent : "rgba(232,230,227,0.6)",
              transition: "all 0.2s",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}>{b.l}</button>
          ))}
        </div>
      </div>
    </nav>
  );
}

function Hero({ setView }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 20px 40px" }}>
      <div style={{ display: "inline-block", padding: "5px 14px", borderRadius: 20, background: "rgba(114,249,76,0.12)", border: "1px solid rgba(114,249,76,0.2)", fontSize: 12, fontFamily: "monospace", color: C.accent, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
        Recrutări 2026
      </div>
      <h1 style={{ fontSize: 36, fontWeight: 800, margin: "0 0 12px", lineHeight: 1.1, letterSpacing: "-0.03em" }}>
        <span style={{ color: "#fff" }}>Fii parte din echipa</span><br />
        <span style={{ background: `linear-gradient(135deg, ${C.accent}, #F9F871)`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Beach Please</span>
      </h1>
      <p style={{ fontSize: 16, color: "rgba(232,230,227,0.55)", margin: "0 0 28px", lineHeight: 1.6, maxWidth: 360, marginLeft: "auto", marginRight: "auto" }}>
        Alătură-te departamentului de Cashless Payment Systems. Plată, acces la festival și experiență unică.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
        <button onClick={() => setView(VIEWS.APPLY)} style={{
          background: `linear-gradient(135deg, #72F94C, #4AD42F)`, border: "none", borderRadius: 14,
          padding: "16px 40px", fontSize: 16, fontWeight: 700, color: "#0a0a0a", cursor: "pointer",
          boxShadow: "0 4px 20px rgba(114,249,76,0.3)", transition: "transform 0.2s, box-shadow 0.2s",
        }} onMouseEnter={e => { e.target.style.transform = "translateY(-2px)"; e.target.style.boxShadow = "0 6px 28px rgba(114,249,76,0.4)"; }}
           onMouseLeave={e => { e.target.style.transform = ""; e.target.style.boxShadow = "0 4px 20px rgba(114,249,76,0.3)"; }}>
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

function InfoCards() {
  const cards = [
    { icon: "💰", title: "Plată", desc: "15 lei net/oră, 40-42 ore pe săptămână. Plata se face după festival." },
    { icon: "🏕️", title: "Camping inclus", desc: "Loc de cort în camping disponibil din 7 Iulie. Dacă preferi altceva, îți asiguri cazarea proprie." },
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

function FAQ() {
  const [open, setOpen] = useState(null);
  const items = [
    { q: "Care e vârsta minimă?", a: "18 ani împliniți la data festivalului." },
    { q: "Se oferă cazare?", a: "Putem oferi loc de cort în camping din 7 Iulie. Dacă preferi altă variantă, trebuie să-ți asiguri cazare proprie în zona Costinești." },
    { q: "Se oferă parcare?", a: "Nu. Nu se oferă loc de parcare. Recomandăm transportul în comun sau organizarea cu alți colegi." },
    { q: "Voi avea tură în fiecare zi?", a: "Da, vei avea tură în fiecare zi de festival (8-12 Iulie 2026)." },
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

function HomePage({ setView }) {
  return (<>
    <Hero setView={setView} />
    <InfoCards />
    <FAQ />
    <div style={{ textAlign: "center", padding: "0 16px 40px" }}>
      <button onClick={() => setView(VIEWS.APPLY)} style={{
        background: `linear-gradient(135deg, #72F94C, #4AD42F)`, border: "none", borderRadius: 14,
        padding: "16px 48px", fontSize: 16, fontWeight: 700, color: "#0a0a0a", cursor: "pointer",
        boxShadow: "0 4px 20px rgba(114,249,76,0.3)",
      }}>Aplică acum</button>
    </div>
  </>);
}

const STEPS = ["Date personale", "Screening", "Date CI", "Confirmare"];

function FormField({ label, required, children, error }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "rgba(232,230,227,0.7)", marginBottom: 6 }}>
        {label} {required && <span style={{ color: C.accent }}>*</span>}
      </label>
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

function ApplyPage({ setView }) {
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [selfiePreview, setSelfiePreview] = useState(null);
  const [selfieBase64, setSelfieBase64] = useState(null);
  const fileRef = useRef(null);
  const [form, setForm] = useState({
    nume: "", prenume: "", telefon: "", email: "", oras: "", dataNasterii: "", socialType: "", socialLink: "",
    situatie: "", cazare: "", experienta: "", motivatie: "",
    serieCi: "", numarCi: "", cnp: "", sex: "", eliberatDe: "", dataCi: "", dataExpirareCi: "", domiciliu: "", orasCi: "", judet: "", cetatenie: "",
    selfie: null,
    confirm1: false, confirm2: false, confirm3: false, confirm4: false, gdprConsent: false, gdprMarketing: false,
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
        const age = (new Date(2026, 6, 8) - new Date(form.dataNasterii)) / (365.25 * 24 * 60 * 60 * 1000);
        if (age < 18) e.dataNasterii = "Trebuie să ai minim 18 ani la data festivalului";
      }
      if (!form.eliberatDe.trim()) e.eliberatDe = "Obligatoriu";
      if (!form.dataCi) e.dataCi = "Obligatoriu";
      if (!form.dataExpirareCi) e.dataExpirareCi = "Obligatoriu";
      if (form.dataCi && form.dataExpirareCi && new Date(form.dataExpirareCi) <= new Date(form.dataCi)) {
        e.dataExpirareCi = "Data expirării trebuie să fie după data eliberării";
      }
      if (form.dataExpirareCi && new Date(form.dataExpirareCi) < new Date(2026, 6, 12)) {
        e.dataExpirareCi = "CI expiră înainte de finalul festivalului (12 Iulie 2026)";
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
      if (!form.confirm4) e.confirm4 = "Trebuie confirmat";
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
      delete payload.confirm4;

      const resp = await fetch(API_URL, {
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
          background: `linear-gradient(135deg, #72F94C, #4AD42F)`, border: "none", borderRadius: 12,
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
        <FormField label="Ai cazare asigurată în zona festivalului?" required error={errors.cazare}>
          <Select value={form.cazare} onChange={v => upd("cazare", v)} options={["Da, am cazare proprie", "Doresc loc de cort în camping", "Îmi voi asigura cazare singur/ă"]} placeholder="Selectează..." />
        </FormField>
        <FormField label="Ai mai participat la un festival major?" required error={errors.experienta}>
          <Select value={form.experienta} onChange={v => upd("experienta", v)} options={["Da, ca staff/voluntar", "Da, ca participant", "Nu, este prima dată"]} placeholder="Selectează..." />
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
          <input ref={fileRef} type="file" accept="image/*" capture="user" onChange={handleSelfie} style={{ display: "none" }} />
        </FormField>
      </div>)}

      {/* Step 2: CI Data */}
      {step === 2 && (<div>
        <div style={{ background: "rgba(114,249,76,0.08)", border: "1px solid rgba(114,249,76,0.15)", borderRadius: 10, padding: 12, marginBottom: 20, fontSize: 12, color: "rgba(232,230,227,0.5)", lineHeight: 1.5 }}>
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
            <Input value={form.sex} onChange={() => {}} placeholder="—" readOnly style={{ background: "rgba(114,249,76,0.05)", cursor: "not-allowed" }} />
          </FormField>
          <FormField label="Data nașterii" required error={errors.dataNasterii}>
            <Input value={form.dataNasterii} onChange={() => {}} type="date" readOnly style={{ background: "rgba(114,249,76,0.05)", cursor: "not-allowed" }} />
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
          { key: "confirm1", text: "Confirm că am citit și înțeles condițiile: plata este de 15 lei/oră, se oferă loc de cort în camping, nu se oferă parcare, voi avea tură zilnic." },
          { key: "confirm2", text: "Confirm că datele introduse sunt corecte și reale. Înțeleg că orice neconcordanță duce la excludere." },
          { key: "confirm3", text: "Mă angajez să fiu disponibil/ă pentru toată durata festivalului (8-12 Iulie) și pentru training-urile premergătoare." },
          { key: "confirm4", text: "Am citit și sunt de acord cu Regulamentul de Ordine Interioară. Înțeleg că nerespectarea acestuia poate duce la încetarea colaborării." },
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
            Datele tale personale sunt colectate și prelucrate de echipa Cashless Payment Systems (operator de date contact: recrutarifestival@gmail.com) în scopul recrutării pentru poziția de casier în cadrul festivalului Beach, Please! 2026.
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
              <strong style={{ color: "rgba(232,230,227,0.8)" }}>Consimțământ obligatoriu:</strong> Sunt de acord cu prelucrarea datelor mele personale în scopul recrutării pentru Beach, Please! 2026, conform informațiilor de mai sus.
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
              <strong style={{ color: "rgba(232,230,227,0.8)" }}>Opțional:</strong> Sunt de acord ca datele mele să fie păstrate și utilizate pentru viitoare campanii de recrutare organizate de echipa Cashless Payment Systems (inclusiv pentru alte festivaluri: Untold, Kapital etc.). Pot retrage acest consimțământ oricând.
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
          flex: 2, background: submitting ? "rgba(114,249,76,0.3)" : `linear-gradient(135deg, #72F94C, #4AD42F)`, border: "none",
          borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 600, color: "#0a0a0a", cursor: submitting ? "wait" : "pointer",
          opacity: submitting ? 0.7 : 1,
        }}>
          {submitting ? "Se trimite..." : step === 3 ? "Trimite aplicația" : "Continuă"}
        </button>
      </div>
    </div>
  );
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
// ACCEPTED FLOW (pagina principală pentru status="accepted")
// ============================================

// ============================================
// MY SHIFTS - turele mele
// ============================================

function MyShifts({ phone, pastOnly = false }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  async function loadShifts() {
    setError(null);
    try {
      const url = `${API_URL}?action=schedule&phone=${encodeURIComponent(phone)}&t=${Date.now()}`;
      const resp = await fetch(url, { method: "GET", cache: "no-store", credentials: "omit" });
      const text = await resp.text();
      const result = JSON.parse(text);
      if (result.success) {
        setData(result);
      } else {
        setError(result.error || "Eroare la încărcarea programului");
      }
    } catch (err) {
      setError("Eroare conexiune: " + err.message);
    }
    setLoading(false);
    setRefreshing(false);
  }

  useEffect(() => {
    if (phone) loadShifts();
  }, [phone]);

  async function handleRefresh() {
    setRefreshing(true);
    await loadShifts();
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: 24, color: "rgba(232,230,227,0.4)", fontSize: 13 }}>
        Se încarcă programul...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ background: "rgba(226,75,74,0.08)", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 12, padding: 16, fontSize: 13, color: "#ff9999" }}>
        {error}
        <button onClick={handleRefresh} style={{
          display: "block", marginTop: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8, padding: "8px 16px", fontSize: 12, color: "rgba(232,230,227,0.7)", cursor: "pointer",
        }}>Reîncearcă</button>
      </div>
    );
  }

  // Programul nu e încă publicat / candidatul nu e Complete
  if (data && !data.published) {
    return (
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 18, textAlign: "center" }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>📅</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 6 }}>Programul tău</div>
        <div style={{ fontSize: 12, color: "rgba(232,230,227,0.5)", lineHeight: 1.6 }}>
          {data.message || "Programul va fi publicat cu ~7 zile înainte de festival."}
        </div>
      </div>
    );
  }

  // Empty - nu am găsit ture pentru tine
  if (data && data.empty) {
    return (
      <div style={{ background: "rgba(186,117,23,0.08)", border: "1px solid rgba(186,117,23,0.2)", borderRadius: 12, padding: 18, textAlign: "center" }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>🤔</div>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#EF9F27", marginBottom: 6 }}>Nu am găsit turele tale</div>
        <div style={{ fontSize: 12, color: "rgba(232,230,227,0.5)", lineHeight: 1.6 }}>
          {data.message || "Contactează coordonatorul pentru detalii."}
        </div>
        <button onClick={handleRefresh} disabled={refreshing} style={{
          marginTop: 12, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8, padding: "8px 16px", fontSize: 12, color: "rgba(232,230,227,0.7)", cursor: "pointer",
        }}>{refreshing ? "Se reîncarcă..." : "🔄 Reîncearcă"}</button>
      </div>
    );
  }

  // Filtrare după trecut/actual
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const allShifts = data?.shifts || [];
  const filteredShifts = allShifts.filter(s => {
    if (!s.date) return !pastOnly;
    const shiftDate = new Date(s.date);
    if (pastOnly) return shiftDate < today;
    return shiftDate >= today;
  });
  
  // Recalculăm summary
  let filteredHours = 0;
  const filteredZones = new Set();
  filteredShifts.forEach(s => {
    filteredHours += s.hours || 0;
    if (s.zone) filteredZones.add(s.zone);
  });
  const filteredSummary = {
    totalShifts: filteredShifts.length,
    totalHours: Math.round(filteredHours * 10) / 10,
    zones: [...filteredZones],
  };
  
  // Empty state pentru filtru
  if (filteredShifts.length === 0 && allShifts.length > 0) {
    return (
      <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 18, textAlign: "center" }}>
        <div style={{ fontSize: 28, marginBottom: 8 }}>{pastOnly ? "📜" : "✨"}</div>
        <div style={{ fontSize: 13, color: "rgba(232,230,227,0.5)", lineHeight: 1.6 }}>
          {pastOnly 
            ? "Nu ai ture trecute deocamdată. Aici vor apărea turele după ce sunt finalizate."
            : "Nu ai ture viitoare. Verifică tab-ul \"Ture complete\" pentru istoric."}
        </div>
      </div>
    );
  }
  
  // Avem ture - le grupăm pe zi
  const shiftsByDay = {};
  filteredShifts.forEach(s => {
    const key = s.date || "necunoscut";
    if (!shiftsByDay[key]) shiftsByDay[key] = { label: s.label, shifts: [] };
    shiftsByDay[key].shifts.push(s);
  });
  const sortedDays = Object.keys(shiftsByDay).sort((a, b) => 
    pastOnly ? b.localeCompare(a) : a.localeCompare(b)
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
          {pastOnly ? "📜 Ture complete" : "📅 Turele mele"}
        </div>
        <button onClick={handleRefresh} disabled={refreshing} style={{
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8, padding: "6px 12px", fontSize: 11, color: "rgba(232,230,227,0.6)", cursor: "pointer",
        }}>{refreshing ? "..." : "🔄"}</button>
      </div>

      {/* Summary */}
      {filteredSummary.totalShifts > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 14 }}>
          <div style={{ background: "rgba(114,249,76,0.08)", border: "1px solid rgba(114,249,76,0.15)", borderRadius: 10, padding: 10, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.accent }}>{filteredSummary.totalShifts}</div>
            <div style={{ fontSize: 10, color: "rgba(232,230,227,0.5)", marginTop: 2 }}>ture</div>
          </div>
          <div style={{ background: "rgba(114,249,76,0.08)", border: "1px solid rgba(114,249,76,0.15)", borderRadius: 10, padding: 10, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.accent }}>{filteredSummary.totalHours}</div>
            <div style={{ fontSize: 10, color: "rgba(232,230,227,0.5)", marginTop: 2 }}>ore</div>
          </div>
          <div style={{ background: "rgba(114,249,76,0.08)", border: "1px solid rgba(114,249,76,0.15)", borderRadius: 10, padding: 10, textAlign: "center" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.accent }}>{filteredSummary.zones?.length || 0}</div>
            <div style={{ fontSize: 10, color: "rgba(232,230,227,0.5)", marginTop: 2 }}>{filteredSummary.zones?.length === 1 ? "zonă" : "zone"}</div>
          </div>
        </div>
      )}

      {/* Shifts grouped by day */}
      {sortedDays.map(day => (
        <div key={day} style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            {shiftsByDay[day].label}
          </div>
          {shiftsByDay[day].shifts.map((s, i) => (
            <div key={`${s.date}_${s.cp}_${s.time}_${i}`} style={{
              background: s.isNight ? "rgba(74,144,226,0.08)" : "rgba(255,255,255,0.04)",
              border: s.isNight ? "1px solid rgba(74,144,226,0.25)" : "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12, padding: 12, marginBottom: 6,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: 6 }}>
                  {s.isNight && <span>🌙</span>}
                  {s.isNight === false && <span>☀️</span>}
                  <span>{s.time || "—"}</span>
                  {s.myRole === "Supervizor" && (
                    <span style={{ fontSize: 9, color: "#FFB347", background: "rgba(255,179,71,0.12)", border: "1px solid rgba(255,179,71,0.3)", padding: "2px 6px", borderRadius: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>Supervizor</span>
                  )}
                </div>
                {/* CP-uri (suportă și grupare) */}
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {s.cps && s.cps.length > 0 ? (
                    s.cps.map(cp => (
                      <div key={cp} style={{ fontSize: 11, color: C.accent, fontFamily: "monospace", background: "rgba(114,249,76,0.1)", padding: "2px 8px", borderRadius: 6 }}>{cp}</div>
                    ))
                  ) : s.cp ? (
                    <div style={{ fontSize: 11, color: C.accent, fontFamily: "monospace", background: "rgba(114,249,76,0.1)", padding: "2px 8px", borderRadius: 6 }}>{s.cp}</div>
                  ) : null}
                </div>
              </div>
              {/* Zone (suportă și multiple) */}
              {s.zones && s.zones.length > 0 ? (
                <div style={{ fontSize: 12, color: "rgba(232,230,227,0.7)", marginBottom: 4 }}>📍 {s.zones.join(", ")}</div>
              ) : s.zone ? (
                <div style={{ fontSize: 12, color: "rgba(232,230,227,0.7)", marginBottom: 4 }}>📍 {s.zone}</div>
              ) : null}
              {s.supervisor && s.myRole !== "Supervizor" && (
                <div style={{ fontSize: 12, color: "rgba(232,230,227,0.6)", marginBottom: 4 }}>
                  👤 Supervizor: <span style={{ color: "rgba(232,230,227,0.85)" }}>{s.supervisor}</span>
                </div>
              )}
              {/* Echipa: dacă avem teamsByCP (supervizor cu mai multe CP-uri), afișăm separat per CP */}
              {s.teamsByCP && s.teamsByCP.length > 0 ? (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  {s.teamsByCP.map((tc, idx) => (
                    <div key={tc.cp + idx} style={{ marginBottom: idx < s.teamsByCP.length - 1 ? 8 : 0 }}>
                      <div style={{ fontSize: 11, color: "rgba(232,230,227,0.5)", marginBottom: 3, fontWeight: 600 }}>
                        <span style={{ color: C.accent }}>{tc.cp}</span>
                        {tc.zone && <span style={{ color: "rgba(232,230,227,0.5)" }}> · {tc.zone}</span>}
                        {tc.team && tc.team.length > 0 && <span style={{ color: "rgba(232,230,227,0.4)" }}> · {tc.team.length} casieri</span>}
                      </div>
                      {tc.team && tc.team.length > 0 && (
                        <div style={{ fontSize: 11, color: "rgba(232,230,227,0.7)", lineHeight: 1.6 }}>
                          {tc.team.join(" • ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : s.team && s.team.length > 0 ? (
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                  <div style={{ fontSize: 11, color: "rgba(232,230,227,0.5)", marginBottom: 4, fontWeight: 600 }}>
                    👥 {s.myRole === "Supervizor" ? "Echipa ta" : "Echipa"} ({s.team.length}):
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(232,230,227,0.7)", lineHeight: 1.6 }}>
                    {s.team.join(" • ")}
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

function AcceptedFlow({ phone, firstName, statusInfo, refreshStatus }) {
  const [documents, setDocuments] = useState(null);
  const [signModal, setSignModal] = useState(null); // { type, title, docName }
  const [busyDoc, setBusyDoc] = useState(null); // "contract" | "fisa" | "roi" | "ci"
  const [error, setError] = useState(null);
  const [allComplete, setAllComplete] = useState(false);
  // Optimistic UI: marchează documente ca semnate instant local
  const [optimisticSigned, setOptimisticSigned] = useState({
    contract: false, fisa: false, roi: false, ci: false
  });

  // Load document URLs when component mounts
  useEffect(() => {
    if (!phone) return;
    fetch(`${API_URL}?action=documents&phone=${encodeURIComponent(phone)}`)
      .then(r => r.json())
      .then(data => {
        if (data.success && data.documents) {
          setDocuments(data.documents);
        }
      })
      .catch(err => setError("Nu pot încărca documentele: " + err.message));
  }, [phone]);

  // Check if all complete (optimistic + real)
  useEffect(() => {
    const real = {
      contract: !!statusInfo?.contractSemnat,
      fisa: !!statusInfo?.fisaSemnat,
      roi: !!statusInfo?.roiSemnat,
      ci: !!statusInfo?.ciIncarcat,
    };
    const all = (real.contract || optimisticSigned.contract) &&
                (real.fisa || optimisticSigned.fisa) &&
                (real.roi || optimisticSigned.roi) &&
                (real.ci || optimisticSigned.ci);
    setAllComplete(all);
  }, [statusInfo, optimisticSigned]);

  async function handleSign(docType, signatureBase64) {
    setError(null);
    setSignModal(null);
    
    // OPTIMISTIC: marcăm documentul ca semnat instant
    setOptimisticSigned(prev => ({ ...prev, [docType]: true }));
    setBusyDoc(docType);
    
    try {
      const resp = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "sign",
          phone: phone,
          docType: docType,
          signatureBase64: signatureBase64,
        }),
      });
      const result = await resp.json();
      if (result.success) {
        // Backend confirmă - reîncărcăm statusul real
        await refreshStatus();
      } else {
        // Eșec - revertăm optimistic
        setOptimisticSigned(prev => ({ ...prev, [docType]: false }));
        setError(result.error || "Eroare la semnare. Încearcă din nou.");
      }
    } catch (err) {
      // Eșec rețea - revertăm optimistic
      setOptimisticSigned(prev => ({ ...prev, [docType]: false }));
      setError("Eroare conexiune: " + err.message);
    }
    setBusyDoc(null);
  }

  async function handleCIUpload(base64, mimeType, fileName) {
    setError(null);
    
    // OPTIMISTIC
    setOptimisticSigned(prev => ({ ...prev, ci: true }));
    setBusyDoc("ci");
    
    try {
      const resp = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({
          action: "uploadCI",
          phone: phone,
          fileBase64: base64,
          mimeType: mimeType,
          fileName: fileName,
        }),
      });
      const result = await resp.json();
      if (result.success) {
        await refreshStatus();
      } else {
        setOptimisticSigned(prev => ({ ...prev, ci: false }));
        setError(result.error || "Eroare la upload.");
      }
    } catch (err) {
      setOptimisticSigned(prev => ({ ...prev, ci: false }));
      setError("Eroare conexiune: " + err.message);
    }
    setBusyDoc(null);
  }

  async function handleFinalize() {
    setBusyDoc("finalize");
    try {
      const resp = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "finalize", phone: phone }),
      });
      const result = await resp.json();
      if (result.success) {
        await refreshStatus();
      }
    } catch (err) {
      setError("Eroare conexiune: " + err.message);
    }
    setBusyDoc(null);
  }

  // Display "Complete" state
  if (statusInfo?.statusFinal === "Complete") {
    return (
      <div>
        <div style={{ background: "rgba(99,153,34,0.08)", border: "1px solid rgba(99,153,34,0.3)", borderRadius: 16, padding: 24, textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#97C459", marginBottom: 8 }}>Totul e gata!</div>
          <div style={{ fontSize: 13, color: "rgba(232,230,227,0.6)", lineHeight: 1.6, maxWidth: 320, margin: "0 auto" }}>
            Toate documentele tale au fost trimise cu succes. Vei primi în curând un email cu detaliile finale și informații despre training-uri.
          </div>
          <div style={{ fontSize: 12, color: "rgba(232,230,227,0.4)", marginTop: 16, fontFamily: "monospace" }}>
            Ne vedem la Beach Please! 🏖️
          </div>
        </div>
        
        <div style={{ background: "rgba(114,249,76,0.06)", border: "1px solid rgba(114,249,76,0.2)", borderRadius: 12, padding: 16, textAlign: "center" }}>
          <div style={{ fontSize: 20, marginBottom: 6 }}>📅</div>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 4 }}>Programul tău e disponibil</div>
          <div style={{ fontSize: 12, color: "rgba(232,230,227,0.6)", lineHeight: 1.5 }}>
            Mergi la tab-ul <strong style={{ color: C.accent }}>"Turele mele"</strong> din meniul de sus pentru a vedea turele tale.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div style={{ background: "rgba(99,153,34,0.08)", border: "1px solid rgba(99,153,34,0.2)", borderRadius: 16, padding: 18, textAlign: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#97C459", marginBottom: 4 }}>
          Felicitări{firstName ? `, ${firstName}` : ""}!
        </div>
        <div style={{ fontSize: 13, color: "rgba(232,230,227,0.6)", lineHeight: 1.5 }}>
          Aplicația ta a fost acceptată. Mai ai câțiva pași simpli de făcut.
        </div>
      </div>

      {/* GDPR Disclaimer */}
      <div style={{ background: "rgba(114,249,76,0.05)", border: "1px solid rgba(114,249,76,0.15)", borderRadius: 10, padding: 12, marginBottom: 16, fontSize: 11, color: "rgba(232,230,227,0.55)", lineHeight: 1.6 }}>
        ⚠️ <strong style={{ color: "rgba(232,230,227,0.8)" }}>Notă:</strong> Prin semnarea electronică a documentelor de mai jos, confirmi acordul tău cu modul de semnare prevăzut în Regulamentul de Ordine Interioară (OUG 36/2021, Legea 208/2021). Fiecare semnătură este înregistrată cu timestamp și hash criptografic ca dovadă a autenticității.
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 10 }}>Documente de semnat</div>

      <DocumentCard
        title="Contract Individual de Muncă"
        signed={!!statusInfo?.contractSemnat || optimisticSigned.contract}
        viewUrl={documents?.contract?.url}
        pdfUrl={documents?.contract?.pdfUrl}
        onSign={() => setSignModal({ type: "contract", title: "Semnează contractul", docName: "Contract Individual de Muncă" })}
        busy={busyDoc === "contract"}
      />

      <DocumentCard
        title="Fișa Postului"
        signed={!!statusInfo?.fisaSemnat || optimisticSigned.fisa}
        viewUrl={documents?.fisa?.url}
        pdfUrl={documents?.fisa?.pdfUrl}
        onSign={() => setSignModal({ type: "fisa", title: "Semnează fișa postului", docName: "Fișa Postului" })}
        busy={busyDoc === "fisa"}
      />

      <DocumentCard
        title="Regulament de Ordine Interioară"
        signed={!!statusInfo?.roiSemnat || optimisticSigned.roi}
        viewUrl={documents?.roi?.url}
        pdfUrl={documents?.roi?.pdfUrl}
        onSign={() => setSignModal({ type: "roi", title: "Semnează ROI", docName: "Regulament de Ordine Interioară" })}
        busy={busyDoc === "roi"}
      />

      <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginTop: 16, marginBottom: 10 }}>Documente de încărcat</div>

      <CIUploadCard
        uploaded={!!statusInfo?.ciIncarcat || optimisticSigned.ci}
        onUpload={handleCIUpload}
        busy={busyDoc === "ci"}
      />

      {/* Error message */}
      {error && (
        <div style={{ background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.3)", borderRadius: 10, padding: 12, marginTop: 12, fontSize: 13, color: "#ff6b6b" }}>
          {error}
        </div>
      )}

      {/* Progress summary + Finalize button */}
      <div style={{ marginTop: 24, padding: 16, background: "rgba(255,255,255,0.04)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
        {(() => {
          const done = [
            !!statusInfo?.contractSemnat || optimisticSigned.contract,
            !!statusInfo?.fisaSemnat || optimisticSigned.fisa,
            !!statusInfo?.roiSemnat || optimisticSigned.roi,
            !!statusInfo?.ciIncarcat || optimisticSigned.ci,
          ].filter(Boolean).length;
          return (
            <>
              <div style={{ fontSize: 12, color: "rgba(232,230,227,0.5)", marginBottom: 8 }}>
                Progres: {done} / 4
              </div>
              <div style={{ height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden", marginBottom: 14 }}>
                <div style={{
                  width: `${done / 4 * 100}%`,
                  height: "100%", background: `linear-gradient(90deg, ${C.accent}, #F9F871)`,
                  transition: "width 0.4s",
                }} />
              </div>
            </>
          );
        })()}
        <button onClick={handleFinalize} disabled={!allComplete || busyDoc} style={{
          width: "100%",
          background: allComplete ? `linear-gradient(135deg, #72F94C, #4AD42F)` : "rgba(255,255,255,0.06)",
          border: allComplete ? "none" : "1px solid rgba(255,255,255,0.1)",
          borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700,
          color: allComplete ? "#0a0a0a" : "rgba(232,230,227,0.3)",
          cursor: allComplete && !busyDoc ? "pointer" : "default",
        }}>
          {busyDoc === "finalize" ? "Se finalizează..." : 
           allComplete ? "✓ Trimite tot" : "Completează toate documentele"}
        </button>
      </div>

      {/* Signature Modal */}
      <SignaturePadModal
        isOpen={!!signModal}
        onClose={() => setSignModal(null)}
        title={signModal?.title}
        docName={signModal?.docName}
        onSave={(base64) => {
          if (signModal) handleSign(signModal.type, base64);
        }}
      />
    </div>
  );
}

// ============================================
// SHIFTS PAGE - tab dedicat "Turele mele"
// ============================================

function ShiftsPage({ phone, onLogout, pastOnly = false }) {
  if (!phone) {
    return (
      <div style={{ padding: "40px 16px", maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{pastOnly ? "📜" : "📅"}</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
          {pastOnly ? "Ture complete" : "Turele mele"}
        </div>
        <div style={{ fontSize: 13, color: "rgba(232,230,227,0.5)", lineHeight: 1.6, maxWidth: 320, margin: "0 auto" }}>
          Mergi la tab-ul "Status", introdu numărul de telefon, și după ce confirmi că ai semnat toate documentele, vei putea vedea turele tale aici.
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ padding: "32px 16px", maxWidth: 520, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 }}>
          {pastOnly ? "📜 Ture complete" : "📅 Turele mele"}
        </h2>
        {onLogout && (
          <button onClick={() => {
            if (confirm("Sigur vrei să deconectezi acest dispozitiv? Va trebui să verifici din nou statusul.")) {
              onLogout();
            }
          }} style={{
            background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
            padding: "6px 12px", fontSize: 11, color: "rgba(232,230,227,0.5)", cursor: "pointer",
          }}>Deconectare</button>
        )}
      </div>
      
      <MyShifts phone={phone} pastOnly={pastOnly} />
    </div>
  );
}


// ============================================
// TEAM PAGE - tab dedicat "Echipa mea" (doar pentru Supervizori)
// ============================================

function TeamPage({ phone, onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedShift, setCopiedShift] = useState(null);
  
  async function loadTeam() {
    setError(null);
    try {
      const url = `${API_URL}?action=team&phone=${encodeURIComponent(phone)}&t=${Date.now()}`;
      const resp = await fetch(url, { method: "GET", cache: "no-store", credentials: "omit" });
      const text = await resp.text();
      const result = JSON.parse(text);
      if (result.success) {
        setData(result);
      } else {
        setError(result.error || "Eroare la încărcarea echipei");
      }
    } catch (err) {
      setError("Eroare conexiune: " + err.message);
    }
    setLoading(false);
    setRefreshing(false);
  }
  
  useEffect(() => {
    if (phone) loadTeam();
  }, [phone]);
  
  async function handleRefresh() {
    setRefreshing(true);
    await loadTeam();
  }
  
  function copyPhones(team, shiftKey) {
    const phones = team.filter(t => t.phone).map(t => t.phone).join(", ");
    if (!phones) {
      alert("Niciun telefon disponibil în această echipă.");
      return;
    }
    
    // Try modern clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(phones).then(() => {
        setCopiedShift(shiftKey);
        setTimeout(() => setCopiedShift(null), 2000);
      }).catch(() => fallbackCopy(phones, shiftKey));
    } else {
      fallbackCopy(phones, shiftKey);
    }
  }
  
  function fallbackCopy(text, shiftKey) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      setCopiedShift(shiftKey);
      setTimeout(() => setCopiedShift(null), 2000);
    } catch (e) {
      alert("Nu am putut copia. Selectează manual:\n\n" + text);
    }
    document.body.removeChild(textarea);
  }
  
  function openWhatsApp(team) {
    const phones = team.filter(t => t.phone).map(t => t.phone);
    if (phones.length === 0) {
      alert("Niciun telefon disponibil în această echipă.");
      return;
    }
    if (phones.length === 1) {
      // Direct la o singură persoană
      const cleanPhone = phones[0].replace(/\D/g, "").replace(/^0/, "40");
      window.open(`https://wa.me/${cleanPhone}`, "_blank");
    } else {
      // Pentru mai multe: deschidem WhatsApp generic și utilizatorul alege contactele
      // wa.me nu suportă mass messaging, deci doar deschidem WhatsApp
      const message = encodeURIComponent("Salut! Mesaj pentru echipa mea de tură.");
      // Pe Android/iOS: whatsapp://send? funcționează; pe web: web.whatsapp.com
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      if (isMobile) {
        window.open(`whatsapp://send?text=${message}`, "_blank");
      } else {
        window.open(`https://web.whatsapp.com/`, "_blank");
      }
    }
  }
  
  if (!phone) {
    return (
      <div style={{ padding: "40px 16px", maxWidth: 520, margin: "0 auto", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
        <div style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Echipa mea</div>
        <div style={{ fontSize: 13, color: "rgba(232,230,227,0.5)", lineHeight: 1.6, maxWidth: 320, margin: "0 auto" }}>
          Această secțiune e doar pentru supervizori. Mergi la "Status" pentru a verifica.
        </div>
      </div>
    );
  }
  
  return (
    <div style={{ padding: "32px 16px", maxWidth: 520, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: 0 }}>👥 Echipa mea</h2>
        <button onClick={handleRefresh} disabled={refreshing} style={{
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 8, padding: "6px 12px", fontSize: 11, color: "rgba(232,230,227,0.6)", cursor: "pointer",
        }}>{refreshing ? "..." : "🔄"}</button>
      </div>
      
      {loading && (
        <div style={{ textAlign: "center", padding: 24, color: "rgba(232,230,227,0.4)", fontSize: 13 }}>
          Se încarcă echipa...
        </div>
      )}
      
      {error && (
        <div style={{ background: "rgba(226,75,74,0.08)", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 12, padding: 16, fontSize: 13, color: "#ff9999" }}>
          {error}
        </div>
      )}
      
      {!loading && data && !data.published && (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 18, textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>📅</div>
          <div style={{ fontSize: 12, color: "rgba(232,230,227,0.5)", lineHeight: 1.6 }}>
            {data.message || "Echipa va fi disponibilă când programul e gata."}
          </div>
        </div>
      )}
      
      {!loading && data && data.empty && (
        <div style={{ background: "rgba(186,117,23,0.08)", border: "1px solid rgba(186,117,23,0.2)", borderRadius: 12, padding: 18, textAlign: "center" }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>🤔</div>
          <div style={{ fontSize: 12, color: "rgba(232,230,227,0.5)", lineHeight: 1.6 }}>
            {data.message || "Nu am găsit ture ca supervizor pentru tine."}
          </div>
        </div>
      )}
      
      {/* Carduri per tură - doar viitoare/azi */}
      {(() => {
        if (!data || !data.shifts) return null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const futureShifts = data.shifts.filter(s => {
          if (!s.date) return true;
          return new Date(s.date) >= today;
        });
        
        if (futureShifts.length === 0 && data.shifts.length > 0) {
          return (
            <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 18, textAlign: "center" }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>✨</div>
              <div style={{ fontSize: 13, color: "rgba(232,230,227,0.5)", lineHeight: 1.6 }}>
                Nu mai ai ture viitoare ca supervizor.
              </div>
            </div>
          );
        }
        
        return futureShifts.map((s, i) => {
          const shiftKey = `${s.date}_${s.cps ? s.cps.join("_") : s.cp}_${s.time}_${i}`;
          
          // Aplatizăm toate echipele într-o listă unică pentru butoane (combinate)
          const allMembers = [];
          if (s.teamsByCP && s.teamsByCP.length > 0) {
            s.teamsByCP.forEach(tc => {
              (tc.team || []).forEach(member => {
                // teamsByCP din parseSupervisorShifts vine cu obiecte {fullName, nume, prenume, phone}
                allMembers.push(member);
              });
            });
          } else if (s.team) {
            // Backward compat
            s.team.forEach(m => allMembers.push(m));
          }
          
          const phonesAvailable = allMembers.filter(m => m.phone).length;
          const totalMembers = s.totalMembers || allMembers.length;
          
          // Lista CP-urilor pentru badge
          const cpList = s.cps && s.cps.length > 0 ? s.cps : (s.cp ? [s.cp] : []);
          // Lista zonelor
          const zoneList = s.zones && s.zones.length > 0 ? s.zones : (s.zone ? [s.zone] : []);
          
          return (
            <div key={shiftKey} style={{
              background: s.isNight ? "rgba(74,144,226,0.06)" : "rgba(255,255,255,0.04)",
              border: s.isNight ? "1px solid rgba(74,144,226,0.2)" : "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12, padding: 14, marginBottom: 12,
            }}>
              {/* Header tură */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8, gap: 8 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.accent, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{s.label}</div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
                    {s.isNight ? "🌙" : "☀️"} {s.time}
                  </div>
                </div>
                {/* CP badges */}
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                  {cpList.map(cp => (
                    <div key={cp} style={{ fontSize: 11, color: C.accent, fontFamily: "monospace", background: "rgba(114,249,76,0.1)", padding: "3px 8px", borderRadius: 6 }}>{cp}</div>
                  ))}
                </div>
              </div>
              
              {zoneList.length > 0 && (
                <div style={{ fontSize: 12, color: "rgba(232,230,227,0.6)", marginBottom: 8 }}>📍 {zoneList.join(", ")}</div>
              )}
              
              {/* Echipele - per CP */}
              {s.teamsByCP && s.teamsByCP.length > 0 ? (
                s.teamsByCP.map((tc, tcIdx) => (
                  <div key={tc.cp + tcIdx} style={{ marginTop: 10, padding: 10, background: "rgba(0,0,0,0.15)", borderRadius: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(232,230,227,0.6)", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ color: C.accent }}>{tc.cp}</span>
                      {tc.zone && <span style={{ color: "rgba(232,230,227,0.4)" }}>· {tc.zone}</span>}
                      <span style={{ color: "rgba(232,230,227,0.4)" }}>· {tc.team.length} {tc.team.length === 1 ? "casier" : "casieri"}</span>
                    </div>
                    {tc.team.map((member, idx) => (
                      <div key={idx} style={{ 
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "6px 0", borderBottom: idx < tc.team.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                      }}>
                        <div style={{ fontSize: 13, color: "rgba(232,230,227,0.85)" }}>
                          {member.fullName}
                        </div>
                        {member.phone ? (
                          <a href={`tel:${member.phone}`} style={{ fontSize: 12, color: C.accent, textDecoration: "none", fontFamily: "monospace" }}>
                            📞 {member.phone}
                          </a>
                        ) : (
                          <span style={{ fontSize: 11, color: "rgba(232,230,227,0.3)", fontStyle: "italic" }}>fără tel.</span>
                        )}
                      </div>
                    ))}
                  </div>
                ))
              ) : (
                /* Fallback: dacă nu există teamsByCP, folosim s.team direct */
                s.team && s.team.length > 0 && (
                  <div style={{ marginTop: 10, padding: 10, background: "rgba(0,0,0,0.15)", borderRadius: 8 }}>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(232,230,227,0.6)", marginBottom: 6 }}>
                      ECHIPA ({s.team.length} {s.team.length === 1 ? "casier" : "casieri"})
                    </div>
                    {s.team.map((member, idx) => (
                      <div key={idx} style={{ 
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "6px 0", borderBottom: idx < s.team.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                      }}>
                        <div style={{ fontSize: 13, color: "rgba(232,230,227,0.85)" }}>
                          {member.fullName}
                        </div>
                        {member.phone ? (
                          <a href={`tel:${member.phone}`} style={{ fontSize: 12, color: C.accent, textDecoration: "none", fontFamily: "monospace" }}>
                            📞 {member.phone}
                          </a>
                        ) : (
                          <span style={{ fontSize: 11, color: "rgba(232,230,227,0.3)", fontStyle: "italic" }}>fără tel.</span>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
              
              {/* Butoane acțiuni - combinate pentru toți casierii din toate CP-urile */}
              {phonesAvailable > 0 && (
                <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                  <button onClick={() => copyPhones(allMembers, shiftKey)} style={{
                    flex: 1, background: copiedShift === shiftKey ? "rgba(114,249,76,0.2)" : "rgba(255,255,255,0.06)",
                    border: copiedShift === shiftKey ? "1px solid rgba(114,249,76,0.4)" : "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8, padding: "10px", fontSize: 12, fontWeight: 600,
                    color: copiedShift === shiftKey ? C.accent : "rgba(232,230,227,0.7)", cursor: "pointer",
                    transition: "all 0.2s",
                  }}>
                    {copiedShift === shiftKey ? "✓ Copiat!" : `📋 Copiază telefoane (${phonesAvailable})`}
                  </button>
                  <button onClick={() => openWhatsApp(allMembers)} style={{
                    flex: 1, background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.3)",
                    borderRadius: 8, padding: "10px", fontSize: 12, fontWeight: 600,
                    color: "#25D366", cursor: "pointer",
                  }}>
                    💬 WhatsApp
                  </button>
                </div>
              )}
            </div>
          );
        });
      })()}
      
      {/* Logout */}
      {onLogout && (
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <button onClick={() => {
            if (confirm("Sigur vrei să deconectezi acest dispozitiv?")) onLogout();
          }} style={{
            background: "transparent", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
            padding: "8px 16px", fontSize: 11, color: "rgba(232,230,227,0.4)", cursor: "pointer",
          }}>Deconectare</button>
        </div>
      )}
    </div>
  );
}


function StatusPage({ onCompleteDetected }) {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState(null);
  const [searching, setSearching] = useState(false);

  async function checkStatus(phoneToCheck) {
    let targetPhone = (phoneToCheck || phone || "").replace(/[^0-9]/g, "");
    // Normalizare: dacă începe cu 40 și are 11+ cifre, asumăm prefix internațional
    if (targetPhone.startsWith("40") && targetPhone.length >= 11) {
      targetPhone = "0" + targetPhone.substring(2);
    }
    if (targetPhone.length < 10) {
      setStatus({ found: false, error: "Numărul trebuie să aibă 10 cifre. Ai introdus: " + targetPhone.length + " cifre." });
      return;
    }
    
    setSearching(true);
    setStatus(null);
    
    try {
      const url = `${API_URL}?action=status&phone=${encodeURIComponent(targetPhone)}&t=${Date.now()}`;
      const resp = await fetch(url, { 
        method: "GET",
        cache: "no-store",
        credentials: "omit",
      });
      
      // Defensive parsing - unele browsere mobile parsează JSON ciudat
      const responseText = await resp.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (parseErr) {
        setStatus({ 
          found: false, 
          error: "Eroare parsare răspuns. Răspuns primit: " + responseText.substring(0, 100) 
        });
        setSearching(false);
        return;
      }
      
      if (result.success) {
        if (result.found) {
          const statusMap = { "În așteptare": "pending", "Acceptat": "accepted", "Respins": "rejected", "Confirmat": "confirmed" };
          setStatus({
            found: true,
            status: statusMap[result.status] || "pending",
            name: result.name,
            firstName: result.firstName,
            // Flags pentru documents (din API v4)
            contractSemnat: result.contractSemnat,
            fisaSemnat: result.fisaSemnat,
            roiSemnat: result.roiSemnat,
            ciIncarcat: result.ciIncarcat,
            statusFinal: result.statusFinal,
            position: result.position || "Casier",
          });
          // Dacă e Complete, activează tab-uri pentru această sesiune
          if (result.statusFinal === "Complete" && onCompleteDetected) {
            onCompleteDetected(targetPhone, result.position || "Casier");
          }
        } else {
          setStatus({ found: false });
        }
      } else {
        setStatus({ found: false, error: result.error });
      }
    } catch (err) {
      setStatus({ found: false, error: "Eroare de conexiune." });
    }
    setSearching(false);
  }

  // Refresh function pentru AcceptedFlow (după sign/upload)
  async function refreshStatus() {
    await checkStatus(phone);
  }

  return (
    <div style={{ padding: "40px 16px", maxWidth: 520, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(114,249,76,0.08)", border: "1px solid rgba(114,249,76,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>🔍</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>Verifică statusul</h2>
        <p style={{ fontSize: 14, color: "rgba(232,230,227,0.45)" }}>Introdu numărul de telefon cu care ai aplicat</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={phone}
          onChange={e => { 
            let v = e.target.value;
            // Eliminăm tot ce nu e cifră
            v = v.replace(/[^0-9]/g, "");
            // Dacă începe cu 40 (prefix RO fără +), tăiem
            if (v.startsWith("40") && v.length > 10) v = v.substring(2);
            // Dacă începe cu 0040, tăiem
            if (v.startsWith("0040")) v = "0" + v.substring(4);
            // Limităm la 10 cifre
            if (v.length > 10) v = v.substring(0, 10);
            setPhone(v); 
            setStatus(null); 
          }}
          placeholder="07xxxxxxxx"
          maxLength={14}
          style={{
            flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12, padding: "14px 16px", fontSize: 16, color: "#e8e6e3", outline: "none",
            WebkitAppearance: "none",
          }}
          onKeyDown={e => e.key === "Enter" && checkStatus()}
        />
        <button onClick={() => checkStatus()} disabled={phone.length < 10} style={{
          background: phone.length >= 10 ? `linear-gradient(135deg, #72F94C, #4AD42F)` : "rgba(255,255,255,0.06)",
          border: "none", borderRadius: 12, padding: "14px 20px", fontSize: 15, fontWeight: 600,
          color: phone.length >= 10 ? "#0a0a0a" : "rgba(232,230,227,0.3)", cursor: phone.length >= 10 ? "pointer" : "default",
        }}>Caută</button>
      </div>

      {searching && (
        <div style={{ textAlign: "center", padding: 40, color: "rgba(232,230,227,0.4)", fontSize: 14 }}>Se caută...</div>
      )}

      {status && !searching && (
        <div>
          {status.found ? (
            <div>
              {/* Status card */}
              {status.status === "pending" && (
                <div style={{ background: "rgba(186,117,23,0.08)", border: "1px solid rgba(186,117,23,0.2)", borderRadius: 16, padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#EF9F27", marginBottom: 4 }}>În așteptare</div>
                  <div style={{ fontSize: 13, color: "rgba(232,230,227,0.45)", lineHeight: 1.5 }}>Aplicația ta este în curs de evaluare. Vei fi notificat/ă când statusul se schimbă.</div>
                </div>
              )}
              {status.status === "accepted" && (
                <AcceptedFlow
                  phone={phone}
                  firstName={status.firstName}
                  statusInfo={status}
                  refreshStatus={refreshStatus}
                />
              )}
              {status.status === "rejected" && (
                <div style={{ background: "rgba(226,75,74,0.08)", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 16, padding: 20, textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>❌</div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: "#F09595", marginBottom: 4 }}>Respins</div>
                  <div style={{ fontSize: 13, color: "rgba(232,230,227,0.45)", lineHeight: 1.5 }}>Din păcate, aplicația ta nu a fost acceptată. Mulțumim pentru interes!</div>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 32, color: "rgba(232,230,227,0.4)" }}>
              <div style={{ fontSize: 14, marginBottom: 4 }}>Nu am găsit nicio aplicație</div>
              <div style={{ fontSize: 12 }}>Verifică numărul de telefon sau aplică mai întâi.</div>
              {status.error && (
                <div style={{ marginTop: 12, padding: 8, background: "rgba(226,75,74,0.1)", border: "1px solid rgba(226,75,74,0.2)", borderRadius: 8, fontSize: 11, color: "#ff9999" }}>
                  Detalii: {status.error}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState(VIEWS.HOME);
  // Telefonul utilizatorului care a făcut status check și e Complete
  const [completePhone, setCompletePhone] = useState(null);
  const [userPosition, setUserPosition] = useState("Casier");
  
  // Restore din localStorage la primul render
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem("bp_complete_phone");
        const savedPos = window.localStorage.getItem("bp_user_position");
        if (saved) setCompletePhone(saved);
        if (savedPos) setUserPosition(savedPos);
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
        hasShifts={!!completePhone}
        hasTeam={!!completePhone && userPosition === "Supervizor"} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {view === VIEWS.HOME && <HomePage setView={setView} />}
        {view === VIEWS.APPLY && <ApplyPage setView={setView} />}
        {view === VIEWS.STATUS && <StatusPage onCompleteDetected={updateCompletePhone} />}
        {view === VIEWS.SHIFTS && <ShiftsPage phone={completePhone} onLogout={handleLogout} />}
        {view === VIEWS.PAST_SHIFTS && <ShiftsPage phone={completePhone} onLogout={handleLogout} pastOnly={true} />}
        {view === VIEWS.TEAM && <TeamPage phone={completePhone} onLogout={handleLogout} />}
      </div>

      <div style={{ textAlign: "center", padding: "24px 16px 32px", borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 11, color: "rgba(232,230,227,0.2)", fontFamily: "monospace" }}>
        Cashless Payment Systems · Beach Please 2026<br />
        Contact: recrutarifestival@gmail.com
      </div>
    </div>
  );
}
