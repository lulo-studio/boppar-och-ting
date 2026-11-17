// ==========================================================
// ADMIN – exempeldata + datalager (Store).
//
// All läsning/skrivning går via Store. När ni kopplar på en backend
// (Supabase, egen API …) byter ni bara ut metoderna här mot riktiga
// anrop – vyerna behöver inte ändras.
//
// I demoläget sparas allt i webbläsarens localStorage.
// ==========================================================

const daysAgo = (n, time) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  if (time) { const [h, m] = time.split(":"); d.setHours(+h, +m, 0, 0); }
  return d.toISOString();
};

const ADMIN_SEED = {
  // status: "tillganglig" | "bokad" | "sald"   hidden: visas inte på hemsidan
  products: [
    { id: "hallonsvampen",  name: "Hallonsvampen",         category: "lampa", price: 650, size: 22, status: "bokad",       hidden: false, uploaded: "2026-10-12", images: [], desc: "En gammal pressglasskål från loppis som fått en ny fot med hallonrosa ränder, målad för hand. Sladdlös – ställ den på byrån, i fönstret eller på middagsbordet." },
    { id: "smorblomman",    name: "Smörblomman",           category: "lampa", price: 650, size: 25, status: "tillganglig", hidden: false, uploaded: "2026-10-09", images: [] },
    { id: "kolasnurran",    name: "Kolasnurran",           category: "lampa", price: 595, size: 24, status: "tillganglig", hidden: false, uploaded: "2026-10-02", images: [] },
    { id: "skogsglantan",   name: "Skogsgläntan",          category: "lampa", price: 695, size: 28, status: "sald",        hidden: false, uploaded: "2026-09-20", soldAt: "2026-10-20", images: [] },
    { id: "rosa-vas",       name: "Rosa (.)(.) vas",       category: "vas",   price: 450, size: 18, status: "bokad",       hidden: false, uploaded: "2026-09-28", images: [] },
    { id: "rosenknoppen",   name: "Rosenknoppen",          category: "lampa", price: 650, size: 25, status: "tillganglig", hidden: false, uploaded: "2026-09-26", images: [] },
    { id: "mintkupolen",    name: "Mintkupolen",           category: "lampa", price: 650, size: 24, status: "tillganglig", hidden: false, uploaded: "2026-09-22", images: [], desc: "En frostad glaskupa från loppis, med en fot i mintgröna ränder. Sladdlös ljusslinga." },
    { id: "blabarsdrommen", name: "Blåbärsdrömmen",        category: "lampa", price: 695, size: 28, status: "tillganglig", hidden: false, uploaded: "2026-09-18", images: [] },
    { id: "sandfargad-vas", name: "Sandfärgad (.)(.) vas", category: "vas",   price: 450, size: 20, status: "tillganglig", hidden: false, uploaded: "2026-09-15", images: [] },
    { id: "plommon-vas",    name: "Plommon (.)(.) vas",    category: "vas",   price: 425, size: 16, status: "tillganglig", hidden: false, uploaded: "2026-09-10", images: [] },
    { id: "citronfjarilen", name: "Citronfjärilen",        category: "lampa", price: 625, size: 23, status: "tillganglig", hidden: false, uploaded: "2026-09-06", images: [] },
    { id: "lavendelmolnet", name: "Lavendelmolnet",        category: "lampa", price: 650, size: 26, status: "tillganglig", hidden: true,  uploaded: "2026-09-02", images: [] },
    { id: "karamellen",     name: "Karamellen",            category: "lampa", price: 595, size: 20, status: "sald",        hidden: false, uploaded: "2026-08-25", soldAt: "2026-09-14", images: [] },
    { id: "vit-vas",        name: "Vit (.)(.) vas",        category: "vas",   price: 450, size: 18, status: "sald",        hidden: false, uploaded: "2026-08-20", soldAt: "2026-09-05", images: [] },
  ],

  // status: "vantar" | "hamtad" | "slappt"
  bookings: [
    { id: "b1", productId: "hallonsvampen", name: "Sara Lindqvist", phone: "070-123 45 67", email: "sara@exempel.se", pickup: "blomaffaren", message: "Hämtar gärna på lördag förmiddag!", bookedAt: daysAgo(1), status: "vantar" },
    { id: "b2", productId: "rosa-vas",      name: "Lena Berg",      phone: "073-987 65 43", email: "lena.b@exempel.se", pickup: "hemma", message: "", bookedAt: daysAgo(6), status: "vantar" },
    { id: "b3", productId: "skogsglantan",  name: "Maria Ek",       phone: "076-111 22 33", email: "maria@exempel.se", pickup: "blomaffaren", message: "", bookedAt: "2026-10-17T10:00:00Z", pickedAt: "2026-10-20T12:00:00Z", status: "hamtad" },
    { id: "b4", productId: "mintkupolen",   name: "Johan Persson",  phone: "070-222 33 44", email: "johan@exempel.se", pickup: "hemma", message: "", bookedAt: "2026-10-01T10:00:00Z", status: "slappt" },
  ],

  // status: "ny" | "besvarad" | "klar" | "arkiverad"
  requests: [
    { id: "r1", name: "Johanna Nilsson", email: "johanna@exempel.se", phone: "070-555 12 34", receivedAt: daysAgo(0, "14:32"), type: "lampa", colors: ["rosa", "smorgul"], size: "mellan", ownGlass: false, needBy: "Födelsedag 12 december", desc: "Present till min mamma som älskar gult och rosa. Gärna något randigt och glatt som kan stå i köksfönstret!", image: true, status: "ny" },
    { id: "r2", name: "Peter Sandberg",  email: "peter@exempel.se",   phone: "070-444 55 66", receivedAt: "2026-11-05T09:12:00Z", type: "vas", colors: ["gron"], size: "liten", ownGlass: false, needBy: "", desc: "En liten grön vas till min sambo.", image: false, status: "besvarad" },
    { id: "r3", name: "Emma Ahl",        email: "emma@exempel.se",    phone: "",              receivedAt: "2026-11-01T16:40:00Z", type: "lampa", colors: [], size: "stor", ownGlass: true, needBy: "", desc: "Jag har min mormors gamla fruktskål och vill göra en lampa av den.", image: true, status: "besvarad" },
    { id: "r4", name: "Karin Lund",      email: "karin@exempel.se",   phone: "", receivedAt: "2026-10-20T10:00:00Z", type: "lampa", colors: ["bla"], size: "mellan", ownGlass: false, needBy: "", desc: "Blå lampa till hallen.", image: false, status: "klar" },
    { id: "r5", name: "Oskar Holm",      email: "oskar@exempel.se",   phone: "", receivedAt: "2026-10-12T10:00:00Z", type: "vas", colors: ["rosa"], size: "mellan", ownGlass: false, needBy: "", desc: "Rosa vas i present.", image: false, status: "klar" },
    { id: "r6", name: "Nora Ali",        email: "nora@exempel.se",    phone: "", receivedAt: "2026-10-03T10:00:00Z", type: "lampa", colors: ["overraska"], size: "liten", ownGlass: false, needBy: "", desc: "Överraska mig!", image: false, status: "klar" },
    { id: "r7", name: "Lisa Berg",       email: "lisa@exempel.se",    phone: "", receivedAt: "2026-09-21T10:00:00Z", type: "lampa", colors: ["gron", "brun"], size: "stor", ownGlass: true, needBy: "", desc: "Eget glas, jordiga färger.", image: false, status: "klar" },
    { id: "r8", name: "Ida Ström",       email: "ida@exempel.se",     phone: "", receivedAt: "2026-09-10T10:00:00Z", type: "annat", colors: ["smorgul"], size: "liten", ownGlass: false, needBy: "", desc: "Ljusstake?", image: false, status: "klar" },
  ],

  charity: {
    orgs: ["Bröstcancerförbundet", "Barncancerfonden"],
    current: "Bröstcancerförbundet",
    text: "För varje såld (.)(.) vas skänker jag en del till Bröstcancerförbundet.",
    total: 12450,
    period: "1–31 oktober",
    showTotal: true,
    gifts: [
      { id: "g1", date: "2026-10-01", org: "Bröstcancerförbundet", amount: 500, receipt: true },
      { id: "g2", date: "2026-07-08", org: "Bröstcancerförbundet", amount: 450, receipt: true },
      { id: "g3", date: "2026-05-29", org: "Barncancerfonden",     amount: 500, receipt: true },
    ],
  },

  theme: "standard",
};

// Exempel: historik som inte ligger i listorna
const SOLD_EARLIER_THIS_YEAR = 31;
const PICKED_EARLIER = 33;

const Store = (() => {
  const KEY = "bt-admin-v2";
  let db;
  try { db = JSON.parse(localStorage.getItem(KEY)); } catch (_) {}
  if (!db || !db.products) db = structuredClone(ADMIN_SEED);

  const save = () => {
    try { localStorage.setItem(KEY, JSON.stringify(db)); return true; }
    catch (_) { return false; }
  };
  const today = () => new Date().toISOString().slice(0, 10);
  const uid = (p) => p + Math.random().toString(36).slice(2, 8);
  const slug = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "produkt";

  return {
    // ---- Produkter ----
    products: () => db.products.slice(),
    product: (id) => db.products.find((p) => p.id === id),
    saveProduct(id, data) {
      if (id) Object.assign(this.product(id), data);
      else {
        let nid = slug(data.name), n = 2;
        while (db.products.some((p) => p.id === nid)) nid = `${slug(data.name)}-${n++}`;
        db.products.unshift({ id: nid, uploaded: today(), ...data });
        id = nid;
      }
      if (data.status === "sald" && !this.product(id).soldAt) this.product(id).soldAt = today();
      return save() ? id : null;
    },
    removeProduct(id) { db.products = db.products.filter((p) => p.id !== id); save(); },
    toggleHidden(id) { const p = this.product(id); p.hidden = !p.hidden; save(); },

    // ---- Bokningar ----
    bookings: () => db.bookings.slice(),
    pendingBookingFor: (productId) => db.bookings.find((b) => b.productId === productId && b.status === "vantar"),
    completeBooking(id) {
      const b = db.bookings.find((x) => x.id === id);
      b.status = "hamtad"; b.pickedAt = new Date().toISOString();
      const p = this.product(b.productId);
      if (p) { p.status = "sald"; p.soldAt = today(); }
      save();
    },
    releaseBooking(id) {
      const b = db.bookings.find((x) => x.id === id);
      b.status = "slappt";
      const p = this.product(b.productId);
      if (p) p.status = "tillganglig";
      save();
    },
    // Från produktlistan
    markProductSold(productId) {
      const b = this.pendingBookingFor(productId);
      if (b) return this.completeBooking(b.id);
      const p = this.product(productId); p.status = "sald"; p.soldAt = today(); save();
    },
    releaseProduct(productId) {
      const b = this.pendingBookingFor(productId);
      if (b) return this.releaseBooking(b.id);
      this.product(productId).status = "tillganglig"; save();
    },

    // ---- Förfrågningar ----
    requests: () => db.requests.slice(),
    setRequestStatus(id, status) { db.requests.find((r) => r.id === id).status = status; save(); },

    // ---- Välgörenhet ----
    charity: () => structuredClone(db.charity),
    saveCharity(data) { db.charity = structuredClone(data); save(); },

    // ---- Tema ----
    theme: () => db.theme,
    saveTheme(t) { db.theme = t; save(); },

    reset() { db = structuredClone(ADMIN_SEED); save(); },
    uid,
  };
})();
