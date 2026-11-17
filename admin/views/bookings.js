// ==========================================================
// Vy: Bokningar   #bokningar
// ==========================================================

(function () {
  const { $, esc, kr, fmtDate, daysSince, relDays, PH, PICKUP, toast, confirm } = Admin;
  const OVERDUE_DAYS = 5;
  let filter = "vantar";

  const productOf = (b) => Store.product(b.productId) || { name: "Borttagen produkt", price: 0, images: [] };

  function card(b) {
    const p = productOf(b);
    const days = daysSince(b.bookedAt);
    const overdue = b.status === "vantar" && days >= OVERDUE_DAYS;
    const thumb = p.images?.[0] ? `<img src="${p.images[0]}" alt="" />` : PH;

    const pill = {
      vantar: '<span class="pill pill--booked">Väntar på hämtning</span>',
      hamtad: '<span class="pill pill--done">Hämtad · Såld</span>',
      slappt: '<span class="pill pill--hidden">Släppt</span>',
    }[b.status];

    const when = {
      vantar: `Bokad ${fmtDate(b.bookedAt)} · ${relDays(days)}`,
      hamtad: `Hämtad ${fmtDate(b.pickedAt || b.bookedAt)}`,
      slappt: `Bokad ${fmtDate(b.bookedAt)} · släppt`,
    }[b.status];

    const mail = `mailto:${b.email}?subject=${encodeURIComponent("Din bokning – " + p.name)}`;
    const remind = `mailto:${b.email}?subject=${encodeURIComponent("Påminnelse: " + p.name + " väntar på dig")}&body=${encodeURIComponent(`Hej ${b.name.split(" ")[0]}!\n\nBara en påminnelse om att ${p.name} väntar på att hämtas. Hör av dig om du behöver mer tid.\n\nKram, Anne`)}`;

    const actions = b.status === "vantar"
      ? `<button class="btn btn-dark btn-sm" data-act="done">Markera som hämtad och såld</button>
         <button class="btn btn-outline btn-sm a-btn-white" data-act="release">Släpp bokning</button>
         <a class="a-link a-link--danger" href="${overdue ? remind : mail}" data-act="mail">${overdue ? "Skicka påminnelse" : "Kontakta kunden"}</a>`
      : `<button class="btn btn-outline btn-sm a-btn-white" data-act="details" aria-expanded="false">Visa detaljer</button>`;

    return `
      <article class="a-booking${overdue ? " is-overdue" : ""}${b.status !== "vantar" ? " is-closed" : ""}" data-id="${b.id}">
        <div class="a-booking-thumb">${thumb}</div>
        <div class="a-booking-info">
          <div class="a-booking-title">
            <h2>${esc(p.name)}</h2><span class="a-booking-price">${kr(p.price)}</span>${pill}
          </div>
          <p class="a-booking-when">${when}</p>
          <dl class="a-booking-meta">
            <div><dt>Kund</dt><dd><strong>${esc(b.name)}</strong></dd></div>
            <div><dt>Hämtas i</dt><dd>${PICKUP[b.pickup] || "–"}</dd></div>
            <div><dt>Telefon</dt><dd><a href="tel:${esc(b.phone.replace(/\s/g, ""))}">${esc(b.phone)}</a></dd></div>
            ${b.message ? `<div><dt>Meddelande</dt><dd>”${esc(b.message)}”</dd></div>` : "<div></div>"}
            <div><dt>E-post</dt><dd><a href="mailto:${esc(b.email)}">${esc(b.email)}</a></dd></div>
          </dl>
          ${overdue ? `<p class="a-booking-warn">Bokad för ${days} dagar sedan och inte hämtad än. Vill du påminna kunden eller släppa bokningen?</p>` : ""}
        </div>
        <div class="a-booking-actions">${actions}</div>
      </article>`;
  }

  function render(main) {
    main.innerHTML = `
      <section class="admin-view">
        <header class="admin-head"><div>
          <h1>Bokningar</h1>
          <p>Här ser du vem som har bokat vad och var de ska hämta.</p>
        </div></header>
        <div class="chips a-chips" data-chips role="group" aria-label="Filtrera bokningar"></div>
        <div class="a-bookings" data-list></div>
      </section>`;

    const update = () => {
      const all = Store.bookings().sort((a, b) => (b.pickedAt || b.bookedAt).localeCompare(a.pickedAt || a.bookedAt));
      const by = (s) => all.filter((b) => b.status === s);
      const counts = { vantar: by("vantar").length, hamtad: by("hamtad").length + PICKED_EARLIER, slappt: by("slappt").length };
      const labels = { vantar: `Väntar på hämtning (${counts.vantar})`, hamtad: `Hämtade (${counts.hamtad})`, slappt: `Släppta (${counts.slappt})`, alla: "Alla" };

      $("[data-chips]", main).innerHTML = Object.entries(labels)
        .map(([k, l]) => `<button type="button" class="chip${k === filter ? " is-active" : ""}" data-filter="${k}" aria-pressed="${k === filter}">${l}</button>`)
        .join("");

      // "Alla": väntande först, sen resten
      const list = filter === "alla" ? [...by("vantar"), ...all.filter((b) => b.status !== "vantar")] : by(filter);
      $("[data-list]", main).innerHTML = list.length
        ? list.map(card).join("")
        : `<div class="a-placeholder">${filter === "vantar" ? "Inga bokningar väntar just nu. 🎉" : "Inget här än."}</div>`;
      Admin.updateBadges();
    };

    $("[data-chips]", main).addEventListener("click", (e) => {
      const b = e.target.closest("[data-filter]");
      if (b) { filter = b.dataset.filter; update(); }
    });

    $("[data-list]", main).addEventListener("click", async (e) => {
      const btn = e.target.closest("[data-act]");
      if (!btn || btn.dataset.act === "mail") return;
      const card = btn.closest(".a-booking");
      const b = Store.bookings().find((x) => x.id === card.dataset.id);
      const name = productOf(b).name;

      if (btn.dataset.act === "done") {
        Store.completeBooking(b.id);
        toast(`${name} är hämtad och såld`);
      }
      if (btn.dataset.act === "release") {
        const ok = await confirm({
          title: "Släppa bokningen?",
          text: `${name} blir tillgänglig på hemsidan igen. Glöm inte att höra av dig till ${b.name.split(" ")[0]}.`,
          ok: "Släpp bokning",
        });
        if (!ok) return;
        Store.releaseBooking(b.id);
        toast(`Bokningen av ${name} är släppt`);
      }
      if (btn.dataset.act === "details") {
        const open = card.classList.toggle("is-open");
        btn.setAttribute("aria-expanded", open);
        btn.textContent = open ? "Dölj detaljer" : "Visa detaljer";
        return;
      }
      update();
    });

    update();
  }

  Admin.views.bokningar = { render };
})();
