/**
 * CASHLESS PAYMENT SYSTEMS - Beach Please 2026
 * Google Apps Script - VERSIUNE 3
 * 
 * Schimbări v3:
 * - Coloane noi: Sex, Data expirare CI
 * - Folder selfie = SUBFOLDER al folderului în care e Sheet-ul
 * - Naming: Nume_Prenume_Selfie.jpg (cu sufix telefon doar la duplicate)
 * - Subfoldere create: Selfie, Copie CI, Contract, Fisa postului
 * - Logging defensiv pentru scoring (vezi coloana "Detalii risc")
 */

// ============================================
// CONFIG
// ============================================
const SHEET_NAME = "Aplicanti";
const SUBFOLDERS = ["Selfie", "Copie CI", "Contract de munca", "Fisa postului"];

// ============================================
// WEB APP ENDPOINTS
// ============================================

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    if (data.action === "submit") return handleSubmission(data);
    if (data.action === "upload") return handleFileUpload(data);
    return jsonResponse({ success: false, error: "Acțiune necunoscută" });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

function doGet(e) {
  try {
    const action = e.parameter.action;
    if (action === "status") return handleStatusCheck(e.parameter.phone);
    if (action === "health") return jsonResponse({ success: true, message: "API activ" });
    return jsonResponse({ success: false, error: "Acțiune necunoscută" });
  } catch (err) {
    return jsonResponse({ success: false, error: err.message });
  }
}

// ============================================
// FORM SUBMISSION
// ============================================

function handleSubmission(data) {
  const sheet = getOrCreateSheet();
  const now = new Date();
  const phoneStr = String(data.telefon || "").trim();
  
  // Check duplicate
  const lastRow = sheet.getLastRow();
  if (lastRow >= 2) {
    const phones = sheet.getRange("D2:D" + lastRow).getValues().flat();
    if (phones.some(p => String(p).trim() === phoneStr)) {
      return jsonResponse({ 
        success: false, 
        error: "Acest număr de telefon a fost deja folosit pentru o aplicație." 
      });
    }
  }
  
  // Append row - 33 coloane
  sheet.appendRow([
    now,                            // A: Timestamp
    data.nume || "",                // B: Nume
    data.prenume || "",             // C: Prenume
    phoneStr,                       // D: Telefon
    data.email || "",               // E: Email
    data.oras || "",                // F: Oraș
    data.dataNasterii || "",        // G: Data nașterii
    data.socialType || "",          // H: Rețea socială
    data.socialLink || "",          // I: Link profil
    data.situatie || "",            // J: Situație
    data.cazare || "",              // K: Cazare
    data.experienta || "",          // L: Experiență festival
    data.motivatie || "",           // M: Motivație
    data.serieCi || "",             // N: Serie CI
    data.numarCi || "",             // O: Număr CI
    data.cnp || "",                 // P: CNP
    data.sex || "",                 // Q: Sex
    data.eliberatDe || "",          // R: Eliberat de
    data.dataCi || "",              // S: Data CI
    data.dataExpirareCi || "",      // T: Data expirare CI
    data.domiciliu || "",           // U: Domiciliu
    data.orasCi || "",              // V: Oraș CI
    data.judet || "",               // W: Județ
    data.cetatenie || "",           // X: Cetățenie
    data.gdprConsent ? "Da" : "Nu", // Y: GDPR Consimțământ
    data.gdprMarketing ? "Da" : "Nu", // Z: GDPR Marketing
    "În așteptare",                 // AA: Status
    "",                             // AB: Data status
    "",                             // AC: Note admin
    "",                             // AD: Link selfie
    "",                             // AE: Acte semnate
    "",                             // AF: Scor risc
    "",                             // AG: Detalii risc
  ]);
  
  const newRow = sheet.getLastRow();
  
  // Force text format
  sheet.getRange(newRow, 4).setNumberFormat("@").setValue(phoneStr);
  sheet.getRange(newRow, 15).setNumberFormat("@").setValue(data.numarCi || "");
  sheet.getRange(newRow, 16).setNumberFormat("@").setValue(data.cnp || "");
  
  // Calculate risk score - DEFENSIVE
  let riskResult;
  try {
    riskResult = calculateRiskScore(data);
  } catch (err) {
    riskResult = { score: 50, level: "EROARE", details: "[EROARE SCORING] " + err.message };
  }
  sheet.getRange(newRow, 32).setValue(riskResult.score);
  sheet.getRange(newRow, 33).setValue(riskResult.details);
  
  // Color-code row
  const rowRange = sheet.getRange(newRow, 1, 1, 33);
  if (riskResult.score >= 80) rowRange.setBackground("#E1F5EE");
  else if (riskResult.score >= 55) rowRange.setBackground("#FAEEDA");
  else rowRange.setBackground("#FCEBEB");
  
  // Selfie upload
  if (data.selfieBase64) {
    try {
      const selfieFolder = getOrCreateSubfolder("Selfie");
      const baseName = sanitizeName(data.nume) + "_" + sanitizeName(data.prenume) + "_Selfie";
      
      let fileName = baseName + ".jpg";
      const existing = selfieFolder.getFilesByName(fileName);
      if (existing.hasNext()) {
        fileName = baseName + "_" + phoneStr + ".jpg";
      }
      
      const blob = Utilities.newBlob(
        Utilities.base64Decode(data.selfieBase64),
        "image/jpeg",
        fileName
      );
      const file = selfieFolder.createFile(blob);
      sheet.getRange(newRow, 30).setValue(file.getUrl());
    } catch (err) {
      Logger.log("Eroare upload selfie: " + err.message);
      sheet.getRange(newRow, 30).setValue("EROARE: " + err.message);
    }
  }
  
  // Confirmation email
  try {
    sendConfirmationEmail(data);
  } catch (err) {
    Logger.log("Eroare email: " + err.message);
  }
  
  return jsonResponse({ 
    success: true, 
    message: "Aplicația a fost înregistrată cu succes!" 
  });
}

// ============================================
// STATUS CHECK
// ============================================

function handleStatusCheck(phone) {
  if (!phone || phone.length < 10) {
    return jsonResponse({ success: false, error: "Număr de telefon invalid" });
  }
  
  const phoneClean = String(phone).trim().replace(/\D/g, "");
  const sheet = getOrCreateSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    const rowPhone = String(data[i][3]).trim().replace(/\D/g, "");
    if (rowPhone === phoneClean || 
        "0" + rowPhone === phoneClean || 
        rowPhone === "0" + phoneClean) {
      return jsonResponse({
        success: true,
        found: true,
        name: data[i][1] + " " + data[i][2],
        status: data[i][26] || "În așteptare",
        statusDate: data[i][27] ? data[i][27].toString() : "",
        notes: "",
      });
    }
  }
  
  return jsonResponse({ success: true, found: false });
}

// ============================================
// FILE UPLOAD
// ============================================

function handleFileUpload(data) {
  if (!data.phone || !data.fileBase64 || !data.fileName) {
    return jsonResponse({ success: false, error: "Date incomplete" });
  }
  
  let subfolderName = "Copie CI";
  if (data.fileType === "contract") subfolderName = "Contract de munca";
  else if (data.fileType === "fisa") subfolderName = "Fisa postului";
  
  const folder = getOrCreateSubfolder(subfolderName);
  
  const ext = data.fileName.includes(".") ? data.fileName.split(".").pop() : "pdf";
  const baseName = sanitizeName(data.nume) + "_" + sanitizeName(data.prenume) + "_" + subfolderName.replace(/\s+/g, "_");
  
  let fileName = baseName + "." + ext;
  const existing = folder.getFilesByName(fileName);
  if (existing.hasNext()) {
    fileName = baseName + "_" + String(data.phone).trim() + "." + ext;
  }
  
  const blob = Utilities.newBlob(
    Utilities.base64Decode(data.fileBase64),
    data.mimeType || "application/pdf",
    fileName
  );
  const file = folder.createFile(blob);
  
  const sheet = getOrCreateSheet();
  const phones = sheet.getRange("D2:D" + sheet.getLastRow()).getValues().flat();
  const rowIndex = phones.findIndex(p => String(p).trim() === String(data.phone).trim());
  if (rowIndex >= 0) {
    const currentVal = sheet.getRange(rowIndex + 2, 31).getValue();
    const newVal = currentVal ? currentVal + ", " + fileName : fileName;
    sheet.getRange(rowIndex + 2, 31).setValue(newVal);
  }
  
  return jsonResponse({ 
    success: true, 
    fileUrl: file.getUrl(),
    message: "Fișier încărcat cu succes" 
  });
}

// ============================================
// EMAIL
// ============================================

function sendConfirmationEmail(data) {
  if (!data.email) return;
  
  MailApp.sendEmail({
    to: data.email,
    subject: "Beach Please 2026 - Aplicație primită",
    body: `Salut ${data.prenume},

Mulțumim pentru aplicația ta pentru poziția de casier în cadrul Beach, Please! 2026.

Aplicația ta a fost înregistrată cu succes și se află în stadiul "În așteptare".

Poți verifica oricând statusul aplicației tale pe site, folosind numărul de telefon ${data.telefon}.

Te vom contacta în curând cu un răspuns.

Cu respect,
Echipa Cashless Payment Systems
recrutarifestival@gmail.com`,
    replyTo: "recrutarifestival@gmail.com",
    name: "Cashless Payment Systems - Beach Please"
  });
}

// ============================================
// RISK SCORING - V3 (defensiv)
// ============================================

function calculateRiskScore(data) {
  let score = 50;
  const flags = [];
  
  const age = getAgeFromDOB(data.dataNasterii);
  flags.push("(vârsta: " + (age !== null ? age : "NULL") + ")");
  
  if (age === null) {
    flags.push("[!] Data nașterii lipsă/invalidă: '" + (data.dataNasterii || "") + "'");
  } else if (age >= 20 && age <= 23) {
    score += 25; flags.push("+25 sweet spot (20-23)");
  } else if (age === 19) {
    score += 15; flags.push("+15 vârstă 19");
  } else if (age === 18) {
    score -= 20; flags.push("-20 vârstă 18");
  } else if (age >= 24 && age <= 30) {
    score -= 5; flags.push("-5 vârstă 24-30");
  } else if (age > 30) {
    score -= 10; flags.push("-10 vârstă 30+");
  }
  
  const sit = (data.situatie || "").toLowerCase();
  let isElevXII = false;
  
  if (sit.includes("full-time") || sit.includes("full time")) {
    score -= 10; flags.push("-10 full-time");
  } else if (sit.includes("part-time") || sit.includes("sezonier")) {
    score -= 3; flags.push("-3 part-time");
  } else if (sit.includes("student")) {
    score += 5; flags.push("+5 student");
  } else if (sit.includes("xii") || sit.includes("bac")) {
    isElevXII = true;
    score -= 10; flags.push("-10 elev XII (BAC)");
  } else if (sit.includes("elev")) {
    flags.push("0 elev (alt an)");
  }
  
  if ((age === 18 || age === 19) && !isElevXII && !sit.includes("student") && 
      !sit.includes("full") && !sit.includes("part") && !sit.includes("sezonier")) {
    score -= 5; flags.push("-5 vârstă tipică BAC");
  }
  
  const exp = (data.experienta || "").toLowerCase();
  if (exp.includes("staff") || exp.includes("voluntar")) {
    score += 10; flags.push("+10 experiență staff");
  } else if (exp.includes("nu") || exp.includes("prima")) {
    score -= 5; flags.push("-5 fără experiență");
  }
  
  const mot = (data.motivatie || "").trim();
  const motLen = mot.length;
  
  if (motLen >= 150) {
    score += 15; flags.push("+15 motivație " + motLen + " chars");
  } else if (motLen < 50) {
    score -= 15; flags.push("-15 motivație " + motLen + " chars");
  } else if (motLen < 100) {
    score -= 5; flags.push("-5 motivație " + motLen + " chars");
  }
  
  const motLower = mot.toLowerCase();
  const pozitive = ["echipa", "experienta", "dezvolt", "responsabil", "oportunit", "invat"];
  const negative = ["bani", "plata", "venit", "salariu"];
  
  let pozCount = 0, negCount = 0;
  pozitive.forEach(kw => { if (motLower.includes(kw)) pozCount++; });
  negative.forEach(kw => { if (motLower.includes(kw)) negCount++; });
  
  if (pozCount >= 2) {
    score += 10; flags.push("+10 keywords pozitive");
  }
  if (negCount > 0 && pozCount === 0) {
    score -= 10; flags.push("-10 doar bani");
  }
  
  const city = (data.oras || "").toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[ăâ]/g, "a").replace(/[șş]/g, "s").replace(/[țţ]/g, "t").replace(/[îï]/g, "i");
  
  const lowRisk = ["constanta", "galati", "iasi", "tulcea", "cluj", "botosani", "pitesti", "timisoara"];
  const highRisk = ["craiova", "suceava", "ploiesti", "buzau"];
  
  if (lowRisk.some(c => city.includes(c))) {
    score += 15; flags.push("+15 oraș risc scăzut");
  } else if (highRisk.some(c => city.includes(c))) {
    score -= 15; flags.push("-15 oraș risc ridicat");
  }
  
  const cazare = (data.cazare || "").toLowerCase();
  if (cazare.includes("proprie") || cazare.startsWith("da")) {
    score += 5; flags.push("+5 cazare proprie");
  }
  
  score = Math.max(0, Math.min(100, score));
  const level = score >= 80 ? "SCĂZUT" : score >= 55 ? "MEDIU" : "RIDICAT";
  
  return {
    score: score,
    level: level,
    details: `[${level}] Scor: ${score}/100 | ${flags.join(" | ")}`
  };
}

function getAgeFromDOB(dob) {
  if (!dob) return null;
  const d = new Date(dob);
  if (isNaN(d.getTime())) return null;
  const festival = new Date(2026, 6, 8);
  const ageMs = festival - d;
  if (ageMs < 0) return null;
  return Math.floor(ageMs / (365.25 * 24 * 60 * 60 * 1000));
}

// ============================================
// FOLDER MANAGEMENT
// ============================================

function getParentFolder() {
  const ssId = SpreadsheetApp.getActiveSpreadsheet().getId();
  const file = DriveApp.getFileById(ssId);
  const parents = file.getParents();
  if (parents.hasNext()) {
    return parents.next();
  }
  return DriveApp.createFolder("Beach Please 2026 - Recrutari");
}

function getOrCreateSubfolder(name) {
  const parent = getParentFolder();
  const existing = parent.getFoldersByName(name);
  if (existing.hasNext()) return existing.next();
  return parent.createFolder(name);
}

function sanitizeName(s) {
  return String(s || "")
    .trim()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

// ============================================
// SHEET MANAGEMENT
// ============================================

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    const headers = [
      "Timestamp", "Nume", "Prenume", "Telefon", "Email", "Oraș", "Data nașterii",
      "Rețea socială", "Link profil", "Situație", "Cazare", "Experiență", "Motivație",
      "Serie CI", "Nr CI", "CNP", "Sex", "Eliberat de", "Data CI", "Data expirare CI",
      "Domiciliu", "Oraș CI", "Județ", "Cetățenie",
      "GDPR Consimțământ", "GDPR Marketing",
      "Status", "Data status", "Note admin", "Link selfie", "Acte semnate", "Scor risc", "Detalii risc"
    ];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#1a1a2e");
    headerRange.setFontColor("#72F94C");
    
    sheet.setColumnWidth(1, 150);
    sheet.setColumnWidth(10, 200);
    sheet.setColumnWidth(13, 250);
    sheet.setColumnWidth(17, 50);
    sheet.setColumnWidth(21, 250);
    sheet.setColumnWidth(32, 80);
    sheet.setColumnWidth(33, 400);
    
    sheet.setFrozenRows(1);
    
    sheet.getRange("D2:D1000").setNumberFormat("@");
    sheet.getRange("O2:O1000").setNumberFormat("@");
    sheet.getRange("P2:P1000").setNumberFormat("@");
    
    const sitRule = SpreadsheetApp.newDataValidation()
      .requireValueInList([
        "Elev XII (dau BAC 2026)",
        "Elev (alt an)",
        "Student",
        "Lucrez part-time / sezonier",
        "Lucrez full-time cu contract",
        "Nu lucrez și nu sunt la școală"
      ])
      .setAllowInvalid(true).build();
    sheet.getRange("J2:J1000").setDataValidation(sitRule);
    
    const sexRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["M", "F"])
      .setAllowInvalid(true).build();
    sheet.getRange("Q2:Q1000").setDataValidation(sexRule);
    
    const statusRule = SpreadsheetApp.newDataValidation()
      .requireValueInList(["În așteptare", "Acceptat", "Respins", "Confirmat"])
      .setAllowInvalid(false).build();
    sheet.getRange("AA2:AA1000").setDataValidation(statusRule);
  }
  
  return sheet;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================
// TRIGGER: Auto-email on status change
// ============================================

function onEdit(e) {
  const sheet = e.source.getActiveSheet();
  if (sheet.getName() !== SHEET_NAME) return;
  
  const col = e.range.getColumn();
  const row = e.range.getRow();
  
  // Column AA (27) = Status
  if (col !== 27 || row < 2) return;
  
  const newStatus = e.value;
  const email = sheet.getRange(row, 5).getValue();
  const prenume = sheet.getRange(row, 3).getValue();
  const telefon = sheet.getRange(row, 4).getValue();
  
  sheet.getRange(row, 28).setValue(new Date());
  
  if (!email) return;
  
  let subject, body;
  
  if (newStatus === "Acceptat") {
    subject = "Beach Please 2026 - Felicitări, ai fost acceptat/ă!";
    body = `Salut ${prenume},

Vești bune! Aplicația ta pentru poziția de casier la Beach, Please! 2026 a fost ACCEPTATĂ.

Următorii pași:
1. Intră pe site și verifică statusul cu numărul ${telefon}
2. Descarcă documentele care trebuie semnate
3. Semnează-le și încarcă-le pe site împreună cu o copie a cărții de identitate
4. Așteaptă confirmarea finală

Deadline pentru documente: 48 de ore de la primirea acestui email.

Cu respect,
Echipa Cashless Payment Systems`;
  } else if (newStatus === "Respins") {
    subject = "Beach Please 2026 - Răspuns aplicație";
    body = `Salut ${prenume},

Îți mulțumim pentru interesul arătat față de poziția de casier la Beach, Please! 2026.

Din păcate, de data aceasta nu am putut accepta aplicația ta. Acest lucru nu reflectă valoarea ta — pur și simplu am avut un număr limitat de locuri și un număr foarte mare de aplicanți.

Îți dorim mult succes și sperăm să ne revedem la o ediție viitoare!

Cu respect,
Echipa Cashless Payment Systems`;
  } else {
    return;
  }
  
  try {
    MailApp.sendEmail({
      to: email,
      subject: subject,
      body: body,
      replyTo: "recrutarifestival@gmail.com",
      name: "Cashless Payment Systems - Beach Please"
    });
  } catch (err) {
    Logger.log(`Eroare email la ${email}: ${err.message}`);
  }
}
