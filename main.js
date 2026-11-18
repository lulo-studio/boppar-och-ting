// Mobilmeny
const toggle = document.querySelector(".nav-toggle");
const nav = document.getElementById("main-nav");

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!open));
    toggle.setAttribute("aria-label", open ? "Öppna meny" : "Stäng meny");
    nav.classList.toggle("is-open", !open);
  });

  // Stäng menyn när man klickar på en länk
  nav.querySelectorAll("a").forEach((link) =>
    link.addEventListener("click", () => {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Öppna meny");
      nav.classList.remove("is-open");
    })
  );
}

// Årtal i sidfoten
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// Färgtema – från config.js, eller förhandsgranskning via ?tema=rosa
(function () {
  const THEMES = {
    rosa: { cls: "theme-rosa", bar: "Rosa oktober – stötta bröstcancerforskningen ♡" },
  };
  let theme = typeof THEME !== "undefined" ? THEME : "standard";
  try {
    const q = new URLSearchParams(location.search).get("tema");
    if (q) sessionStorage.setItem("bt-tema", q);
    theme = sessionStorage.getItem("bt-tema") || theme;
  } catch (_) {}
  const t = THEMES[theme];
  if (!t) return;
  document.body.classList.add(t.cls);
  const bar = document.querySelector(".topbar");
  if (bar && t.bar) bar.textContent = t.bar;
})();
