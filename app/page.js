// Configurația per festival
// Fiecare key e identificat prin subdomain (ex: kapital.angajarifestival.ro → "kapital")

export const FESTIVALS = {
  beachplease: {
    key: "beachplease",
    name: "Beach Please",
    fullName: "Beach, Please! 2026",
    shortName: "Beach Please",
    dateLabel: "8-12 Iulie 2026",
    startDate: "2026-07-08",
    endDate: "2026-07-12",
    location: "Costinești",
    enabled: true,
    apiUrl: "https://script.google.com/macros/s/AKfycbyBvRDNA7V9HDpwqQTKeLh6q_thnddCcSMGKlYZHMuNvV-5plWUEDHxGkUpv9hGzRltXQ/exec",
    colors: {
      accent: "#72F94C",      // verde neon
      accentDark: "#4AD42F",
      accentSecondary: "#F9F871", // galben pentru gradient
    },
    // Detalii afișate în carduri și formular
    pay: "20 lei net/oră",
    accommodation: "Loc de cort în camping disponibil din 7 Iulie",
    festivalEntry: "Acces în perimetrul festivalului în afara turelor de lucru",
    food: "Mâncare și apă pe durata turei de lucru",
    minAge: 18,
  },
  
  kapital: {
    key: "kapital",
    name: "Kapital",
    fullName: "KAPITAL Festival 2026",
    shortName: "Kapital",
    dateLabel: "3-5 Iulie 2026",
    startDate: "2026-07-03",
    endDate: "2026-07-05",
    location: "Arena Națională, București",
    enabled: true,
    apiUrl: "TODO_KAPITAL_API_URL", // tu îmi dai URL-ul
    colors: {
      accent: "#E91D63",       // magenta vibrant
      accentDark: "#C2185B",
      accentSecondary: "#FF4081", // roz mai deschis pentru gradient
    },
    pay: "20 lei net/oră",
    accommodation: "Costinești nu se aplică - locația e în București. Cazarea e responsabilitatea ta.",
    festivalEntry: "Acces în perimetrul festivalului în afara turelor de lucru",
    food: "Mâncare și apă pe durata turei de lucru",
    minAge: 18,
  },
  
  untold: {
    key: "untold",
    name: "Untold",
    fullName: "UNTOLD One 2026",
    shortName: "Untold",
    dateLabel: "6-9 August 2026",
    startDate: "2026-08-06",
    endDate: "2026-08-09",
    location: "Cluj-Napoca",
    enabled: false, // recrutările se deschid mai târziu
    apiUrl: "", // gol până configurăm
    colors: {
      accent: "#7C4DFF",       // mov/violet (placeholder, ajustează după)
      accentDark: "#5E35B1",
      accentSecondary: "#B388FF",
    },
    pay: "20 lei net/oră",
    accommodation: "Vom anunța detaliile când deschidem aplicările.",
    festivalEntry: "Detalii vor fi disponibile când deschidem aplicările.",
    food: "Detalii vor fi disponibile când deschidem aplicările.",
    minAge: 18,
  },
};

// Detectare festival din subdomain
export function getCurrentFestival() {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  
  if (host.startsWith("kapital.")) return FESTIVALS.kapital;
  if (host.startsWith("untold.")) return FESTIVALS.untold;
  if (host.startsWith("beachplease.")) return FESTIVALS.beachplease;
  
  // Pe domeniul principal sau localhost → null = landing page
  return null;
}
