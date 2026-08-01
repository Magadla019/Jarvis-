// ============================================
// JARVIS STARTUP BOOT SEQUENCE
// Runs once per calendar day. Injects its own DOM
// into <body> and removes itself when done — never
// touches index.html, app.js, or any existing element.
// ============================================

(function () {
  const STORAGE_KEY = "jarvis_last_boot_date";

  function todayKey() {
    const d = new Date();
    return d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
  }

  function alreadyBootedToday() {
    try {
      return localStorage.getItem(STORAGE_KEY) === todayKey();
    } catch (_) {
      return false; // if storage is unavailable, just show it — non-fatal either way
    }
  }

  function markBootedToday() {
    try { localStorage.setItem(STORAGE_KEY, todayKey()); } catch (_) {}
  }

  if (alreadyBootedToday()) return; // skip entirely — no overlay, no delay, nothing built

  const BOOT_LINES = [
    "INITIALIZING JARVIS OPERATING SYSTEM",
    "LOADING CORE MODULES",
    "VOICE ENGINE .................. <span class=\"ok\">ONLINE</span>",
    "MEMORY ENGINE ................. <span class=\"ok\">ONLINE</span>",
    "SECURITY LAYER ................ <span class=\"ok\">ONLINE</span>",
    "ALL SYSTEMS OPERATIONAL",
  ];

  function buildOverlay() {
    const overlay = document.createElement("div");
    overlay.id = "startupOverlay";
    overlay.innerHTML = `
      <div class="boot-rings">
        <div class="boot-flash" id="bootFlash"></div>
        <div class="boot-ring r3"></div>
        <div class="boot-ring r2"></div>
        <div class="boot-ring r1"></div>
        <div class="boot-sweep"></div>
        <div class="boot-core"></div>
      </div>
      <div class="boot-log" id="bootLog"></div>
      <div class="boot-skip" id="bootSkip">Tap to skip</div>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  function runBootSequence() {
    const overlay = buildOverlay();
    const logEl = document.getElementById("bootLog");
    const flashEl = document.getElementById("bootFlash");
    const skipEl = document.getElementById("bootSkip");

    let finished = false;
    const timers = [];

    function finish() {
      if (finished) return;
      finished = true;
      timers.forEach(clearTimeout);
      markBootedToday();
      overlay.classList.add("fade-out");
      setTimeout(() => overlay.remove(), 650);
    }

    skipEl.addEventListener("click", finish);

    // Stagger the boot log lines in, then flash + finish.
    BOOT_LINES.forEach((line, i) => {
      const t = setTimeout(() => {
        const lineEl = document.createElement("span");
        lineEl.className = "boot-log-line show";
        lineEl.innerHTML = line;
        logEl.appendChild(lineEl);
      }, 500 + i * 420);
      timers.push(t);
    });

    const flashDelay = 500 + BOOT_LINES.length * 420 + 300;
    timers.push(setTimeout(() => {
      flashEl.classList.add("flash-active");
    }, flashDelay));

    timers.push(setTimeout(finish, flashDelay + 550));

    // Safety net: never block the app for more than ~9s even if something stalls.
    timers.push(setTimeout(finish, 9000));
  }

  if (document.body) {
    runBootSequence();
  } else {
    document.addEventListener("DOMContentLoaded", runBootSequence);
  }
})();
