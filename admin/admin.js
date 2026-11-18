// ==========================================================
// ADMIN – kärna: router, hjälpfunktioner, toast, bekräfta.
// Vyerna ligger i views/*.js och registrerar sig i Admin.views.
// ==========================================================

const Admin = (() => {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const MONTHS = ["jan", "feb", "mars", "apr", "maj", "juni", "juli", "aug", "sep", "okt", "nov", "dec"];
  const toDate = (v) => (v instanceof Date ? v : new Date(v.length === 10 ? v + "T12:00:00" : v));
  const fmtDate = (v, withYear = false) => {
    const d = toDate(v);
    return `${d.getDate()} ${MONTHS[d.getMonth()]}${withYear ? " " + d.getFullYear() : ""}`;
  };
  const daysSince = (v) => Math.floor((Date.now() - toDate(v).getTime()) / 864e5);
  const relDays = (n) => (n <= 0 ? "idag" : n === 1 ? "för 1 dag sedan" : `för ${n} dagar sedan`);
  const fmtWhen = (v) => {
    const d = toDate(v);
    const hm = d.toLocaleTimeString("sv-SE", { hour: "2-digit", minute: "2-digit" });
    return d.toDateString() === new Date().toDateString() ? `Idag ${hm}` : fmtDate(v);
  };
  const kr = (n) => Number(n || 0).toLocaleString("sv-SE") + " kr";
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const PH = '<svg class="a-ph" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-8 8"/></svg>';
  const PICKUP = { blomaffaren: "Kvistar & Krus", hemma: "Hemma hos Anne" };
  const PICKUP_SHORT = { blomaffaren: "hämtar hos Kvistar & Krus", hemma: "hämtar hemma hos Anne" };

  const views = {};

  // ---------- Router ----------
  // #produkter, #produkter/ny, #produkter/<id>, #bokningar, #forfragningar, #valgorenhet, #fargtema
  function route() {
    const [name, param] = (location.hash.slice(1) || "produkter").split("/");
    const view = views[name] ? name : "produkter";
    const main = $("#view");
    main.innerHTML = "";
    main.scrollTop = 0;
    window.scrollTo(0, 0);
    views[view].render(main, param ? decodeURIComponent(param) : null);
    $$(".admin-nav a").forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + view));
    $(".admin-shell").classList.remove("nav-open");
    updateBadges();
  }

  function updateBadges() {
    const pending = Store.bookings().filter((b) => b.status === "vantar").length;
    const newReq = Store.requests().filter((r) => r.status === "ny").length;
    const set = (sel, n, word) => {
      const el = $(sel);
      el.hidden = n === 0;
      el.textContent = `${n} ${n === 1 ? word[0] : word[1]}`;
    };
    set("[data-badge=bokningar]", pending, ["ny", "nya"]);
    set("[data-badge=forfragningar]", newReq, ["ny", "nya"]);
  }

  // ---------- Toast ----------
  let toastTimer;
  function toast(msg) {
    const t = $("[data-toast]");
    t.textContent = msg;
    t.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-visible"), 2600);
  }

  // ---------- Bekräfta ----------
  function confirm({ title, text, ok = "Ta bort", danger = true }) {
    return new Promise((resolve) => {
      const d = $("#confirm-modal");
      $("[data-confirm-title]", d).textContent = title;
      $("[data-confirm-text]", d).textContent = text;
      const okBtn = $("[data-confirm-ok]", d);
      okBtn.textContent = ok;
      okBtn.className = "btn " + (danger ? "btn-danger" : "btn-dark");
      const done = (v) => { d.close(); okBtn.onclick = null; resolve(v); };
      okBtn.onclick = () => done(true);
      d.onclose = () => resolve(false);
      d.showModal();
    });
  }

  // ---------- Bild → nedskalad dataURL (håller localStorage litet) ----------
  function readImage(file, max = 900) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onerror = reject;
      r.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const s = Math.min(1, max / Math.max(img.width, img.height));
          const c = document.createElement("canvas");
          c.width = Math.round(img.width * s);
          c.height = Math.round(img.height * s);
          c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
          resolve(c.toDataURL("image/jpeg", 0.8));
        };
        img.src = r.result;
      };
      r.readAsDataURL(file);
    });
  }

  // ---------- Globala händelser ----------
  function init() {
    window.addEventListener("hashchange", route);
    $(".admin-menu-btn").addEventListener("click", () => $(".admin-shell").classList.toggle("nav-open"));
    $$("dialog").forEach((d) => {
      d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
      $$("[data-close]", d).forEach((b) => b.addEventListener("click", () => d.close()));
    });
    $("[data-reset]").addEventListener("click", (e) => {
      e.preventDefault();
      Store.reset();
      route();
      toast("Exempeldatan är återställd");
    });
    route();
  }

  return { $, $$, fmtDate, fmtWhen, daysSince, relDays, kr, esc, PH, PICKUP, PICKUP_SHORT, views, route, updateBadges, toast, confirm, readImage, init };
})();
