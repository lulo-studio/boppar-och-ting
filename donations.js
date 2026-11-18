// ==========================================================
// Gåvor – EN källa för summan, startsidans lista och Välgörenhet.
// Lägg till nya gåvor överst. Summan räknas ut automatiskt.
//
// receipt: länk till kvittot (t.ex. Instagram-inlägget). null = länkar till profilen.
// ==========================================================

const DONATIONS = [
  { date: "2026-10-01", org: "Bröstcancerförbundet", amount: 500, receipt: null },
  { date: "2026-07-08", org: "Bröstcancerförbundet", amount: 450, receipt: null },
  { date: "2026-05-29", org: "Barncancerfonden",     amount: 500, receipt: null },
  { date: "2026-03-01", org: "Bröstcancerförbundet", amount: 500, receipt: null },
  { date: "2026-02-01", org: "Bröstcancerförbundet", amount: 500, receipt: null },
  { date: "2025-12-28", org: "Bröstcancerförbundet", amount: 500, receipt: null },
];

// ----------------------------------------------------------
// STARTBELOPP – TILLFÄLLIGT!
// Gåvor från 2021 och framåt som ännu inte finns i listan ovan.
// 12 360 kr + listans gåvor (2 950 kr) = 15 310 kr.
// TA BORT startbeloppet (sätt det till 0) när hela gåvolistan
// från 2021 är inlagd i DONATIONS – annars räknas gåvorna dubbelt.
// ----------------------------------------------------------
const EARLIER_TOTAL = 12360;

(function () {
  const MONTHS = ["jan", "feb", "mars", "apr", "maj", "juni", "jul", "aug", "sep", "okt", "nov", "dec"];
  const fmtDate = (iso) => {
    const [y, m, d] = iso.split("-").map(Number);
    return `${d} ${MONTHS[m - 1]} ${y}`;
  };
  const fmtKr = (n) => n.toLocaleString("sv-SE") + " kr";

  const sorted = DONATIONS.slice().sort((a, b) => b.date.localeCompare(a.date));
  const total = EARLIER_TOTAL + sorted.reduce((sum, d) => sum + d.amount, 0);

  // Summan – alla element med data-donation-total
  document.querySelectorAll("[data-donation-total]").forEach((el) => (el.textContent = fmtKr(total)));

  // Kort lista (startsidan) – data-donation-latest="3"
  document.querySelectorAll("[data-donation-latest]").forEach((ul) => {
    const n = Number(ul.dataset.donationLatest) || 3;
    ul.innerHTML = sorted
      .slice(0, n)
      .map((d) => `<li><span>${fmtDate(d.date)} · ${d.org}</span><strong>${fmtKr(d.amount)}</strong></li>`)
      .join("");
  });

  // Full tabell (Välgörenhet)
  document.querySelectorAll("[data-donation-table]").forEach((wrap) => {
    wrap.innerHTML = sorted
      .map(
        (d) => `
        <a class="donation-row" href="${d.receipt || INSTAGRAM_URL}" target="_blank" rel="noopener">
          <span class="donation-date">${fmtDate(d.date)}</span>
          <span class="donation-org">${d.org}</span>
          <strong class="donation-amount">${fmtKr(d.amount)}</strong>
          <span class="donation-link">Kvitto ↗</span>
        </a>`
      )
      .join("");
  });
})();
