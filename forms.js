// ==========================================================
// Formulär: bilduppladdning (dra & släpp), validering, skicka.
// Gäller alla <form data-form="special|booking">.
// ==========================================================

(function () {
  // ---------- Dra & släpp ----------
  document.querySelectorAll("[data-dropzone]").forEach((zone) => {
    const input = zone.querySelector('input[type="file"]');
    const label = zone.querySelector("[data-dropzone-label]");
    const original = label.innerHTML;

    const show = () => {
      const f = input.files[0];
      if (!f) { label.innerHTML = original; zone.classList.remove("has-file"); return; }
      label.innerHTML = `<strong>${f.name}</strong><span>${Math.round(f.size / 1024)} kB · klicka för att byta</span>`;
      zone.classList.add("has-file");
    };

    input.addEventListener("change", show);
    ["dragenter", "dragover"].forEach((ev) =>
      zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.add("is-drag"); })
    );
    ["dragleave", "drop"].forEach((ev) =>
      zone.addEventListener(ev, (e) => { e.preventDefault(); zone.classList.remove("is-drag"); })
    );
    zone.addEventListener("drop", (e) => {
      const file = e.dataTransfer.files[0];
      if (!file || !/^image\/(jpeg|png)$/.test(file.type)) return;
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      show();
    });
  });

  // ---------- Skicka ----------
  document.querySelectorAll("form[data-form]").forEach((form) => {
    const btn = form.querySelector('button[type="submit"]');
    const errorBox = form.querySelector("[data-form-error]");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorBox.hidden = true;

      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        form.querySelector(":invalid")?.focus();
        return;
      }

      const data = new FormData(form);
      const btnText = btn.textContent;
      btn.disabled = true;
      btn.textContent = "Skickar …";

      try {
        if (FORM_ENDPOINT) {
          const res = await fetch(FORM_ENDPOINT, {
            method: "POST",
            body: data,
            headers: { Accept: "application/json" },
          });
          if (!res.ok) throw new Error("HTTP " + res.status);
        }

        // Spara det tack-sidan behöver (inget i URL:en)
        const summary = {
          type: form.dataset.form,
          name: (data.get("namn") || "").toString().trim().split(" ")[0],
          email: data.get("epost"),
          product: data.get("produkt"),
          pickup: data.get("hamtning"),
        };
        try { sessionStorage.setItem("bt-last", JSON.stringify(summary)); } catch (_) {}

        window.location.href = "tack.html";
      } catch (err) {
        errorBox.hidden = false;
        btn.disabled = false;
        btn.textContent = btnText;
      }
    });
  });
})();
