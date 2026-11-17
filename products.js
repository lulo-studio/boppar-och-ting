// ==========================================================
// Produktdata – EN källa för Lampor, Vaser och Alla produkter.
// Lägg till nya produkter överst (eller ge dem ett nyare datum).
//
// category: "lampa" | "vas"
// sold:     true/false
// image:    sökväg till bild, t.ex. "img/smorblomman.jpg" (null = platshållare)
// added:    datum (används för "Nyast först")
// images:   (valfritt) lista med bilder till produktsidans galleri
// desc:     (valfritt) beskrivning på produktsidan
// ==========================================================

const PRODUCTS = [
  { id: "smorblomman",    name: "Smörblomman",          category: "lampa", size: 25, price: 650, sold: false, image: null, added: "2026-11-08" },
  { id: "rosa-vas",       name: "Rosa (.)(.) vas",      category: "vas",   size: 18, price: 450, sold: false, image: null, added: "2026-11-06" },
  { id: "hallonsvampen",  name: "Hallonsvampen",        category: "lampa", size: 22, price: 650, sold: false, image: null, added: "2026-11-04",
    desc: "En gammal pressglasskål från loppis som fått en ny fot med hallonrosa ränder, målad för hand. Sladdlös – ställ den på byrån, i fönstret eller på middagsbordet." },
  { id: "kolasnurran",    name: "Kolasnurran",          category: "lampa", size: 24, price: 595, sold: false, image: null, added: "2026-11-01" },
  { id: "sandfargad-vas", name: "Sandfärgad (.)(.) vas", category: "vas",  size: 20, price: 450, sold: false, image: null, added: "2026-10-28" },
  { id: "rosenknoppen",   name: "Rosenknoppen",         category: "lampa", size: 25, price: 650, sold: false, image: null, added: "2026-10-24" },
  { id: "mintkupolen",    name: "Mintkupolen",          category: "lampa", size: 24, price: 650, sold: false, image: null, added: "2026-10-20" },
  { id: "plommon-vas",    name: "Plommon (.)(.) vas",   category: "vas",   size: 16, price: 425, sold: false, image: null, added: "2026-10-15" },
  { id: "blabarsdrommen", name: "Blåbärsdrömmen",       category: "lampa", size: 28, price: 695, sold: false, image: null, added: "2026-10-10" },
  { id: "skogsglantan",   name: "Skogsgläntan",         category: "lampa", size: 28, price: 695, sold: true,  image: null, added: "2026-10-05" },
  { id: "vit-vas",        name: "Vit (.)(.) vas",       category: "vas",   size: 18, price: 450, sold: true,  image: null, added: "2026-09-28" },
  { id: "karamellen",     name: "Karamellen",           category: "lampa", size: 20, price: 595, sold: true,  image: null, added: "2026-09-20" },
];
