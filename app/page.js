"use client";
import { useState, useMemo, useEffect, useRef } from "react";

const C = { accent: "#72F94C", accentDark: "#4AD42F", dark: "#0f0f1a", darkMid: "#1a1a2e", darkLight: "#16213e" };
const API_URL = "https://script.google.com/macros/s/AKfycbyBvRDNA7V9HDpwqQTKeLh6q_thnddCcSMGKlYZHMuNvV-5plWUEDHxGkUpv9hGzRltXQ/exec";
const VIEWS = { HOME: "home", APPLY: "apply", STATUS: "status" };

function Nav({ view, setView }) {
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(15,15,26,0.92)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 16px" }}>
      <div style={{ maxWidth: 520, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 56 }}>
        <button onClick={() => setView(VIEWS.HOME)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: `linear-gradient(135deg, #72F94C, #4AD42F)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#fff", fontWeight: 700 }}>C</div>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: "0.02em" }}>Cashless Payment Systems</span>
        </button>
        <div style={{ display: "flex", gap: 4 }}>
          {[{ v: VIEWS.HOME, l: "Acasă" }, { v: VIEWS.APPLY, l: "Aplică" }, { v: VIEWS.STATUS, l: "Status" }].map(b => (
            <button key={b.v} onClick={() => setView(b.v)} style={{
              background: view === b.v ? "rgba(114,249,76,0.15)" : "transparent",
              border: view === b.v ? "1px solid rgba(114,249,76,0.3)" : "1px solid transparent",
              borderRadius: 20, padding: "6px 14px", fontSize: 13, fontWeight: 500, cursor: "pointer",
              color: view === b.v ? C.accent : "rgba(232,230,227,0.6)",
              transition: "all 0.2s",
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

function Input({ value, onChange, placeholder, type = "text", ...props }) {
  return (
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width: "100%", background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 10, padding: "12px 14px", fontSize: 15, color: "#e8e6e3", outline: "none",
        boxSizing: "border-box", transition: "border-color 0.2s",
      }}
      onFocus={e => e.target.style.borderColor = "rgba(114,249,76,0.4)"}
      onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
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
    cazare: "", experienta: "", motivatie: "",
    serieCi: "", numarCi: "", cnp: "", eliberatDe: "", dataCi: "", domiciliu: "", orasCi: "", judet: "", cetatenie: "",
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
      if (!form.dataNasterii) e.dataNasterii = "Obligatoriu";
      if (form.dataNasterii) {
        const age = (new Date(2026, 6, 8) - new Date(form.dataNasterii)) / (365.25 * 24 * 60 * 60 * 1000);
        if (age < 18) e.dataNasterii = "Trebuie să ai minim 18 ani la data festivalului";
      }
      if (!form.socialType) e.socialType = "Selectează rețeaua";
      if (!form.socialLink.trim()) e.socialLink = "Obligatoriu";
    }
    if (step === 1) {
      if (!form.cazare) e.cazare = "Selectează o opțiune";
      if (!form.experienta) e.experienta = "Selectează o opțiune";
      if (!form.motivatie.trim() || form.motivatie.length < 20) e.motivatie = "Minim 20 de caractere";
      if (!form.selfie) e.selfie = "Selfie-ul este obligatoriu";
    }
    if (step === 2) {
      if (!form.serieCi.trim()) e.serieCi = "Obligatoriu";
      if (!form.numarCi.trim()) e.numarCi = "Obligatoriu";
      if (!form.cnp.trim() || form.cnp.length !== 13) e.cnp = "CNP-ul are 13 cifre";
      if (!form.eliberatDe.trim()) e.eliberatDe = "Obligatoriu";
      if (!form.dataCi) e.dataCi = "Obligatoriu";
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
        <FormField label="Data nașterii" required error={errors.dataNasterii}><Input value={form.dataNasterii} onChange={v => upd("dataNasterii", v)} type="date" /></FormField>
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
          Datele din cartea de identitate sunt necesare pentru generarea contractului. Sunt stocate securizat și folosite exclusiv în scop contractual.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12 }}>
          <FormField label="Serie CI" required error={errors.serieCi}><Input value={form.serieCi} onChange={v => upd("serieCi", v.toUpperCase())} placeholder="BZ" maxLength={2} /></FormField>
          <FormField label="Număr CI" required error={errors.numarCi}><Input value={form.numarCi} onChange={v => upd("numarCi", v.replace(/[^0-9]/g, ""))} placeholder="1234567" maxLength={7} /></FormField>
        </div>
        <FormField label="CNP" required error={errors.cnp}><Input value={form.cnp} onChange={v => upd("cnp", v.replace(/[^0-9]/g, ""))} placeholder="1234567890123" maxLength={13} /></FormField>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <FormField label="Eliberat de" required error={errors.eliberatDe}><Input value={form.eliberatDe} onChange={v => upd("eliberatDe", v)} placeholder="SPCLEP Sector 1" /></FormField>
          <FormField label="Data eliberării" required error={errors.dataCi}><Input value={form.dataCi} onChange={v => upd("dataCi", v)} type="date" /></FormField>
        </div>
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
              ["Cazare", form.cazare], ["Profil", `${form.socialType}: ${form.socialLink}`],
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

function StatusPage() {
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState(null);
  const [searching, setSearching] = useState(false);

  async function checkStatus() {
    if (phone.length < 10) return;
    setSearching(true);
    try {
      const resp = await fetch(`${API_URL}?action=status&phone=${encodeURIComponent(phone)}`);
      const result = await resp.json();
      if (result.success) {
        if (result.found) {
          const statusMap = { "În așteptare": "pending", "Acceptat": "accepted", "Respins": "rejected", "Confirmat": "confirmed" };
          setStatus({ found: true, status: statusMap[result.status] || "pending", name: result.name });
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

  return (
    <div style={{ padding: "40px 16px", maxWidth: 520, margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(114,249,76,0.08)", border: "1px solid rgba(114,249,76,0.15)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", fontSize: 24 }}>🔍</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>Verifică statusul</h2>
        <p style={{ fontSize: 14, color: "rgba(232,230,227,0.45)" }}>Introdu numărul de telefon cu care ai aplicat</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <input type="tel" value={phone} onChange={e => { setPhone(e.target.value.replace(/[^0-9]/g, "")); setStatus(null); }}
          placeholder="07xxxxxxxx" maxLength={10}
          style={{
            flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 12, padding: "14px 16px", fontSize: 16, color: "#e8e6e3", outline: "none",
          }}
          onKeyDown={e => e.key === "Enter" && checkStatus()}
        />
        <button onClick={checkStatus} disabled={phone.length < 10} style={{
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
                <div>
                  <div style={{ background: "rgba(99,153,34,0.08)", border: "1px solid rgba(99,153,34,0.2)", borderRadius: 16, padding: 20, textAlign: "center", marginBottom: 16 }}>
                    <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: "#97C459", marginBottom: 4 }}>Acceptat!</div>
                    <div style={{ fontSize: 13, color: "rgba(232,230,227,0.45)" }}>Felicitări! Descarcă documentele de mai jos.</div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 12 }}>Documente de semnat</div>
                    {["Contract de muncă", "Fișa postului", "Regulament de ordine internă"].map(doc => (
                      <div key={doc} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        <span style={{ fontSize: 13, color: "rgba(232,230,227,0.7)" }}>{doc}</span>
                        <button style={{ background: "rgba(114,249,76,0.12)", border: "none", borderRadius: 8, padding: "6px 12px", fontSize: 12, color: C.accent, cursor: "pointer" }}>Descarcă</button>
                      </div>
                    ))}
                    <div style={{ marginTop: 16 }}>
                      <div style={{ fontSize: 13, fontWeight: 500, color: "rgba(232,230,227,0.6)", marginBottom: 8 }}>Upload acte semnate + copie CI</div>
                      <button style={{ width: "100%", padding: "14px", borderRadius: 10, border: "2px dashed rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)", color: "rgba(232,230,227,0.4)", fontSize: 13, cursor: "pointer" }}>📎 Adaugă fișiere</button>
                    </div>
                  </div>
                </div>
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
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [view, setView] = useState(VIEWS.HOME);

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

      <Nav view={view} setView={setView} />

      <div style={{ position: "relative", zIndex: 1 }}>
        {view === VIEWS.HOME && <HomePage setView={setView} />}
        {view === VIEWS.APPLY && <ApplyPage setView={setView} />}
        {view === VIEWS.STATUS && <StatusPage />}
      </div>

      <div style={{ textAlign: "center", padding: "24px 16px 32px", borderTop: "1px solid rgba(255,255,255,0.05)", fontSize: 11, color: "rgba(232,230,227,0.2)", fontFamily: "monospace" }}>
        Cashless Payment Systems · Beach Please 2026<br />
        Contact: recrutarifestival@gmail.com
      </div>
    </div>
  );
}
