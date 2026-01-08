(function () {

  const DEV = location.hostname === "hunters.local" || location.hostname === "localhost";

  // --- GLOBAL ERROR HANDLING ---
  let fatalErrorShown = false;

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function showErrorPopup(title, details) {
    // Try to use your game's popup system if it exists:
    // Adjust these two lines if your popup API has a different name.
    try {
      if (window.UI && typeof window.UI.showPopup === "function") {
        window.UI.showPopup(title, details); // <-- change if needed
        return;
      }
      if (window.mainUI && typeof window.mainUI.showPopup === "function") {
        window.mainUI.showPopup(title, details);
        return;
      }
    } catch (_) {}

    // Fallback: inject a simple modal so you always see the error
    const existing = document.getElementById("fatal-error-overlay");
    if (existing) return;

    const overlay = document.createElement("div");
    overlay.id = "fatal-error-overlay";
    overlay.style.position = "fixed";
    overlay.style.inset = "0";
    overlay.style.background = "rgba(0,0,0,0.75)";
    overlay.style.zIndex = "99999";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.padding = "20px";

    const box = document.createElement("div");
    box.style.maxWidth = "900px";
    box.style.width = "100%";
    box.style.background = "#1e1e1e";
    box.style.border = "1px solid #444";
    box.style.borderRadius = "10px";
    box.style.color = "#eee";
    box.style.padding = "16px";

    box.innerHTML = `
      <div style="font-weight:bold; font-size:16px; margin-bottom:10px;">${escapeHtml(title)}</div>
      <pre style="white-space:pre-wrap; font-size:12px; line-height:1.35; margin:0; color:#ddd;">${escapeHtml(details)}</pre>
      <div style="display:flex; gap:10px; justify-content:flex-end; margin-top:12px;">
        <button id="fatal-reload" style="padding:8px 12px; border-radius:8px; border:0; background:#555; color:#fff; cursor:pointer;">Reload</button>
        <button id="fatal-close" style="padding:8px 12px; border-radius:8px; border:0; background:#333; color:#fff; cursor:pointer;">Close</button>
      </div>
    `;

    overlay.appendChild(box);
    document.body.appendChild(overlay);

    document.getElementById("fatal-reload").onclick = () => location.reload();
    document.getElementById("fatal-close").onclick = () => overlay.remove();
  }

  function showFatalError(errObj) {
    if (fatalErrorShown) return;
    fatalErrorShown = true;

    console.error("FATAL ERROR:", errObj);

    // If you have a pause flag, set it here:
    try {
      if (window.main && window.main.windowPause !== undefined) {
        window.main.windowPause = true;
      }
    } catch (_) {}

    const title = errObj.type || "Critical Error";

    const details =
      `${errObj.message || "Unknown error"}\n\n` +
      (errObj.source ? `Source: ${errObj.source}:${errObj.lineno ?? "?"}:${errObj.colno ?? "?"}\n\n` : "") +
      (errObj.stack ? `Stack:\n${errObj.stack}\n` : "");

    showErrorPopup(title, details);
  }

  window.addEventListener("error", (event) => {
    // event.error may be undefined for some resource/script errors
    showFatalError({
      type: "JS Error",
      message: event.message || "Unknown error",
      source: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      stack: event.error?.stack
    });
  });

  window.addEventListener("unhandledrejection", event => {

  // ---- DEV IGNORE RULES ----
  if (DEV) {
    const msg = event.reason?.message || String(event.reason);

    // Ignore JSON parse errors caused by 404 / HTML responses
    if (
      msg.includes("JSON.parse") ||
      msg.includes("unexpected character") ||
      msg.includes("Unexpected token <")
    ) {
      console.warn("Ignored dev promise error:", msg);
      event.preventDefault();
      return;
    }
  }

  // ---- REAL ERRORS ----
  showFatalError({
    type: "Unhandled Promise Rejection",
    message: event.reason?.message || String(event.reason),
    stack: event.reason?.stack
  });
});


  // --- NORMAL GAME BOOT ---
  try {
    const main = new Main({
      element: document.querySelector(".game-container")
    });

    // Expose for pausing / debugging if you want
    window.main = main;

    main.init();
  } catch (e) {
    showFatalError({
      type: "Boot Crash",
      message: e?.message || String(e),
      stack: e?.stack
    });
  }

})();
