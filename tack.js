// ==========================================================
// Tack-sidan – läser vad som skickades (sparat av forms.js)
// ==========================================================

(function () {
  const root = document.getElementById("tack");
  if (!root) return;

  let d = {};
  try { d = JSON.parse(sessionStorage.getItem("bt-last")) || {}; } catch (_) {}

  const $ = (sel) => root.querySelector(sel);
  const name = d.name ? ` ${d.name}` : "";
  const mail = d.email ? ` till <strong>${d.email}</strong>` : "";
  const kr = (n) => n.toLocaleString("sv-SE") + " kr";

  if (d.type === "booking") {
    const p = PRODUCTS.find((x) => x.id === d.product);
    const pick = PICKUP[d.pickup] || Object.values(PICKUP)[0];
    const isLamp = !p || p.category === "lampa";

    $("[data-title]").innerHTML = `Tack${name} –<br />${isLamp ? "lampan" : "vasen"} är din!`;
    $("[data-text]").innerHTML = `${p ? p.name : "Produkten"} är nu bokad i ditt namn. Vi har skickat en bekräftelse med alla detaljer${mail}.`;
    $("[data-more]").textContent = isLamp ? "Se fler lampor" : "Se fler vaser";
    $("[data-more]").href = isLamp ? "lampor.html" : "vaser.html";

    if (p) {
      $("[data-summary]").hidden = false;
      $("[data-s-name]").textContent = p.name;
      $("[data-s-price]").textContent = kr(p.price);
      if (p.image) $("[data-s-thumb]").innerHTML = `<img src="${p.image}" alt="" />`;
      $("[data-s-place]").textContent = pick.place;
      $("[data-s-when]").textContent = pick.when;
    }
  } else if (d.type === "special") {
    $("[data-title]").innerHTML = `Tack${name} –<br />vi hörs snart!`;
    $("[data-text]").innerHTML = `Din förfrågan är skickad. Du får en bekräftelse${mail}, och Anne hör av sig med förslag och pris.`;
  }
  // Annars: standardtexten i HTML:en står kvar.
})();
