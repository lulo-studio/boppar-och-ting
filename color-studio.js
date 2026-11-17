// ==========================================================
// Färgverktyg på Specialbeställning:
// palett med färgrutor, egen färg, "hur mycket" per färg
// och skalor för ton / styrka / uttryck.
// Lägg till eller ändra färger i COLORS nedan.
// ==========================================================

(function () {
  const studio = document.querySelector("[data-color-studio]");
  if (!studio) return;

  const COLORS = [
    { id: "rosa",       name: "Rosa",       hex: "#e48aa3", on: true },
    { id: "hallon",     name: "Hallon",     hex: "#c94a6e" },
    { id: "korall",     name: "Korall",     hex: "#ec8a6c" },
    { id: "persika",    name: "Persika",    hex: "#f2bc98" },
    { id: "smorgul",    name: "Smörgul",    hex: "#e9c45a", on: true },
    { id: "senap",      name: "Senap",      hex: "#c3962e" },
    { id: "mint",       name: "Mint",       hex: "#a8d4bf" },
    { id: "gron",       name: "Salvia",     hex: "#8fa07a" },
    { id: "skogsgron",  name: "Skogsgrön",  hex: "#4f6b4a" },
    { id: "himmelsbla", name: "Himmelsblå", hex: "#a9c6e4" },
    { id: "bla",        name: "Blå",        hex: "#5f82b3" },
    { id: "lavendel",   name: "Lavendel",   hex: "#b9a6d6" },
    { id: "plommon",    name: "Plommon",    hex: "#7b4a6b" },
    { id: "brun",       name: "Brun",       hex: "#9a6b4f" },
    { id: "sand",       name: "Sand",       hex: "#e2d2bd" },
    { id: "vit",        name: "Vit",        hex: "#f8f4ee" },
    { id: "svart",      name: "Svart",      hex: "#2b1d21" },
  ];
  const AMOUNTS = [
    { v: 1, label: "En aning" },
    { v: 2, label: "Lagom" },
    { v: 3, label: "Mycket" },
  ];

  const palette = studio.querySelector("[data-palette]");
  const mix = studio.querySelector("[data-mix]");
  const strip = studio.querySelector("[data-mix-strip]");
  const list = studio.querySelector("[data-mix-list]");
  const note = studio.querySelector("[data-mix-note]");

  const amounts = {}; // id -> 1|2|3
  let customHex = "#cf4a74";

  // ---------- Palett ----------
  palette.innerHTML =
    COLORS.map(
      (c) => `
      <label class="sw" title="${c.name}">
        <input type="checkbox" name="farger" value="${c.id}" ${c.on ? "checked" : ""} />
        <span class="sw-dot" style="--c:${c.hex}"></span>
        <span class="sw-name">${c.name}</span>
      </label>`
    ).join("") +
    `
      <label class="sw sw--custom" title="Välj en egen färg">
        <input type="checkbox" name="farger" value="egen" data-custom-toggle />
        <span class="sw-dot" style="--c:${customHex}" data-custom-dot>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>
        </span>
        <span class="sw-name">Egen färg</span>
      </label>
      <input type="color" class="sw-picker" name="egen_farg" value="${customHex}" data-custom-picker aria-label="Välj egen färg" disabled />
      <label class="sw sw--surprise" title="Anne väljer åt dig">
        <input type="checkbox" name="farger" value="overraska" data-surprise />
        <span class="sw-dot"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3l2.2 5.3L20 9l-4.4 3.8L17 19l-5-3-5 3 1.4-6.2L4 9l5.8-.7z"/></svg></span>
        <span class="sw-name">Överraska mig</span>
      </label>`;

  const customToggle = palette.querySelector("[data-custom-toggle]");
  const customPicker = palette.querySelector("[data-custom-picker]");
  const customDot = palette.querySelector("[data-custom-dot]");
  const surprise = palette.querySelector("[data-surprise]");

  const colorOf = (id) =>
    id === "egen" ? { id, name: "Egen färg", hex: customHex } : COLORS.find((c) => c.id === id);

  function selected() {
    return [...palette.querySelectorAll('input[name="farger"]:checked')]
      .map((i) => i.value)
      .filter((v) => v !== "overraska")
      .map(colorOf);
  }

  // Klick på "Egen färg" öppnar färgväljaren direkt
  customToggle.addEventListener("change", () => {
    customPicker.disabled = !customToggle.checked;
    if (customToggle.checked) {
      try { customPicker.showPicker(); } catch (_) { customPicker.click(); }
    }
    render();
  });
  customPicker.addEventListener("input", () => {
    customHex = customPicker.value;
    customDot.style.setProperty("--c", customHex);
    render();
  });

  palette.addEventListener("change", (e) => {
    if (e.target === surprise) studio.classList.toggle("is-surprise", surprise.checked);
    if (e.target !== customToggle) render();
  });

  // ---------- Din palett ----------
  function render() {
    const sel = selected();
    sel.forEach((c) => { if (!amounts[c.id]) amounts[c.id] = 2; });

    mix.hidden = sel.length === 0;
    note.textContent = surprise.checked
      ? "+ Anne får gärna överraska"
      : sel.length === 1 ? "1 färg" : `${sel.length} färger`;

    strip.innerHTML = sel
      .map((c) => `<span style="--c:${c.hex}; flex-grow:${amounts[c.id]}"></span>`)
      .join("");

    list.innerHTML = sel
      .map(
        (c) => `
        <li class="mix-row">
          ${c.id === "egen"
            ? `<button type="button" class="mix-dot mix-dot--edit" style="--c:${c.hex}" data-edit-custom aria-label="Byt egen färg" title="Byt färg"></button>`
            : `<span class="mix-dot" style="--c:${c.hex}"></span>`}
          <span class="mix-name">${c.name}</span>
          <span class="seg" role="radiogroup" aria-label="Hur mycket ${c.name}">
            ${AMOUNTS.map(
              (a) => `<label><input type="radio" name="mangd_${c.id}" value="${a.label}" data-id="${c.id}" data-v="${a.v}" ${amounts[c.id] === a.v ? "checked" : ""} /><span>${a.label}</span></label>`
            ).join("")}
          </span>
          <button type="button" class="mix-remove" data-remove="${c.id}" aria-label="Ta bort ${c.name}">×</button>
        </li>`
      )
      .join("");
  }

  list.addEventListener("change", (e) => {
    const r = e.target;
    if (!r.dataset.id) return;
    amounts[r.dataset.id] = Number(r.dataset.v);
    const sel = selected();
    strip.querySelectorAll("span").forEach((s, i) => (s.style.flexGrow = amounts[sel[i].id]));
  });

  list.addEventListener("click", (e) => {
    if (e.target.closest("[data-edit-custom]")) {
      try { customPicker.showPicker(); } catch (_) { customPicker.click(); }
      return;
    }
    const btn = e.target.closest("[data-remove]");
    if (!btn) return;
    const input = palette.querySelector(`input[name="farger"][value="${btn.dataset.remove}"]`);
    input.checked = false;
    if (input === customToggle) customPicker.disabled = true;
    render();
  });

  // ---------- Skalor ----------
  studio.querySelectorAll("[data-scale]").forEach((scale) => {
    const range = scale.querySelector('input[type="range"]');
    const out = scale.querySelector("[data-scale-out]");
    const hidden = scale.querySelector('input[type="hidden"]');
    const labels = hidden.dataset.labels.split("|");

    const update = () => {
      const label = labels[range.value - 1];
      out.textContent = label;
      hidden.value = label;
      range.setAttribute("aria-valuetext", label);
      range.style.setProperty("--p", ((range.value - 1) / 4) * 100 + "%");
      applyMood();
    };
    range.addEventListener("input", update);
    update();
  });

  // Förhandsvisningen av paletten följer ton och styrka
  function applyMood() {
    const get = (cls) => Number(studio.querySelector(`.scale--${cls} input[type="range"]`)?.value || 3);
    const ton = get("ton");
    const styrka = get("styrka");
    const brightness = [1.18, 1.08, 1, 0.88, 0.74][ton - 1];
    const saturate = [0.45, 0.72, 1, 1.25, 1.5][styrka - 1];
    strip.style.filter = `brightness(${brightness}) saturate(${saturate})`;
  }

  render();
})();
