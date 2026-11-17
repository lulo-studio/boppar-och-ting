// ==========================================================
// Vy: Produkter (lista)   #produkter
// ==========================================================

(function () {
  const { $, esc, kr, fmtDate, PH, PICKUP_SHORT, toast, confirm } = Admin;
  let filter = "alla";

  const matches = (p, f) => (f === "alla" ? true : f === "dolda" ? p.hidden : !p.hidden && p.status === f);

  function statusPill(p) {
    if (p.hidden) return '<span class="pill pill--hidden">Dold</span>';
    if (p.status === "bokad") return '<span class="pill pill--booked">Bokad</span>';
    if (p.status === "sald") return '<span class="pill pill--sold">Såld</span>';
    return '<span class="pill">Tillgänglig</span>';
  }

  function row(p) {
    const sub = p.status === "sald" && p.soldAt ? `Såld ${fmtDate(p.soldAt)}` : `Uppladdad ${fmtDate(p.uploaded)}`;
    const b = p.status === "bokad" ? Store.pendingBookingFor(p.id) : null;
    const note = b ? `<small class="pill-note">${esc(b.name.split(" ")[0])} ${esc((b.name.split(" ")[1] || "")[0] || "")}. · ${PICKUP_SHORT[b.pickup] || ""}</small>` : "";
    const thumb = p.images?.[0] ? `<img src="${p.images[0]}" alt="" />` : PH;

    const actions = p.status === "bokad"
      ? `<button class="a-btn a-btn--dark" data-act="sold">Markera såld</button>
         <button class="a-link" data-act="release">Släpp bokning</button>`
      : `<a class="a-link" href="#produkter/${p.id}">Ändra</a>
         <button class="a-link" data-act="hide">${p.hidden ? "Visa" : "Dölj"}</button>
         <button class="a-link a-link--danger" data-act="delete">Ta bort</button>`;

    return `
      <tr data-id="${p.id}">
        <td class="c-product"><a class="c-product-inner" href="#produkter/${p.id}">
          <span class="a-thumb">${thumb}</span>
          <span><strong>${esc(p.name)}</strong><small>${sub}</small></span>
        </a></td>
        <td class="c-cat">${p.category === "lampa" ? "Lampa" : "Vas"}</td>
        <td class="c-price">${kr(p.price)}</td>
        <td class="c-status">${statusPill(p)}${note}</td>
        <td class="c-visible">
          <label class="a-switch">
            <input type="checkbox" data-act="toggle" ${p.hidden ? "" : "checked"} aria-label="Visa ${esc(p.name)} på hemsidan" />
            <span></span>
          </label>
        </td>
        <td class="c-actions">${actions}</td>
      </tr>`;
  }

  function render(main) {
    main.innerHTML = `
      <section class="admin-view">
        <header class="admin-head">
          <div>
            <h1>Produkter</h1>
            <p>Här lägger du upp, ändrar och tar bort det som visas på hemsidan.</p>
          </div>
          <a href="#produkter/ny" class="btn btn-dark">+&nbsp; Lägg till produkt</a>
        </header>

        <div class="a-banner" data-banner>
          <strong data-banner-text></strong>
          <a href="#bokningar" class="link-arrow">Se bokningar</a>
        </div>

        <div class="a-stats">
          <div class="a-stat"><strong data-stat="available"></strong><span>Tillgängliga just nu</span></div>
          <div class="a-stat"><strong data-stat="booked"></strong><span>Bokade</span></div>
          <div class="a-stat"><strong data-stat="sold"></strong><span>Sålda i år</span></div>
        </div>

        <div class="chips a-chips" data-chips role="group" aria-label="Filtrera produkter"></div>

        <div class="a-table-wrap">
          <table class="a-table">
            <thead><tr>
              <th>Produkt</th><th>Kategori</th><th class="c-price">Pris</th><th>Status</th><th>På hemsidan</th><th>Åtgärder</th>
            </tr></thead>
            <tbody data-rows></tbody>
          </table>
        </div>
      </section>`;

    const update = () => {
      const list = Store.products();
      const c = {
        alla: list.length,
        tillganglig: list.filter((p) => matches(p, "tillganglig")).length,
        bokad: list.filter((p) => matches(p, "bokad")).length,
        sald: list.filter((p) => matches(p, "sald")).length,
        dolda: list.filter((p) => p.hidden).length,
      };
      const year = String(new Date().getFullYear());
      $("[data-stat=available]", main).textContent = c.tillganglig;
      $("[data-stat=booked]", main).textContent = c.bokad;
      $("[data-stat=sold]", main).textContent =
        SOLD_EARLIER_THIS_YEAR + list.filter((p) => p.status === "sald" && (p.soldAt || "").startsWith(year)).length;

      const pending = Store.bookings().filter((b) => b.status === "vantar").length;
      $("[data-banner]", main).hidden = pending === 0;
      $("[data-banner-text]", main).textContent = `${pending} ${pending === 1 ? "bokning väntar" : "bokningar väntar"} på att hämtas`;

      const labels = { alla: "Alla", tillganglig: "Tillgängliga", bokad: "Bokade", sald: "Sålda", dolda: "Dolda" };
      $("[data-chips]", main).innerHTML = Object.keys(labels)
        .map((k) => `<button type="button" class="chip${k === filter ? " is-active" : ""}" data-filter="${k}" aria-pressed="${k === filter}">${labels[k]} (${c[k]})</button>`)
        .join("");

      const rows = list.filter((p) => matches(p, filter));
      $("[data-rows]", main).innerHTML = rows.length
        ? rows.map(row).join("")
        : `<tr><td colspan="6" class="a-empty">Inga produkter här just nu.</td></tr>`;
      Admin.updateBadges();
    };

    $("[data-chips]", main).addEventListener("click", (e) => {
      const b = e.target.closest("[data-filter]");
      if (b) { filter = b.dataset.filter; update(); }
    });

    $("[data-rows]", main).addEventListener("click", async (e) => {
      const btn = e.target.closest("button[data-act]");
      if (!btn) return;
      const id = btn.closest("tr").dataset.id;
      const p = Store.product(id);
      if (btn.dataset.act === "sold") { Store.markProductSold(id); toast(`${p.name} är markerad som såld`); }
      if (btn.dataset.act === "release") { Store.releaseProduct(id); toast(`Bokningen av ${p.name} är släppt`); }
      if (btn.dataset.act === "hide") { Store.toggleHidden(id); toast(p.hidden ? `${p.name} är dold` : `${p.name} visas igen`); }
      if (btn.dataset.act === "delete") {
        const ok = await confirm({ title: `Ta bort ${p.name}?`, text: "Produkten försvinner från hemsidan och går inte att få tillbaka." });
        if (!ok) return;
        Store.removeProduct(id);
        toast(`${p.name} är borttagen`);
      }
      update();
    });

    $("[data-rows]", main).addEventListener("change", (e) => {
      if (e.target.dataset.act !== "toggle") return;
      Store.toggleHidden(e.target.closest("tr").dataset.id);
      update();
    });

    update();
  }

  Admin.views.produkter = {
    render: (main, param) => (param ? Admin.views.produktedit.render(main, param) : render(main)),
  };
})();
