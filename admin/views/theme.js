// ==========================================================
// Vy: Färgtema   #fargtema
// ==========================================================

(function () {
  const { $, $$, toast } = Admin;

  const THEMES = [
    {
      id: "standard",
      name: "Standard",
      desc: "Plommon och röd-rosa. Används till vardags.",
      bar: "För varje såld (.)(.) vas skänks en del…",
    },
    {
      id: "rosa",
      name: "Bröstcancer-tema",
      desc: "Mer rosa. Passar bra under Rosa oktober och andra insamlingar till bröstcancerforskningen.",
      bar: "Oktober är bröstcancermånaden ♡",
    },
  ];

  const mock = (t) => `
    <div class="a-theme-mock a-theme-mock--${t.id}" aria-hidden="true">
      <div class="m-bar">${t.bar}</div>
      <div class="m-head"><span class="m-logo"></span><span class="m-brand">Boppar &amp; ting</span><span class="m-btn">Specialbeställ</span></div>
      <div class="m-hero">
        <div>
          <p class="m-h1">Gamla skålar.<br /><em>Nya ljus.</em></p>
          <span class="m-cta">Se lamporna</span>
        </div>
        <span class="m-img"></span>
      </div>
      <div class="m-cards"><span></span><span></span><span></span></div>
    </div>`;

  function render(main) {
    let active = Store.theme();
    let chosen = active;

    main.innerHTML = `
      <section class="admin-view">
        <header class="admin-head"><div>
          <h1>Färgtema</h1>
          <p>Välj hur hemsidan ser ut. Ändringen syns direkt för alla besökare.</p>
        </div></header>

        <div class="a-themes" role="radiogroup" aria-label="Färgtema">
          ${THEMES.map((t) => `
            <label class="a-theme" data-theme="${t.id}">
              ${mock(t)}
              <span class="a-theme-foot">
                <input type="radio" name="theme" value="${t.id}" />
                <span class="a-theme-text"><strong>${t.name}</strong><small>${t.desc}</small></span>
                <span class="pill pill--booked a-theme-active" hidden>Aktivt nu</span>
              </span>
            </label>`).join("")}
        </div>

        <div class="a-more-themes">
          <strong>Fler teman kommer</strong>
          <p>Längre fram kan fler teman läggas till, t.ex. ett för Barncancerfonden, och temat kan bytas automatiskt vissa månader.</p>
        </div>

        <div class="btn-row">
          <a class="btn btn-outline a-btn-white" data-preview target="_blank" rel="noopener">Förhandsgranska hemsidan</a>
          <button type="button" class="btn btn-dark" data-save>Spara</button>
        </div>
      </section>`;

    const update = () => {
      $$(".a-theme", main).forEach((el) => {
        const id = el.dataset.theme;
        $("input", el).checked = id === chosen;
        el.classList.toggle("is-chosen", id === chosen);
        $(".a-theme-active", el).hidden = id !== active;
      });
      $("[data-preview]", main).href = `../index.html?tema=${chosen}`;
      $("[data-save]", main).disabled = chosen === active;
    };

    main.addEventListener("change", (e) => {
      if (e.target.name === "theme") { chosen = e.target.value; update(); }
    });
    $("[data-save]", main).addEventListener("click", () => {
      Store.saveTheme(chosen);
      active = chosen;
      update();
      toast(`${THEMES.find((t) => t.id === chosen).name} är nu aktivt`);
    });

    update();
  }

  Admin.views.fargtema = { render };
})();
