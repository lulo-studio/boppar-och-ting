// ==========================================================
// Vy: Förfrågningar   #forfragningar  ·  #forfragningar/<id>
// ==========================================================

(function () {
  const { $, esc, fmtWhen, PH, toast, confirm } = Admin;

  const TYPE = { lampa: "Lampa", vas: "Vas", annat: "Något annat" };
  const SIZE = { liten: "Liten", mellan: "Mellan", stor: "Stor" };
  const SIZE_LONG = { liten: "Liten · ca 15 cm", mellan: "Mellan · ca 22 cm", stor: "Stor · ca 30 cm" };
  const COLOR = {
    rosa: ["Rosa", "#e48aa3"], smorgul: ["Smörgul", "#e9c45a"], gron: ["Grön", "#8fa07a"],
    bla: ["Blå", "#7d9cc4"], brun: ["Brun", "#9a6b4f"], overraska: ["Överraska mig", null],
  };
  const STATUS = { ny: ["Ny", "pill--new"], besvarad: ["Besvarad", ""], klar: ["Klar", "pill--done"], arkiverad: ["Arkiverad", "pill--hidden"] };

  let filter = "ny";
  let selected = null;

  const summary = (r) => [
    TYPE[r.type],
    r.ownGlass ? "eget glas" : null,
    ...(r.ownGlass ? [] : r.colors.map((c) => COLOR[c]?.[0])),
    r.ownGlass ? null : SIZE[r.size],
  ].filter(Boolean).join(" · ");

  const pill = (r) => `<span class="pill ${STATUS[r.status][1]}">${STATUS[r.status][0]}</span>`;

  function detail(r) {
    if (!r) return `<div class="a-card a-req-detail a-req-empty">Välj en förfrågan i listan.</div>`;
    const colors = r.colors.length
      ? r.colors.map((c) => `<span class="a-color">${COLOR[c][1] ? `<i style="background:${COLOR[c][1]}"></i>` : ""}${COLOR[c][0]}</span>`).join("")
      : "–";
    const reply = `mailto:${r.email}?subject=${encodeURIComponent("Din förfrågan hos Boppar & ting")}&body=${encodeURIComponent(`Hej ${r.name.split(" ")[0]}!\n\nTack för din förfrågan! `)}`;

    const next = r.status === "ny"
      ? `<button class="btn btn-outline btn-sm a-btn-white" data-act="besvarad">Markera som besvarad</button>`
      : r.status === "besvarad"
        ? `<button class="btn btn-outline btn-sm a-btn-white" data-act="klar">Markera som klar</button>`
        : r.status === "arkiverad"
          ? `<button class="btn btn-outline btn-sm a-btn-white" data-act="besvarad">Återställ</button>`
          : "";

    return `
      <article class="a-card a-req-detail" data-id="${r.id}">
        <header class="a-req-head">
          <div>
            <h2>${esc(r.name)}</h2>
            <small>Inkom ${fmtWhen(r.receivedAt).replace("Idag", "idag")}</small>
          </div>
          ${pill(r)}
        </header>
        <p class="a-req-contact">
          <a href="mailto:${esc(r.email)}">${esc(r.email)}</a>
          ${r.phone ? `<a href="tel:${esc(r.phone.replace(/\s/g, ""))}">${esc(r.phone)}</a>` : ""}
        </p>
        <dl class="a-req-list">
          <div><dt>Vad</dt><dd>${TYPE[r.type]}</dd></div>
          <div><dt>Färger</dt><dd class="a-colors">${colors}</dd></div>
          <div><dt>Storlek</dt><dd>${SIZE_LONG[r.size] || "–"}</dd></div>
          <div><dt>Eget glas</dt><dd>${r.ownGlass ? "Ja, har ett eget glas" : "Nej, Anne får välja"}</dd></div>
          <div><dt>Behövs till</dt><dd>${esc(r.needBy) || "–"}</dd></div>
        </dl>
        <p class="a-req-label">Beskrivning</p>
        <p class="a-req-desc">${esc(r.desc)}</p>
        ${r.image ? `<p class="a-req-label">Bifogad bild</p><div class="a-req-image">${PH}</div>` : ""}
        <footer class="a-req-actions">
          <a class="btn btn-dark btn-sm" href="${reply}">Svara via mejl</a>
          ${next}
          ${r.status !== "arkiverad" ? '<button class="a-link a-link--danger a-ml-auto" data-act="arkiverad">Arkivera</button>' : ""}
        </footer>
      </article>`;
  }

  function render(main, param) {
    if (param) selected = param;

    main.innerHTML = `
      <section class="admin-view">
        <header class="admin-head"><div>
          <h1>Förfrågningar</h1>
          <p>Specialbeställningar som kommer in via formuläret på hemsidan.</p>
        </div></header>
        <div class="chips a-chips" data-chips role="group" aria-label="Filtrera förfrågningar"></div>
        <div class="a-requests">
          <div class="a-req-list-col" data-list></div>
          <div data-detail></div>
        </div>
      </section>`;

    const update = () => {
      const all = Store.requests().sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
      const n = (s) => all.filter((r) => r.status === s).length;
      const labels = { ny: `Nya (${n("ny")})`, besvarad: `Besvarade (${n("besvarad")})`, klar: `Klara (${n("klar")})`, alla: "Alla" };
      $("[data-chips]", main).innerHTML = Object.entries(labels)
        .map(([k, l]) => `<button type="button" class="chip${k === filter ? " is-active" : ""}" data-filter="${k}" aria-pressed="${k === filter}">${l}</button>`)
        .join("");

      const list = filter === "alla" ? all.filter((r) => r.status !== "arkiverad") : all.filter((r) => r.status === filter);
      if (!list.some((r) => r.id === selected)) selected = list[0]?.id || null;

      $("[data-list]", main).innerHTML = list.length
        ? list.map((r) => `
            <button type="button" class="a-req-item${r.id === selected ? " is-active" : ""}" data-id="${r.id}">
              <span class="a-req-item-top"><strong>${esc(r.name)}</strong>${pill(r)}</span>
              <span class="a-req-item-sum">${summary(r)}</span>
              <small>${fmtWhen(r.receivedAt)}</small>
            </button>`).join("")
        : `<div class="a-placeholder">${filter === "ny" ? "Inga nya förfrågningar." : "Inget här än."}</div>`;

      $("[data-detail]", main).innerHTML = list.length ? detail(all.find((r) => r.id === selected)) : "";
      Admin.updateBadges();
    };

    $("[data-chips]", main).addEventListener("click", (e) => {
      const b = e.target.closest("[data-filter]");
      if (b) { filter = b.dataset.filter; selected = null; update(); }
    });

    $("[data-list]", main).addEventListener("click", (e) => {
      const item = e.target.closest(".a-req-item");
      if (!item) return;
      selected = item.dataset.id;
      update();
      if (window.innerWidth < 900) $("[data-detail]", main).scrollIntoView({ behavior: "smooth" });
    });

    $("[data-detail]", main).addEventListener("click", async (e) => {
      const btn = e.target.closest("button[data-act]");
      if (!btn) return;
      const r = Store.requests().find((x) => x.id === btn.closest("[data-id]").dataset.id);
      const status = btn.dataset.act;
      if (status === "arkiverad") {
        const ok = await confirm({ title: "Arkivera förfrågan?", text: `${r.name}s förfrågan försvinner ur listorna.`, ok: "Arkivera" });
        if (!ok) return;
      }
      Store.setRequestStatus(r.id, status);
      toast({ besvarad: "Markerad som besvarad", klar: "Markerad som klar", arkiverad: "Förfrågan är arkiverad" }[status]);
      // Ligg kvar på samma förfrågan om den fortfarande syns i filtret
      if (filter !== "alla" && filter !== status) selected = null;
      update();
    });

    update();
  }

  Admin.views.forfragningar = { render };
})();
