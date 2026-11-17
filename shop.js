// ==========================================================
// Produktlistning: filter, "Visa sålda", sortering, "Visa fler".
// Styrs av data-attribut på #shop:
//   data-category="lampa" | "vas" | "alla"
//   data-page-size="12"
// ==========================================================

(function () {
  const shop = document.getElementById("shop");
  if (!shop || typeof PRODUCTS === "undefined") return;

  const category = shop.dataset.category || "alla";
  const pageSize = Number(shop.dataset.pageSize) || 12;

  const grid = shop.querySelector("[data-grid]");
  const chipsWrap = shop.querySelector("[data-chips]");
  const soldToggle = shop.querySelector("[data-show-sold]");      // Lampor/Vaser
  const availToggle = shop.querySelector("[data-only-available]"); // Alla produkter
  const sortSelect = shop.querySelector("[data-sort]");
  const countEl = shop.querySelector("[data-count]");
  const moreBtn = shop.querySelector("[data-more]");

  const base = category === "alla" ? PRODUCTS : PRODUCTS.filter((p) => p.category === category);

  const state = {
    filter: "alla",  // alla | tillgangliga | salda | lampa | vas
    showSold: true,
    sort: "nyast",
    visible: pageSize,
  };

  // ---------- Chips ----------
  const chipDefs =
    category === "alla"
      ? [
          { key: "alla", label: "Alla", count: base.length },
          { key: "lampa", label: "Lampor", count: base.filter((p) => p.category === "lampa").length },
          { key: "vas", label: "Vaser", count: base.filter((p) => p.category === "vas").length },
        ]
      : [
          { key: "alla", label: "Alla", count: base.length },
          { key: "tillgangliga", label: "Tillgängliga", count: base.filter((p) => !p.sold).length },
          { key: "salda", label: "Sålda", count: base.filter((p) => p.sold).length },
        ];

  chipsWrap.innerHTML = chipDefs
    .map(
      (c) =>
        `<button type="button" class="chip${c.key === state.filter ? " is-active" : ""}" data-key="${c.key}" aria-pressed="${c.key === state.filter}">${c.label} (${c.count})</button>`
    )
    .join("");

  chipsWrap.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    state.filter = btn.dataset.key;
    state.visible = pageSize;
    // Väljer man "Sålda" måste sålda synas
    if (state.filter === "salda" && soldToggle && !soldToggle.checked) {
      soldToggle.checked = true;
      state.showSold = true;
    }
    chipsWrap.querySelectorAll(".chip").forEach((c) => {
      const on = c === btn;
      c.classList.toggle("is-active", on);
      c.setAttribute("aria-pressed", on);
    });
    render();
  });

  soldToggle?.addEventListener("change", () => {
    state.showSold = soldToggle.checked;
    state.visible = pageSize;
    render();
  });

  availToggle?.addEventListener("change", () => {
    state.showSold = !availToggle.checked;
    availToggle.closest(".chip-toggle")?.classList.toggle("is-active", availToggle.checked);
    state.visible = pageSize;
    render();
  });

  sortSelect?.addEventListener("change", () => {
    state.sort = sortSelect.value;
    render();
  });

  moreBtn?.addEventListener("click", () => {
    state.visible += pageSize;
    render();
  });

  // ---------- Logik ----------
  function filtered() {
    let list = base.slice();
    if (state.filter === "tillgangliga") list = list.filter((p) => !p.sold);
    if (state.filter === "salda") list = list.filter((p) => p.sold);
    if (state.filter === "lampa" || state.filter === "vas") list = list.filter((p) => p.category === state.filter);
    if (!state.showSold) list = list.filter((p) => !p.sold);

    const sorters = {
      nyast: (a, b) => b.added.localeCompare(a.added),
      "pris-lag": (a, b) => a.price - b.price,
      "pris-hog": (a, b) => b.price - a.price,
      namn: (a, b) => a.name.localeCompare(b.name, "sv"),
    };
    list.sort(sorters[state.sort]);
    // Sålda hamnar alltid sist
    list.sort((a, b) => Number(a.sold) - Number(b.sold));
    return list;
  }

  const fmtPrice = (n) => n.toLocaleString("sv-SE") + " kr";
  const meta = (p) => (p.category === "lampa" ? "Lampa" : "Vas i lera") + " · ca " + p.size + " cm";

  const phIcon =
    '<svg class="ph-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-8 8"/></svg>';

  function card(p) {
    const badge = p.sold
      ? '<span class="badge badge--sold">Såld</span>'
      : '<span class="badge"><i class="dot"></i>Tillgänglig</span>';
    const media = p.image
      ? `<img src="${p.image}" alt="${p.name}" loading="lazy" />`
      : `${phIcon}<span>Produktbild</span>`;
    const link = p.sold
      ? `<a class="link-arrow small" href="specialbestallning.html">Liknande? Fråga</a>`
      : `<a class="link-arrow small" href="produkt.html?id=${p.id}">Se produkten</a>`;

    return `
      <article class="product${p.sold ? " is-sold" : ""}">
        <div class="product-media placeholder">${badge}${media}</div>
        <div class="product-body">
          <h3><a class="card-link" href="produkt.html?id=${p.id}">${p.name}</a></h3>
          <p class="muted small">${meta(p)}</p>
          <div class="product-foot">
            <span class="price">${fmtPrice(p.price)}</span>
            ${link}
          </div>
        </div>
      </article>`;
  }

  function render() {
    const list = filtered();
    const shown = list.slice(0, state.visible);

    grid.innerHTML = shown.length
      ? shown.map(card).join("")
      : '<p class="empty muted">Inga produkter matchar just nu.</p>';

    if (countEl) countEl.textContent = `Visar ${shown.length} av ${list.length} produkter`;
    if (moreBtn) moreBtn.hidden = shown.length >= list.length;
  }

  render();
})();
