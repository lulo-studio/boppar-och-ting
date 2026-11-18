// ==========================================================
// Inställningar – ändra här, gäller hela sajten.
// ==========================================================

const CONTACT_EMAIL = "johansson.anne@telia.com";
const INSTAGRAM_URL = "https://www.instagram.com/bopparoting/";

// Vart formulären skickas (Formspree, Web3Forms, Netlify Function, egen API …).
// Tom sträng = demoläge: inget skickas, besökaren går direkt till tack-sidan.
// Exempel Formspree: "https://formspree.io/f/abcdwxyz"
const FORM_ENDPOINT = "";

// Hämtställen för bokningar
const PICKUP = {
  blomaffaren: {
    label: "Kvistar & Krus",
    hint: "Köpmannagatan 19, Perstorp · tis–fre 10–17, lör 10–12",
    place: "Kvistar & Krus, Köpmannagatan 19, 284 31 Perstorp",
    when: "Tisdag–fredag 10–17, lördag 10–12 – inom 7 dagar",
  },
  hemma: {
    label: "Hemma hos Anne",
    hint: "Tyringe – adress och tid får du i bekräftelsemejlet",
    place: "Tyringe – adress och tid får du i bekräftelsemejlet",
    when: "Enligt överenskommelse, inom 7 dagar",
  },
};

// Färgtema: "standard" eller "rosa" (Bröstcancer-tema).
// Kan förhandsgranskas med ?tema=rosa i adressen.
const THEME = "standard";
