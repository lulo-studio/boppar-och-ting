// ==========================================================
// Vy: Lägg till / ändra produkt   #produkter/ny  ·  #produkter/<id>
// ==========================================================

(function () {
  const { $, $$, esc, kr, PH, toast, confirm, readImage } = Admin;
  const MAX_IMAGES = 6;

  function render(main, param) {
    const isNew = param === "ny";
    const existing = isNew ? null : Store.product(param);

    if (!isNew && !existing) {
      main.innerHTML = `<section class="admin-view"><p class="admin-crumb"><a href="#produkter">Produkter</a> / Hittades inte</p>
        <h1 class="admin-title">Produkten finns inte</h1><a href="#produkter" class="btn btn-dark">Till produkterna</a></section>`;
      return;
    }

    const p = existing
      ? structuredClone(existing)
      : { name: "", category: "lampa", price: "", size: "", desc: "", status: "tillganglig", hidden: false, images: [] };
    p.images = p.images || [];

    main.innerHTML = `
      <section class="admin-view">
        <p class="admin-crumb"><a href="#produkter">Produkter</a> / ${isNew ? "Ny produkt" : esc(p.name)}</p>
        <h1 class="admin-title">${isNew ? "Lägg till produkt" : "Ändra produkt"}</h1>

        <form class="a-editor" novalidate>
          <div class="a-card a-editor-main">
            <div class="field">
              <span>Bilder</span>
              <div class="a-images" data-images></div>
              <p class="a-hint">Tips: ta bilderna i dagsljus. Den första blir huvudbild – dra för att ändra ordning.</p>
            </div>

            <label class="field"><span>Namn</span>
              <input type="text" name="name" value="${esc(p.name)}" placeholder="t.ex. Mintkupolen" required /></label>

            <fieldset class="field">
              <legend>Kategori</legend>
              <div class="opts">
                <label class="opt"><input type="radio" name="category" value="lampa" ${p.category === "lampa" ? "checked" : ""} /><span>Lampa</span></label>
                <label class="opt"><input type="radio" name="category" value="vas" ${p.category === "vas" ? "checked" : ""} /><span>(.)(.) Vas</span></label>
              </div>
            </fieldset>

            <div class="field-row">
              <label class="field"><span>Pris (kr)</span>
                <input type="number" name="price" min="0" step="5" value="${esc(p.price)}" placeholder="650" required /></label>
              <label class="field"><span>Höjd (cm)</span>
                <input type="number" name="size" min="0" value="${esc(p.size ?? "")}" placeholder="24" /></label>
            </div>

            <label class="field"><span>Beskrivning</span>
              <textarea name="desc" rows="3" placeholder="Var kommer glaset ifrån, hur är den målad …">${esc(p.desc || "")}</textarea></label>

            <fieldset class="field">
              <legend>Status</legend>
              <div class="opts">
                <label class="opt"><input type="radio" name="status" value="tillganglig" ${p.status === "tillganglig" ? "checked" : ""} /><span>Tillgänglig</span></label>
                <label class="opt"><input type="radio" name="status" value="bokad" ${p.status === "bokad" ? "checked" : ""} /><span>Bokad</span></label>
                <label class="opt"><input type="radio" name="status" value="sald" ${p.status === "sald" ? "checked" : ""} /><span>Såld</span></label>
              </div>
            </fieldset>
          </div>

          <aside class="a-editor-side">
            <div class="a-card">
              <p class="a-card-label">Så här syns den på hemsidan</p>
              <div class="a-preview-card">
                <div class="a-preview-media" data-pv-media></div>
                <div class="a-preview-body">
                  <strong data-pv-name></strong>
                  <span data-pv-price></span>
                </div>
              </div>
            </div>

            <div class="a-card a-toggle-card">
              <div>
                <strong>Visa på hemsidan</strong>
                <small>Stäng av för att spara utan att visa den</small>
              </div>
              <label class="a-switch">
                <input type="checkbox" name="visible" ${p.hidden ? "" : "checked"} aria-label="Visa på hemsidan" />
                <span></span>
              </label>
            </div>

            <button type="submit" class="btn btn-dark btn-block" data-publish>Publicera</button>
            <button type="button" class="btn btn-outline btn-block a-btn-white" data-draft>Spara som utkast</button>
            ${isNew ? "" : '<button type="button" class="a-link a-link--danger a-delete-product" data-delete>Ta bort produkten</button>'}
          </aside>
        </form>
      </section>`;

    const form = $("form", main);
    const imgWrap = $("[data-images]", main);

    // ---------- Förhandsvisning ----------
    const preview = () => {
      $("[data-pv-media]", main).innerHTML = p.images[0] ? `<img src="${p.images[0]}" alt="" />` : `${PH}<span>Produktbild</span>`;
      $("[data-pv-name]", main).textContent = form.name.value || "Produktnamn";
      $("[data-pv-price]", main).textContent = form.price.value ? kr(form.price.value) : "– kr";
    };
    form.addEventListener("input", preview);

    // ---------- Bilder ----------
    let dragFrom = null;
    const renderImages = () => {
      const slots = p.images.map((src, i) => `
        <div class="a-img${i === 0 ? " is-main" : ""}" draggable="true" data-i="${i}">
          ${i === 0 ? '<span class="a-img-tag">Huvudbild</span>' : ""}
          <img src="${src}" alt="Bild ${i + 1}" />
          <button type="button" class="a-img-remove" data-remove="${i}" aria-label="Ta bort bild ${i + 1}">×</button>
        </div>`);
      // Tomma platshållare så det ser ut som designen när det finns få bilder
      const empties = Math.max(0, 3 - p.images.length);
      for (let i = 0; i < empties; i++) {
        slots.push(`<div class="a-img a-img--empty${p.images.length === 0 && i === 0 ? " is-main" : ""}">
          ${p.images.length === 0 && i === 0 ? '<span class="a-img-tag">Huvudbild</span>' : ""}${PH}<span>Produktbild</span></div>`);
      }
      if (p.images.length < MAX_IMAGES) {
        slots.push(`<label class="a-img a-img--add">
          <input type="file" accept="image/jpeg,image/png,image/webp" multiple />
          <span class="a-plus">+</span><span>Lägg till</span></label>`);
      }
      imgWrap.innerHTML = slots.join("");
      preview();
    };

    imgWrap.addEventListener("change", async (e) => {
      if (e.target.type !== "file") return;
      const files = [...e.target.files].slice(0, MAX_IMAGES - p.images.length);
      for (const f of files) {
        try { p.images.push(await readImage(f)); } catch (_) { toast("Kunde inte läsa bilden"); }
      }
      renderImages();
    });
    imgWrap.addEventListener("click", (e) => {
      const r = e.target.closest("[data-remove]");
      if (r) { p.images.splice(+r.dataset.remove, 1); renderImages(); }
    });
    imgWrap.addEventListener("dragstart", (e) => {
      const el = e.target.closest(".a-img[data-i]");
      if (!el) return;
      dragFrom = +el.dataset.i;
      el.classList.add("is-dragging");
      e.dataTransfer.effectAllowed = "move";
    });
    imgWrap.addEventListener("dragover", (e) => {
      if (dragFrom === null) return;
      e.preventDefault();
      $$(".a-img", imgWrap).forEach((x) => x.classList.toggle("is-over", x === e.target.closest(".a-img[data-i]")));
    });
    imgWrap.addEventListener("drop", (e) => {
      e.preventDefault();
      const el = e.target.closest(".a-img[data-i]");
      if (el && dragFrom !== null) {
        const [moved] = p.images.splice(dragFrom, 1);
        p.images.splice(+el.dataset.i, 0, moved);
      }
      dragFrom = null;
      renderImages();
    });
    imgWrap.addEventListener("dragend", () => { dragFrom = null; renderImages(); });

    // ---------- Spara ----------
    const collect = () => ({
      name: form.name.value.trim(),
      category: form.category.value,
      price: Number(form.price.value),
      size: Number(form.size.value) || null,
      desc: form.desc.value.trim(),
      status: form.status.value,
      images: p.images,
    });

    const save = (hidden) => {
      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        form.querySelector(":invalid")?.focus();
        return;
      }
      const id = Store.saveProduct(existing?.id, { ...collect(), hidden });
      if (!id) { toast("Bilderna är för stora för demoläget – prova färre bilder"); return; }
      toast(hidden ? `${form.name.value} är sparad som utkast` : `${form.name.value} är publicerad`);
      location.hash = "#produkter";
    };

    form.addEventListener("submit", (e) => { e.preventDefault(); save(!form.visible.checked); });
    $("[data-draft]", main).addEventListener("click", () => save(true));
    $("[data-delete]", main)?.addEventListener("click", async () => {
      const ok = await confirm({ title: `Ta bort ${existing.name}?`, text: "Produkten försvinner från hemsidan och går inte att få tillbaka." });
      if (!ok) return;
      Store.removeProduct(existing.id);
      toast(`${existing.name} är borttagen`);
      location.hash = "#produkter";
    });

    renderImages();
  }

  Admin.views.produktedit = { render };
})();
