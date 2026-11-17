// ==========================================================
// Vy: Välgörenhet   #valgorenhet
// ==========================================================

(function () {
  const { $, esc, kr, fmtDate, toast, confirm } = Admin;

  function render(main) {
    let c = Store.charity();      // utkast – sparas först vid "Spara ändringar"
    let dirty = false;

    main.innerHTML = `
      <section class="admin-view">
        <header class="admin-head"><div>
          <h1>Välgörenhet</h1>
          <p>Här ändrar du vem du samlar in till och hur mycket som har samlats in.</p>
        </div></header>

        <div class="a-editor">
          <div class="a-card a-editor-main">
            <h2 class="a-card-title">Insamling just nu</h2>

            <fieldset class="field">
              <legend>Vem samlar du in till?</legend>
              <div class="opts" data-orgs></div>
              <div class="a-inline-add" data-org-add hidden>
                <input type="text" placeholder="Organisationens namn" aria-label="Ny organisation" />
                <button type="button" class="btn btn-dark btn-sm" data-org-save>Lägg till</button>
                <button type="button" class="a-link" data-org-cancel>Avbryt</button>
              </div>
            </fieldset>

            <label class="field"><span>Text på hemsidan</span>
              <textarea name="text" rows="2"></textarea>
              <small class="a-hint">Syns i infobaren högst upp och på sidan Välgörenhet.</small></label>

            <div class="field-row">
              <label class="field"><span>Insamlat hittills (kr)</span>
                <input type="text" inputmode="numeric" name="total" /></label>
              <label class="field"><span>Period (valfritt)</span>
                <input type="text" name="period" placeholder="t.ex. 1–31 oktober" /></label>
            </div>

            <div class="a-toggle-row">
              <div>
                <strong>Visa insamlad summa på hemsidan</strong>
                <small>Stäng av om du hellre vill visa bara texten</small>
              </div>
              <label class="a-switch a-switch--pink">
                <input type="checkbox" name="showTotal" aria-label="Visa insamlad summa" /><span></span>
              </label>
            </div>

            <hr class="a-sep" />

            <div class="a-gifts-head">
              <div>
                <h2 class="a-card-title">Gåvor</h2>
                <small class="a-hint">Varje gåva visas i listan på sidan Välgörenhet.</small>
              </div>
              <button type="button" class="btn btn-dark btn-sm" data-gift-add>+ Lägg till gåva</button>
            </div>
            <div class="a-gifts" data-gifts></div>
          </div>

          <aside class="a-editor-side">
            <div class="a-card">
              <p class="a-card-label">Så här syns det på hemsidan</p>
              <div class="a-pv-bar" data-pv-text></div>
              <div class="a-pv-total" data-pv-total>
                <small>Insamlat hittills</small>
                <strong data-pv-sum></strong>
                <small data-pv-sub></small>
              </div>
            </div>
            <button type="button" class="btn btn-dark btn-block" data-save>Spara ändringar</button>
            <button type="button" class="btn btn-outline btn-block a-btn-white" data-cancel>Avbryt</button>
          </aside>
        </div>
      </section>`;

    const f = (n) => $(`[name=${n}]`, main);
    const parseKr = (s) => Number(String(s).replace(/[^\d]/g, "")) || 0;

    const fill = () => {
      f("text").value = c.text;
      f("total").value = c.total.toLocaleString("sv-SE");
      f("period").value = c.period;
      f("showTotal").checked = c.showTotal;
      renderOrgs();
      renderGifts();
      preview();
    };

    const renderOrgs = () => {
      $("[data-orgs]", main).innerHTML =
        c.orgs.map((o) => `<label class="opt"><input type="radio" name="org" value="${esc(o)}" ${o === c.current ? "checked" : ""} /><span>${esc(o)}</span></label>`).join("") +
        `<button type="button" class="a-opt-add" data-org-new>+ Annan organisation</button>`;
    };

    const renderGifts = () => {
      const gifts = c.gifts.slice().sort((a, b) => b.date.localeCompare(a.date));
      $("[data-gifts]", main).innerHTML = gifts.length
        ? gifts.map((g) => `
            <div class="a-gift">
              <span class="a-gift-date">${fmtDate(g.date, true)}</span>
              <span class="a-gift-org">${esc(g.org)}</span>
              <strong>${kr(g.amount)}</strong>
              ${g.receipt ? '<span class="pill">Kvitto ✓</span>' : '<span class="pill pill--hidden">Inget kvitto</span>'}
              <button type="button" class="a-link" data-gift-edit="${g.id}">Ändra</button>
            </div>`).join("")
        : `<p class="a-hint">Inga gåvor än.</p>`;
    };

    const preview = () => {
      $("[data-pv-text]", main).textContent = c.text || "–";
      $("[data-pv-total]", main).hidden = !c.showTotal;
      $("[data-pv-sum]", main).textContent = kr(c.total);
      const shortPeriod = c.period.replace(/(\w{3})\w*$/u, "$1");
      $("[data-pv-sub]", main).textContent = `till ${c.current}${c.period ? " · " + shortPeriod : ""}`;
    };

    const markDirty = () => { dirty = true; preview(); };

    main.addEventListener("input", (e) => {
      const n = e.target.name;
      if (n === "text") c.text = e.target.value;
      if (n === "total") c.total = parseKr(e.target.value);
      if (n === "period") c.period = e.target.value;
      if (["text", "total", "period"].includes(n)) markDirty();
    });
    main.addEventListener("change", (e) => {
      if (e.target.name === "showTotal") { c.showTotal = e.target.checked; markDirty(); }
      if (e.target.name === "org") {
        // Byt organisationen i texten om den nämns där
        if (c.text.includes(c.current)) { c.text = c.text.replace(c.current, e.target.value); f("text").value = c.text; }
        c.current = e.target.value;
        markDirty();
      }
    });
    f("total").addEventListener("blur", () => (f("total").value = c.total.toLocaleString("sv-SE")));

    // Ny organisation
    const addRow = $("[data-org-add]", main);
    main.addEventListener("click", (e) => {
      if (e.target.closest("[data-org-new]")) { addRow.hidden = false; $("input", addRow).focus(); }
    });
    const addOrg = () => {
      const name = $("input", addRow).value.trim();
      if (!name) return;
      if (!c.orgs.includes(name)) c.orgs.push(name);
      c.current = name;
      $("input", addRow).value = "";
      addRow.hidden = true;
      renderOrgs();
      markDirty();
    };
    $("[data-org-save]", main).addEventListener("click", addOrg);
    $("input", addRow).addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); addOrg(); } });
    $("[data-org-cancel]", main).addEventListener("click", () => (addRow.hidden = true));

    // Gåvor (modal)
    const modal = document.getElementById("gift-modal");
    const gform = document.getElementById("gift-form");
    let editing = null;

    const openGift = (g) => {
      editing = g?.id || null;
      gform.reset();
      gform.classList.remove("was-validated");
      gform.org.innerHTML = c.orgs.map((o) => `<option>${esc(o)}</option>`).join("");
      gform.date.value = g?.date || new Date().toISOString().slice(0, 10);
      gform.amount.value = g?.amount || "";
      gform.org.value = g?.org || c.current;
      gform.receipt.checked = g ? g.receipt : false;
      $("[data-gift-title]", modal).textContent = g ? "Ändra gåva" : "Lägg till gåva";
      $("[data-gift-delete]", modal).hidden = !g;
      modal.showModal();
    };

    $("[data-gift-add]", main).addEventListener("click", () => openGift(null));
    $("[data-gifts]", main).addEventListener("click", (e) => {
      const b = e.target.closest("[data-gift-edit]");
      if (b) openGift(c.gifts.find((g) => g.id === b.dataset.giftEdit));
    });

    gform.onsubmit = (e) => {
      e.preventDefault();
      if (!gform.checkValidity()) { gform.classList.add("was-validated"); return; }
      const data = { date: gform.date.value, amount: Number(gform.amount.value), org: gform.org.value, receipt: gform.receipt.checked };
      if (editing) Object.assign(c.gifts.find((g) => g.id === editing), data);
      else { c.gifts.push({ id: Store.uid("g"), ...data }); c.total += data.amount; f("total").value = c.total.toLocaleString("sv-SE"); }
      modal.close();
      renderGifts();
      markDirty();
      toast(editing ? "Gåvan är ändrad – glöm inte att spara" : "Gåvan är tillagd och summan uppdaterad – glöm inte att spara");
    };
    $("[data-gift-delete]", modal).onclick = async () => {
      modal.close();
      const ok = await confirm({ title: "Ta bort gåvan?", text: "Den försvinner från listan på hemsidan. Summan ändras inte automatiskt." });
      if (!ok) return;
      c.gifts = c.gifts.filter((g) => g.id !== editing);
      renderGifts();
      markDirty();
    };

    // Spara / Avbryt
    $("[data-save]", main).addEventListener("click", () => {
      if (!c.text.trim()) { f("text").focus(); toast("Texten på hemsidan får inte vara tom"); return; }
      Store.saveCharity(c);
      dirty = false;
      toast("Ändringarna är sparade");
    });
    $("[data-cancel]", main).addEventListener("click", async () => {
      if (dirty) {
        const ok = await confirm({ title: "Ångra ändringarna?", text: "Allt du ändrat sedan du senast sparade försvinner.", ok: "Ångra ändringar" });
        if (!ok) return;
      }
      c = Store.charity();
      dirty = false;
      fill();
    });

    fill();
  }

  Admin.views.valgorenhet = { render };
})();
