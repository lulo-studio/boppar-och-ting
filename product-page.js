// ==========================================================
// Produktsida – produkt.html?id=hallonsvampen
// ==========================================================

(function () {
  const root = document.getElementById("product-page");
  if (!root) return;

  const id = new URLSearchParams(location.search).get("id");
  const p = PRODUCTS.find((x) => x.id === id);

  const PH =
    '<svg class="ph-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 17-5-5-8 8"/></svg>';
  const kr = (n) => n.toLocaleString("sv-SE") + " kr";

  if (!p) {
    root.innerHTML = `
      <div class="container not-found">
        <h1 class="page-title">Produkten hittades inte</h1>
        <p class="lead">Den kanske har bytt namn eller tagits bort.</p>
        <a href="produkter.html" class="btn btn-dark">Se alla produkter</a>
      </div>`;
    return;
  }

  const isLamp = p.category === "lampa";
  const noun = isLamp ? "lampan" : "vasen";
  const listPage = isLamp ? "lampor.html" : "vaser.html";
  document.title = `${p.name} – Boppar & ting`;

  const desc =
    p.desc ||
    (isLamp
      ? "Återbrukat glas från loppis, handmålat och med sladdlös ljusslinga. Ställ den på byrån, i fönstret eller på middagsbordet."
      : "En rund och glad vas i lera, formad och målad för hand. En del av priset går till Bröstcancerförbundet.");

  const features = [
    `Höjd ca ${p.size} cm`,
    ...(isLamp
      ? ["Sladdlös ljusslinga", "Återbrukat glas, handmålad fot"]
      : ["Formad för hand i lera", "En del går till Bröstcancerförbundet"]),
    "Unikt exemplar – finns bara en",
  ];

  // Galleri: riktiga bilder om de finns, annars 4 platshållare
  const imgs = p.images && p.images.length ? p.images : p.image ? [p.image] : [null, null, null, null];
  const media = (src) => (src ? `<img src="${src}" alt="${p.name}" />` : `${PH}<span>Produktbild</span>`);

  const pickupOptions = Object.entries(PICKUP)
    .map(
      ([key, o], i) => `
        <label class="choice">
          <input type="radio" name="hamtning" value="${key}" ${i === 0 ? "checked" : ""} required />
          <span class="choice-body"><strong>${o.label}</strong><small>${o.hint}</small></span>
        </label>`
    )
    .join("");

  const bookingCard = p.sold
    ? `
      <div class="form-card sold-card">
        <h2>${p.name} är såld</h2>
        <p class="muted">Varje exemplar finns bara en gång – men Anne gör gärna något liknande åt dig.</p>
        <a href="specialbestallning.html" class="btn btn-dark btn-block">Beställ något liknande</a>
      </div>`
    : `
      <form class="form-card" data-form="booking" novalidate>
        <h2>Boka ${noun}</h2>
        <p class="muted small">Fyll i dina uppgifter så reserveras ${noun} direkt i ditt namn.</p>
        <input type="hidden" name="produkt" value="${p.id}" />
        <input type="hidden" name="_subject" value="Ny bokning: ${p.name}" />

        <div class="field-row">
          <label class="field"><span>Namn</span>
            <input type="text" name="namn" autocomplete="name" placeholder="Sara Lindqvist" required /></label>
          <label class="field"><span>Telefon</span>
            <input type="tel" name="telefon" autocomplete="tel" placeholder="070-123 45 67" required /></label>
        </div>
        <label class="field"><span>E-post</span>
          <input type="email" name="epost" autocomplete="email" placeholder="sara@exempel.se" required /></label>

        <fieldset class="field">
          <legend>Var vill du hämta?</legend>
          <div class="choice-row">${pickupOptions}</div>
        </fieldset>

        <label class="field"><span>Meddelande (valfritt)</span>
          <textarea name="meddelande" rows="3" placeholder="Något Anne behöver veta?"></textarea></label>

        <label class="check">
          <input type="checkbox" name="godkannande" required />
          <span>Jag godkänner att mina uppgifter sparas för bokningen.</span>
        </label>

        <p class="form-error" data-form-error hidden>Något gick fel – försök igen eller mejla <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a>.</p>
        <button type="submit" class="btn btn-dark btn-block">Boka ${p.name}</button>
        <p class="form-note">Ingen betalning nu – du Swishar när du hämtar</p>
      </form>`;

  const related = PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id)
    .sort((a, b) => Number(a.sold) - Number(b.sold) || b.added.localeCompare(a.added))
    .slice(0, 4);

  const relatedCard = (r) => `
    <a class="product product--link${r.sold ? " is-sold" : ""}" href="produkt.html?id=${r.id}">
      <div class="product-media placeholder">
        ${r.sold ? '<span class="badge badge--sold">Såld</span>' : '<span class="badge"><i class="dot"></i>Tillgänglig</span>'}
        ${r.image ? `<img src="${r.image}" alt="${r.name}" loading="lazy" />` : PH + "<span>Produktbild</span>"}
      </div>
      <div class="product-body">
        <h3>${r.name}</h3>
        <span class="price">${kr(r.price)}</span>
      </div>
    </a>`;

  root.innerHTML = `
    <div class="container">
      <p class="breadcrumb"><a href="${listPage}">${isLamp ? "Lampor" : "(.)(.) Vaser"}</a><span>/</span>${p.name}</p>

      <div class="pdp">
        <div class="gallery">
          <div class="gallery-main placeholder" data-main>${media(imgs[0])}</div>
          <div class="gallery-thumbs">
            ${imgs
              .map(
                (src, i) => `
              <button type="button" class="gallery-thumb placeholder${i === 0 ? " is-active" : ""}" data-i="${i}" aria-label="Visa bild ${i + 1}">
                ${media(src)}
              </button>`
              )
              .join("")}
          </div>
        </div>

        <div class="pdp-info">
          ${p.sold ? '<span class="badge badge--sold badge--static">Såld</span>' : '<span class="badge badge--static badge--soft"><i class="dot"></i>Tillgänglig</span>'}
          <h1 class="pdp-title">${p.name}</h1>
          <p class="pdp-price">${kr(p.price)}</p>
          <p class="pdp-desc">${desc}</p>
          <ul class="pdp-features">${features.map((f) => `<li>${f}</li>`).join("")}</ul>

          ${p.sold ? "" : `
          <ol class="mini-steps">
            <li><span>1</span>Boka här på sidan</li>
            <li><span>2</span>Du får ett mejl med alla detaljer</li>
            <li><span>3</span>Hämta och Swisha på plats</li>
          </ol>`}

          ${bookingCard}
        </div>
      </div>
    </div>

    ${related.length ? `
    <section class="section section--sand related">
      <div class="container">
        <h2 class="section-title">Fler ${isLamp ? "lampor" : "vaser"} du kanske gillar</h2>
        <div class="product-grid">${related.map(relatedCard).join("")}</div>
      </div>
    </section>` : ""}
  `;

  // Galleri-byte
  const main = root.querySelector("[data-main]");
  root.querySelectorAll(".gallery-thumb").forEach((t) =>
    t.addEventListener("click", () => {
      root.querySelectorAll(".gallery-thumb").forEach((x) => x.classList.toggle("is-active", x === t));
      main.innerHTML = media(imgs[Number(t.dataset.i)]);
    })
  );
})();
