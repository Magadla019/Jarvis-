// ============================================
// JARVIS SYSTEM v6.2 — Core Logic (Redesigned)
// ============================================

const GEMINI_MODEL = "gemini-2.0-flash";
const SYSTEM_INSTRUCTION = "You are Jarvis, a professional, calm, confident, " +
  "friendly, intelligent AI assistant. Keep spoken replies concise (1-3 sentences) " +
  "since they will be read aloud. Always tell the truth and never pretend " +
  "something is complete if it isn't.";

// Debug helper
function log(msg) {
  console.log("[JARVIS]", msg);
  const debugEl = document.getElementById("debugLine");
  if (debugEl) debugEl.textContent = msg;
  const setupDebug = document.getElementById("setupDebug");
  if (setupDebug) setupDebug.textContent = msg;
}

// Safe element getter
function $(id) {
  const el = document.getElementById(id);
  if (!el) console.warn("[JARVIS] Missing element:", id);
  return el;
}

const els = {};
let geminiKey = "";
let elevenKey = "";
let elevenVoiceId = "";
let history = [];
let startTime = Date.now();
let micStream = null;
let mediaRecorder = null;
let audioChunks = [];
let recorderReady = false;
let wakeRec = null;
let commandRec = null;
let isListeningForCommand = false;
let wakeActive = false;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const WAKE_PATTERNS = [/\bhi jarvis\b/i, /\bhey jarvis\b/i, /\bjarvis\b/i, /\bhello jarvis\b/i];
const TIME_PATTERNS = [/\bwhat'?s? the time\b/i, /\bwhat time is it\b/i, /\bcurrent time\b/i, /\btell me the time\b/i];

function sanitizeKey(raw) {
  return (raw || "").replace(/[^\x20-\x7E]/g, "").trim();
}

function showError(msg) {
  const box = $("errorBox");
  if (box) {
    box.textContent = msg;
    box.classList.remove("hidden");
  }
  log("ERROR: " + msg);
}

function hideError() {
  const box = $("errorBox");
  if (box) box.classList.add("hidden");
}

function setState(state) {
  const dash = $("dashboard");
  if (dash) {
    dash.classList.remove("idle", "listening", "thinking", "speaking", "offline");
    dash.classList.add(state);
  }

  const labelMap = {
    idle: "STANDBY MODE",
    listening: "LISTENING...",
    thinking: "PROCESSING...",
    speaking: "RESPONDING...",
    offline: "OFFLINE"
  };
  const label = $("stateLabel");
  if (label) label.textContent = labelMap[state] || state.toUpperCase();

  const aiDot = $("aiIndicator");
  const aiText = $("aiStatusText");
  if (state === "offline") {
    if (aiDot) aiDot.className = "ai-dot offline";
    if (aiText) aiText.textContent = "Offline";
  } else if (state === "thinking") {
    if (aiDot) aiDot.className = "ai-dot processing";
    if (aiText) aiText.textContent = "Processing";
  } else if (state === "listening") {
    if (aiDot) aiDot.className = "ai-dot processing";
    if (aiText) aiText.textContent = "Listening";
  } else if (state === "speaking") {
    if (aiDot) aiDot.className = "ai-dot";
    if (aiText) aiText.textContent = "Speaking";
  } else {
    if (aiDot) aiDot.className = "ai-dot";
    if (aiText) aiText.textContent = "Online";
  }

  const fill = $("modeBarFill");
  if (fill) {
    const widths = { idle: "5%", listening: "35%", thinking: "75%", speaking: "100%", offline: "10%" };
    fill.style.width = widths[state] || "5%";
  }
}

// ---------- Live Data ----------
function updateMetrics() {
  const cpu = $("cpuBar");
  const mem = $("memBar");
  if (cpu) cpu.style.width = (18 + Math.random() * 22) + "%";
  if (mem) mem.style.width = (32 + Math.random() * 28) + "%";

  const now = new Date();
  const days = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  const timeEl = $("headerTime");
  const dateEl = $("headerDate");
  if (timeEl) timeEl.textContent = now.toLocaleTimeString("en-US", {hour12:false, hour:"2-digit", minute:"2-digit"});
  if (dateEl) dateEl.textContent = days[now.getDay()] + ", " + months[now.getMonth()] + " " + now.getDate() + " " + now.getFullYear();

  const sig = $("signalVal");
  const up = $("uptimeVal");
  const pkt = $("packetsVal");
  const thr = $("throughputVal");
  const lat = $("latencyVal");
  const buf = $("bufferVal");
  const cen = $("centerNum");

  if (sig) sig.textContent = (95 + Math.floor(Math.random() * 5)) + "%";
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const h = String(Math.floor(uptime / 3600)).padStart(2,"0");
  const m = String(Math.floor((uptime % 3600) / 60)).padStart(2,"0");
  const s = String(uptime % 60).padStart(2,"0");
  if (up) up.textContent = h + ":" + m + ":" + s;
  if (pkt) pkt.textContent = (0.8 + Math.random() * 0.8).toFixed(1) + "K/s";
  if (thr) thr.textContent = (94 + Math.floor(Math.random() * 6)) + "%";
  if (lat) lat.textContent = (8 + Math.floor(Math.random() * 12)) + "ms";
  if (buf) buf.textContent = (0.2 + Math.random() * 0.4).toFixed(1) + "MB";
  if (cen) cen.textContent = now.getSeconds();
}

// ---------- Orb Ticks (deferred until dashboard visible) ----------
function generateTicks() {
  const ring = $("ticksRing");
  if (!ring) return;
  const count = 60;
  let svg = "";
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const r1 = 215;
    const r2 = i % 5 === 0 ? 230 : 222;
    const x1 = 300 + Math.cos(angle) * r1;
    const y1 = 300 + Math.sin(angle) * r1;
    const x2 = 300 + Math.cos(angle) * r2;
    const y2 = 300 + Math.sin(angle) * r2;
    const w = i % 5 === 0 ? 2 : 1;
    const op = i % 5 === 0 ? 0.5 : 0.25;
    svg += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="#6fe9ff" stroke-width="${w}" stroke-opacity="${op}" stroke-linecap="round"/>`;
  }
  ring.innerHTML = svg;
}

function generateSensorDots() {
  const container = $("sensorDots");
  if (!container) return;
  container.innerHTML = "";
  for (let i = 0; i < 10; i++) {
    const dot = document.createElement("div");
    dot.className = "dot";
    dot.style.left = (10 + Math.random() * 80) + "%";
    dot.style.top = (10 + Math.random() * 80) + "%";
    dot.style.animationDelay = (Math.random() * 3) + "s";
    container.appendChild(dot);
  }
}

// ---------- Keys ----------
function loadSavedKeys() {
  try {
    const g = localStorage.getItem("jarvis_gemini_key");
    if (g && $("geminiKey")) $("geminiKey").value = g;
  } catch (_) {}
  try {
    const e = localStorage.getItem("jarvis_eleven_key");
    if (e && $("elevenKey")) $("elevenKey").value = e;
  } catch (_) {}
  try {
    const v = localStorage.getItem("jarvis_voice_id");
    if (v && $("elevenVoiceId")) $("elevenVoiceId").value = v;
  } catch (_) {}
}

function saveKeys() {
  try { localStorage.setItem("jarvis_gemini_key", geminiKey); } catch (_) {}
  try { if (elevenKey) localStorage.setItem("jarvis_eleven_key", elevenKey); } catch (_) {}
  try { if (elevenVoiceId) localStorage.setItem("jarvis_voice_id", elevenVoiceId); } catch (_) {}
}

// ---------- Initialize ----------
function initDashboard() {
  log("Initializing dashboard...");
  generateTicks();
  generateSensorDots();
  setInterval(updateMetrics, 1000);
  updateMetrics();
  setState("idle");

  const trans = $("transcript");
  const rep = $("reply");
  if (trans) trans.textContent = "";
  if (rep) rep.textContent = "Say \"Hi Jarvis\" or tap the core to begin.";

  // Dock nav
  document.querySelectorAll(".dock-btn").forEach(item => {
    item.addEventListener("click", () => {
      document.querySelectorAll(".dock-btn").forEach(i => i.classList.remove("active"));
      item.classList.add("active");
      const tab = item.dataset.tab;
      const mods = ["sys","net","com","data","ai","sens","sec","logs"];
      document.querySelectorAll(".hud-label").forEach((m, idx) => {
        m.classList.toggle("active", mods[idx] === tab);
      });
    });
  });

  const dockSetup = $("dockSetup");
  if (dockSetup) {
    dockSetup.addEventListener("click", () => {
      const dash = $("dashboard");
      const setup = $("setupScreen");
      if (dash) dash.classList.add("hidden");
      if (setup) setup.classList.remove("hidden");
      stopAllRecognition();
    });
  }

  const settingsLink = $("settingsLink");
  if (settingsLink) {
    settingsLink.addEventListener("click", () => {
      const dash = $("dashboard");
      const setup = $("setupScreen");
      if (dash) dash.classList.add("hidden");
      if (setup) setup.classList.remove("hidden");
      stopAllRecognition();
    });
  }

  // Orb tap
  const orbTouch = $("orbTouch");
  if (orbTouch) orbTouch.addEventListener("click", toggleRecording);

  // Type fallback
  const ptt = $("pushToTalk");
  if (ptt) ptt.addEventListener("click", () => {
    const typed = prompt("Type your message to JARVIS:");
    if (typed && typed.trim()) handleAudioOrText({ text: typed.trim() });
  });

  // Try mic
  requestMic();
}

async function requestMic() {
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setupRecorder();
    initWakeWord();
    log("Microphone ready — wake word active");
  } catch (err) {
    log("Mic unavailable — tap core to type");
    console.warn("Mic:", err.name, err.message);
  }
}

// ---------- Enable Button ----------
function onEnableClick() {
  log("Button clicked");
  hideError();

  const gk = $("geminiKey");
  const ek = $("elevenKey");
  const ev = $("elevenVoiceId");

  geminiKey = sanitizeKey(gk ? gk.value : "");
  elevenKey = sanitizeKey(ek ? ek.value : "");
  elevenVoiceId = sanitizeKey(ev ? ev.value : "");

  if (!geminiKey) {
    showError("Gemini API key is required — get one free at aistudio.google.com/apikey");
    return;
  }

  saveKeys();

  const setup = $("setupScreen");
  const dash = $("dashboard");

  if (setup) setup.classList.add("hidden");
  if (dash) {
    dash.classList.remove("hidden");
    // Force reflow
    void dash.offsetWidth;
  }

  initDashboard();
}

// ---------- Wake Word ----------
function stopAllRecognition() {
  wakeActive = false;
  if (wakeRec) { try { wakeRec.abort(); } catch (_) {} try { wakeRec.stop(); } catch (_) {} wakeRec = null; }
  if (commandRec) { try { commandRec.abort(); } catch (_) {} try { commandRec.stop(); } catch (_) {} commandRec = null; }
  isListeningForCommand = false;
}

function initWakeWord() {
  if (!SpeechRecognition) {
    log("Speech API not supported");
    return;
  }
  if (wakeActive) return;
  wakeActive = true;
  startWakeListening();
}

function startWakeListening() {
  if (!wakeActive) return;

  wakeRec = new SpeechRecognition();
  wakeRec.continuous = true;
  wakeRec.interimResults = true;
  wakeRec.lang = "en-US";

  wakeRec.onstart = () => { log("Listening for wake word..."); };

  wakeRec.onresult = (event) => {
    if (isListeningForCommand) return;
    const result = event.results[event.results.length - 1];
    const text = result[0].transcript.trim();
    const conf = result[0].confidence || 0;

    log('Heard: "' + text + '"' + (result.isFinal ? " " : " ..."));

    if (result.isFinal && conf > 0.2) {
      if (WAKE_PATTERNS.some(p => p.test(text))) {
        log("WAKE WORD DETECTED");
        try { wakeRec.stop(); } catch (_) {}
        wakeRec = null;
        acknowledgeAndListen();
      }
    }
  };

  wakeRec.onerror = (event) => {
    const fatal = ["not-allowed", "service-not-allowed"];
    if (fatal.includes(event.error)) {
      log("Mic access denied — tap core to talk");
      wakeActive = false;
      wakeRec = null;
      return;
    }
    wakeRec = null;
    if (wakeActive) setTimeout(startWakeListening, 400);
  };

  wakeRec.onend = () => {
    wakeRec = null;
    if (wakeActive && !isListeningForCommand) setTimeout(startWakeListening, 200);
  };

  try { wakeRec.start(); } catch (err) {
    wakeRec = null;
    setTimeout(startWakeListening, 500);
  }
}

async function acknowledgeAndListen() {
  isListeningForCommand = true;
  setState("speaking");
  const trans = $("transcript");
  const rep = $("reply");
  if (trans) trans.textContent = "";
  if (rep) rep.textContent = "";

  await speakText("Yes sir");
  startCommandListening();
}

function startCommandListening() {
  if (!SpeechRecognition) return;
  setState("listening");
  log("Listening for command...");

  commandRec = new SpeechRecognition();
  commandRec.continuous = false;
  commandRec.interimResults = true;
  commandRec.lang = "en-US";

  let commandText = "";
  let finalReceived = false;

  const timeoutId = setTimeout(() => {
    if (!finalReceived && commandRec) {
      log("Command timeout");
      try { commandRec.stop(); } catch (_) {}
    }
  }, 10000);

  commandRec.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    commandText = result[0].transcript.trim();
    const trans = $("transcript");
    if (trans) trans.textContent = commandText;
    log('Command: "' + commandText + '"' + (result.isFinal ? " " : " ..."));

    if (result.isFinal) {
      finalReceived = true;
      clearTimeout(timeoutId);
      try { commandRec.stop(); } catch (_) {}
    }
  };

  commandRec.onerror = (event) => {
    clearTimeout(timeoutId);
    log("Command error: " + event.error);
    isListeningForCommand = false;
    commandRec = null;
    setState("idle");
    startWakeListening();
  };

  commandRec.onend = () => {
    clearTimeout(timeoutId);
    commandRec = null;
    isListeningForCommand = false;

    if (commandText.trim()) {
      handleAudioOrText({ text: commandText.trim() });
    } else {
      log("No command heard — returning to wake mode");
      setState("idle");
      startWakeListening();
    }
  };

  try { commandRec.start(); } catch (err) {
    clearTimeout(timeoutId);
    isListeningForCommand = false;
    commandRec = null;
    setState("idle");
    startWakeListening();
  }
}

// ---------- Audio Recording ----------
function setupRecorder() {
  try {
    if (!micStream) throw new Error("No mic");
    mediaRecorder = new MediaRecorder(micStream);
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
    recorderReady = true;
  } catch (err) {
    recorderReady = false;
  }
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function toggleRecording() {
  if (!recorderReady) {
    const typed = prompt("Type your message to JARVIS:");
    if (typed && typed.trim()) handleAudioOrText({ text: typed.trim() });
    return;
  }

  if (mediaRecorder.state === "inactive") {
    audioChunks = [];
    const trans = $("transcript");
    const rep = $("reply");
    if (trans) trans.textContent = "";
    if (rep) rep.textContent = "";
    setState("listening");
    stopAllRecognition();
    mediaRecorder.start();
  } else if (mediaRecorder.state === "recording") {
    mediaRecorder.stop();
    setState("thinking");
    mediaRecorder.onstop = async () => {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      const base64 = await blobToBase64(blob);
      handleAudioOrText({ audioBase64: base64, mimeType: "audio/webm" });
    };
  }
}

// ---------- Time ----------
function getSASTTime() {
  const now = new Date();
  const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
  const sast = new Date(utcMs + 2 * 60 * 60000);
  const hh24 = sast.getHours();
  const mm = String(sast.getMinutes()).padStart(2, "0");
  const displayH = (hh24 % 12) || 12;
  const ampm = hh24 >= 12 ? "PM" : "AM";
  const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  return {
    display: displayH + ":" + mm + " " + ampm,
    spoken: "It's currently " + displayH + ":" + mm + " " + ampm + " in South Africa, " + days[sast.getDay()] + ".",
  };
}

async function handleTimeQuery() {
  setState("thinking");
  const t = getSASTTime();
  const infoTime = $("infoTime");
  const infoCard = $("infoCard");
  if (infoTime) infoTime.textContent = t.display;
  if (infoCard) infoCard.classList.remove("hidden");
  const rep = $("reply");
  if (rep) rep.textContent = "";
  await speakText(t.spoken);
  if (infoCard) infoCard.classList.add("hidden");
  setState("idle");
  startWakeListening();
}

// ---------- Gemini ----------
async function handleAudioOrText(input) {
  const infoCard = $("infoCard");
  if (infoCard) infoCard.classList.add("hidden");

  if (input.text && TIME_PATTERNS.some(p => p.test(input.text))) {
    const trans = $("transcript");
    if (trans) trans.textContent = input.text;
    return handleTimeQuery();
  }

  setState("thinking");

  const userParts = input.audioBase64
    ? [{ inline_data: { mime_type: input.mimeType, data: input.audioBase64 } }]
    : [{ text: input.text }];

  history.push({ role: "user", parts: userParts });
  if (input.text) {
    const trans = $("transcript");
    if (trans) trans.textContent = input.text;
  }

  try {
    const url = "https://generativelanguage.googleapis.com/v1beta/models/" + GEMINI_MODEL + ":generateContent";
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey },
      body: JSON.stringify({
        contents: history,
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error("Gemini " + res.status + ": " + errText.slice(0, 150));
    }

    const data = await res.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
    if (!replyText) throw new Error("Empty response from Gemini.");

    history.push({ role: "model", parts: [{ text: replyText }] });
    const rep = $("reply");
    if (rep) rep.textContent = replyText;
    await speakText(replyText);
  } catch (err) {
    console.error(err);
    const rep = $("reply");
    if (rep) rep.textContent = "JARVIS error: " + err.message;
    setState("offline");
    setTimeout(() => setState("idle"), 3000);
    startWakeListening();
    return;
  }
  setState("idle");
  startWakeListening();
}

// ---------- TTS ----------
async function speakText(text) {
  setState("speaking");
  if (elevenKey && elevenVoiceId) {
    try {
      const res = await fetch("https://api.elevenlabs.io/v1/text-to-speech/" + elevenVoiceId, {
        method: "POST",
        headers: {
          "xi-api-key": elevenKey,
          "Content-Type": "application/json",
          "Accept": "audio/mpeg",
        },
        body: JSON.stringify({
          text: text,
          model_id: "eleven_turbo_v2_5",
          voice_settings: { stability: 0.5, similarity_boost: 0.75 },
        }),
      });
      if (!res.ok) throw new Error("ElevenLabs " + res.status);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      await new Promise((resolve, reject) => {
        audio.onended = resolve;
        audio.onerror = reject;
        audio.play().catch(reject);
      });
      return;
    } catch (err) {
      console.warn("ElevenLabs failed:", err.message);
    }
  }
  await speakWithBrowserVoice(text);
}

function speakWithBrowserVoice(text) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) return resolve();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.05;
    utter.pitch = 0.95;
    utter.onend = resolve;
    utter.onerror = resolve;
    window.speechSynthesis.speak(utter);
  });
}

// ---------- Boot ----------
function boot() {
  log("JARVIS booting...");
  try {
    loadSavedKeys();
    const btn = $("enableBtn");
    if (btn) {
      btn.addEventListener("click", onEnableClick);
      log("Ready — waiting for initialize");
    } else {
      showError("System error: button not found");
    }
  } catch (err) {
    showError("Boot failed: " + err.message);
    console.error(err);
  }
}

// Start when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot);
} else {
  boot();
}

// PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  });
}
