// ==========================================================
// Inställningar – ändra här, gäller hela sajten.
// ==========================================================

const CONTACT_EMAIL = "hej@bopparoting.se";
const INSTAGRAM_URL = "https://www.instagram.com/bopparoting";

// Vart formulären skickas (Formspree, Web3Forms, Netlify Function, egen API …).
// Tom sträng = demoläge: inget skickas, besökaren går direkt till tack-sidan.
// Exempel Formspree: "https://formspree.io/f/abcdwxyz"
const FORM_ENDPOINT = "";

// Hämtställen för bokningar
const PICKUP = {
  blomaffaren: {
    label: "Blomaffären",
    hint: "Öppettider skickas i mejlet",
    place: "Blomaffären [namn], [adress]",
    when: "Under öppettiderna, inom [X] dagar",
  },
  hemma: {
    label: "Hemma hos Anne",
    hint: "Adress skickas i mejlet",
    place: "Hemma hos Anne, [adress]",
    when: "Enligt överenskommelse, inom [X] dagar",
  },
};

// Färgtema: "standard" eller "rosa" (Bröstcancer-tema).
// Kan förhandsgranskas med ?tema=rosa i adressen.
const THEME = "standard";
