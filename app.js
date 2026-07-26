// ============================================
// JARVIS SYSTEM v6.2 — Core Logic (Redesigned)
// ============================================

const GEMINI_MODEL = "gemini-2.0-flash";
const SYSTEM_INSTRUCTION = "You are Jarvis, a professional, calm, confident, " +
  "friendly, intelligent AI assistant. Keep spoken replies concise (1-3 sentences) " +
  "since they will be read aloud. Always tell the truth and never pretend " +
  "something is complete if it isn't.";

const els = {
  setup: document.getElementById("setupScreen"),
  dashboard: document.getElementById("dashboard"),
  geminiKey: document.getElementById("geminiKey"),
  fishKey: document.getElementById("fishKey"),
  fishVoiceId: document.getElementById("fishVoiceId"),
  enableBtn: document.getElementById("enableBtn"),
  errorBox: document.getElementById("errorBox"),
  stateLabel: document.getElementById("stateLabel"),
  transcript: document.getElementById("transcript"),
  reply: document.getElementById("reply"),
  ptt: document.getElementById("pushToTalk"),
  settingsLink: document.getElementById("settingsLink"),
  debug: document.getElementById("debugLine"),
  infoCard: document.getElementById("infoCard"),
  infoTime: document.getElementById("infoTime"),
  cpuBar: document.getElementById("cpuBar"),
  memBar: document.getElementById("memBar"),
  headerTime: document.getElementById("headerTime"),
  headerDate: document.getElementById("headerDate"),
  signalVal: document.getElementById("signalVal"),
  uptimeVal: document.getElementById("uptimeVal"),
  packetsVal: document.getElementById("packetsVal"),
  throughputVal: document.getElementById("throughputVal"),
  latencyVal: document.getElementById("latencyVal"),
  bufferVal: document.getElementById("bufferVal"),
  centerNum: document.getElementById("centerNum"),
  aiIndicator: document.getElementById("aiIndicator"),
  aiStatusText: document.getElementById("aiStatusText"),
  modeBarFill: document.getElementById("modeBarFill"),
  orbTouch: document.getElementById("orbTouch"),
  dockSetup: document.getElementById("dockSetup"),
  ticksRing: document.getElementById("ticksRing"),
  sensorDots: document.getElementById("sensorDots"),
};

function sanitizeKey(raw) {
  return raw.replace(/[^\x20-\x7E]/g, "").trim();
}

let geminiKey = "";
let fishKey = "";
let fishVoiceId = "";
let history = [];
let startTime = Date.now();

function showError(msg) {
  els.errorBox.textContent = msg;
  els.errorBox.classList.remove("hidden");
}

function setState(state) {
  const dash = els.dashboard;
  dash.classList.remove("idle", "listening", "thinking", "speaking", "offline");
  dash.classList.add(state);

  const labelMap = {
    idle: "STANDBY MODE",
    listening: "LISTENING...",
    thinking: "PROCESSING...",
    speaking: "RESPONDING...",
    offline: "OFFLINE"
  };
  els.stateLabel.textContent = labelMap[state] || state.toUpperCase();

  // AI indicator
  if (state === "offline") {
    els.aiIndicator.className = "ai-dot offline";
    els.aiStatusText.textContent = "Offline";
  } else if (state === "thinking") {
    els.aiIndicator.className = "ai-dot processing";
    els.aiStatusText.textContent = "Processing";
  } else if (state === "listening") {
    els.aiIndicator.className = "ai-dot processing";
    els.aiStatusText.textContent = "Listening";
  } else if (state === "speaking") {
    els.aiIndicator.className = "ai-dot";
    els.aiStatusText.textContent = "Speaking";
  } else {
    els.aiIndicator.className = "ai-dot";
    els.aiStatusText.textContent = "Online";
  }

  const fillMap = { idle: "5%", listening: "35%", thinking: "75%", speaking: "100%", offline: "10%" };
  els.modeBarFill.style.width = fillMap[state] || "5%";
}

// ---------- Live Data Simulation ----------
function updateMetrics() {
  els.cpuBar.style.width = (18 + Math.random() * 22) + "%";
  els.memBar.style.width = (32 + Math.random() * 28) + "%";

  const now = new Date();
  const days = ["SUN","MON","TUE","WED","THU","FRI","SAT"];
  const months = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
  els.headerTime.textContent = now.toLocaleTimeString("en-US", {hour12:false, hour:"2-digit", minute:"2-digit"});
  els.headerDate.textContent = days[now.getDay()] + ", " + months[now.getMonth()] + " " + now.getDate() + " " + now.getFullYear();

  els.signalVal.textContent = (95 + Math.floor(Math.random() * 5)) + "%";
  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const h = String(Math.floor(uptime / 3600)).padStart(2,"0");
  const m = String(Math.floor((uptime % 3600) / 60)).padStart(2,"0");
  const s = String(uptime % 60).padStart(2,"0");
  els.uptimeVal.textContent = h + ":" + m + ":" + s;
  els.packetsVal.textContent = (0.8 + Math.random() * 0.8).toFixed(1) + "K/s";
  els.throughputVal.textContent = (94 + Math.floor(Math.random() * 6)) + "%";
  els.latencyVal.textContent = (8 + Math.floor(Math.random() * 12)) + "ms";
  els.bufferVal.textContent = (0.2 + Math.random() * 0.4).toFixed(1) + "MB";
  els.centerNum.textContent = now.getSeconds();
}
setInterval(updateMetrics, 1000);
updateMetrics();

// Generate tick marks for orb — chunkier alternating bracket blocks
function generateTicks() {
  const count = 48;
  let svg = "";
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const isMajor = i % 4 === 0;
    const r1 = 250;
    const r2 = isMajor ? 272 : 262;
    const x1 = 300 + Math.cos(angle) * r1;
    const y1 = 300 + Math.sin(angle) * r1;
    const x2 = 300 + Math.cos(angle) * r2;
    const y2 = 300 + Math.sin(angle) * r2;
    const width = isMajor ? 5 : 2.5;
    const opacity = isMajor ? 0.6 : 0.3;
    svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#6fe9ff" stroke-width="${width}" stroke-opacity="${opacity}" stroke-linecap="round"/>`;
  }
  els.ticksRing.innerHTML = svg;
}
generateTicks();

// Generate the iris-blade ring — angled trapezoid blades around a circle,
// the diagonal "aperture" look that's the centerpiece of the reference HUD.
function generateIrisBlades() {
  const count = 40;
  const rInner = 148;
  const rOuter = 192;
  const blades = document.getElementById("irisBlades");
  let svg = "";
  for (let i = 0; i < count; i++) {
    const a1 = (i / count) * Math.PI * 2;
    const a2 = a1 + (Math.PI * 2 / count) * 0.55; // blade width
    const skew = 0.35; // how much each blade leans, for the angled-iris look
    const x1 = 300 + Math.cos(a1) * rInner;
    const y1 = 300 + Math.sin(a1) * rInner;
    const x2 = 300 + Math.cos(a2 + skew) * rOuter;
    const y2 = 300 + Math.sin(a2 + skew) * rOuter;
    const x3 = 300 + Math.cos(a2) * rOuter;
    const y3 = 300 + Math.sin(a2) * rOuter;
    const x4 = 300 + Math.cos(a1 - skew * 0.3) * rInner;
    const y4 = 300 + Math.sin(a1 - skew * 0.3) * rInner;
    const opacity = i % 3 === 0 ? 0.85 : 0.4;
    svg += `<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}" fill="#6fe9ff" fill-opacity="${opacity}" stroke="#bfffff" stroke-opacity="0.3" stroke-width="0.5"/>`;
  }
  if (blades) blades.innerHTML = svg;
}
generateIrisBlades();

// Generate the 8 white light blocks — evenly spaced glowing blocks
function generatePowerBlocks() {
  const count = 8;
  const r = 170;
  const blockLen = 22;
  const blocks = document.getElementById("powerBlocks");
  let svg = "";
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2; // start at top
    const cx = 300 + Math.cos(angle) * r;
    const cy = 300 + Math.sin(angle) * r;
    // block rectangle oriented tangent to the circle
    const tangentAngle = angle + Math.PI / 2;
    const dx = Math.cos(tangentAngle) * (blockLen / 2);
    const dy = Math.sin(tangentAngle) * (blockLen / 2);
    const thickness = 7;
    const nx = Math.cos(angle) * thickness;
    const ny = Math.sin(angle) * thickness;
    const x1 = cx - dx - nx / 2, y1 = cy - dy - ny / 2;
    const x2 = cx + dx - nx / 2, y2 = cy + dy - ny / 2;
    const x3 = cx + dx + nx / 2, y3 = cy + dy + ny / 2;
    const x4 = cx - dx + nx / 2, y4 = cy - dy + ny / 2;
    svg += `<polygon points="${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}" fill="#ffffff" filter="url(#glowStrong)" class="power-block" style="animation-delay:${i * 0.15}s"/>`;
  }
  if (blocks) blocks.innerHTML = svg;
}
generatePowerBlocks();

// Sensor dots
for (let i = 0; i < 10; i++) {
  const dot = document.createElement("div");
  dot.className = "dot";
  dot.style.left = (10 + Math.random() * 80) + "%";
  dot.style.top = (10 + Math.random() * 80) + "%";
  dot.style.animationDelay = (Math.random() * 3) + "s";
  els.sensorDots.appendChild(dot);
}

// ---------- Dock Navigation ----------
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

els.dockSetup.addEventListener("click", () => {
  els.dashboard.classList.add("hidden");
  els.setup.classList.remove("hidden");
  stopAllRecognition();
});

// ---------- Keys ----------
async function loadSavedKeys() {
  try {
    const g = localStorage.getItem("jarvis_gemini_key");
    if (g) els.geminiKey.value = g;
  } catch (_) {}
  try {
    const e = localStorage.getItem("jarvis_fish_key");
    if (e) els.fishKey.value = e;
  } catch (_) {}
  try {
    const v = localStorage.getItem("jarvis_fish_voice_id");
    if (v) els.fishVoiceId.value = v;
  } catch (_) {}
}

function saveKeys() {
  try { localStorage.setItem("jarvis_gemini_key", geminiKey); } catch (_) {}
  try { if (fishKey) localStorage.setItem("jarvis_fish_key", fishKey); } catch (_) {}
  try { if (fishVoiceId) localStorage.setItem("jarvis_fish_voice_id", fishVoiceId); } catch (_) {}
}

loadSavedKeys();

// ---------- Enable Flow ----------
els.enableBtn.addEventListener("click", async () => {
  els.errorBox.classList.add("hidden");
  geminiKey = sanitizeKey(els.geminiKey.value);
  fishKey = sanitizeKey(els.fishKey.value);
  fishVoiceId = sanitizeKey(els.fishVoiceId.value);

  if (!geminiKey) {
    showError("A Gemini API key is required — get one free at aistudio.google.com/apikey");
    return;
  }

  saveKeys();
  els.setup.classList.add("hidden");
  els.dashboard.classList.remove("hidden");

  setState("idle");
  els.transcript.textContent = "";
  els.reply.textContent = 'Say "Hi Jarvis" or tap the orb to begin.';

  // Request mic permission early
  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setupRecorder();
    initWakeWord();
  } catch (err) {
    console.warn("Mic permission denied:", err);
    els.debug.textContent = "Mic unavailable — tap orb to type";
  }
});

els.settingsLink.addEventListener("click", () => {
  els.dashboard.classList.add("hidden");
  els.setup.classList.remove("hidden");
  stopAllRecognition();
});

// ============================================
// WAKE WORD + COMMAND FLOW (Robust)
// ============================================

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const WAKE_PATTERNS = [/\bhi jarvis\b/i, /\bhey jarvis\b/i, /\bjarvis\b/i, /\bhello jarvis\b/i];

let wakeRec = null;
let commandRec = null;
let isListeningForCommand = false;
let micStream = null;
let mediaRecorder = null;
let audioChunks = [];
let recorderReady = false;
let wakeActive = false;

function stopAllRecognition() {
  wakeActive = false;
  if (wakeRec) {
    try { wakeRec.abort(); } catch (_) {}
    try { wakeRec.stop(); } catch (_) {}
    wakeRec = null;
  }
  if (commandRec) {
    try { commandRec.abort(); } catch (_) {}
    try { commandRec.stop(); } catch (_) {}
    commandRec = null;
  }
  isListeningForCommand = false;
}

function initWakeWord() {
  if (!SpeechRecognition) {
    els.debug.textContent = "Speech API not supported in this browser";
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
  wakeRec.maxAlternatives = 1;

  wakeRec.onstart = () => {
    els.debug.textContent = "Listening for wake word...";
  };

  wakeRec.onresult = (event) => {
    if (isListeningForCommand) return;

    const result = event.results[event.results.length - 1];
    const text = result[0].transcript.trim();
    const confidence = result[0].confidence || 0;

    els.debug.textContent = 'Heard: "' + text + '"' + (result.isFinal ? " ✓" : " ...");

    if (result.isFinal && confidence > 0.3) {
      if (WAKE_PATTERNS.some(p => p.test(text))) {
        // WAKE WORD DETECTED
        els.debug.textContent = "WAKE WORD DETECTED";
        try { wakeRec.stop(); } catch (_) {}
        wakeRec = null;
        acknowledgeAndListen();
      }
    }
  };

  wakeRec.onerror = (event) => {
    const fatal = ["not-allowed", "service-not-allowed"];
    if (fatal.includes(event.error)) {
      els.debug.textContent = "Mic access denied — tap orb to talk";
      wakeActive = false;
      wakeRec = null;
      return;
    }
    // Non-fatal: restart
    wakeRec = null;
    if (wakeActive) {
      setTimeout(startWakeListening, 400);
    }
  };

  wakeRec.onend = () => {
    wakeRec = null;
    if (wakeActive && !isListeningForCommand) {
      setTimeout(startWakeListening, 200);
    }
  };

  try {
    wakeRec.start();
  } catch (err) {
    wakeRec = null;
    setTimeout(startWakeListening, 500);
  }
}

// Step 1: Acknowledge then listen for command
async function acknowledgeAndListen() {
  isListeningForCommand = true;
  setState("speaking");
  els.transcript.textContent = "";
  els.reply.textContent = "";

  await speakText("Yes sir");
  startCommandListening();
}

// Step 2: Listen for command
function startCommandListening() {
  if (!SpeechRecognition) return;

  setState("listening");
  els.debug.textContent = "Listening for command...";

  commandRec = new SpeechRecognition();
  commandRec.continuous = false;
  commandRec.interimResults = true;
  commandRec.lang = "en-US";

  let commandText = "";
  let finalReceived = false;

  const timeoutId = setTimeout(() => {
    if (!finalReceived && commandRec) {
      els.debug.textContent = "Command timeout";
      try { commandRec.stop(); } catch (_) {}
    }
  }, 10000);

  commandRec.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    commandText = result[0].transcript.trim();
    els.transcript.textContent = commandText;
    els.debug.textContent = 'Command: "' + commandText + '"' + (result.isFinal ? " ✓" : " ...");

    if (result.isFinal) {
      finalReceived = true;
      clearTimeout(timeoutId);
      try { commandRec.stop(); } catch (_) {}
    }
  };

  commandRec.onerror = (event) => {
    clearTimeout(timeoutId);
    els.debug.textContent = "Command error: " + event.error;
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
      els.debug.textContent = "No command heard — returning to wake mode";
      setState("idle");
      startWakeListening();
    }
  };

  try {
    commandRec.start();
  } catch (err) {
    clearTimeout(timeoutId);
    isListeningForCommand = false;
    commandRec = null;
    setState("idle");
    startWakeListening();
  }
}

// ---------- Audio Recording (orb tap) ----------
function setupRecorder() {
  try {
    if (!micStream) throw new Error("No mic stream");
    mediaRecorder = new MediaRecorder(micStream);
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
    recorderReady = true;
  } catch (err) {
    console.warn("Recorder setup failed:", err);
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
    els.transcript.textContent = "";
    els.reply.textContent = "";
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

els.orbTouch.addEventListener("click", toggleRecording);

// Fallback: type instead of talk
els.ptt.addEventListener("click", () => {
  const typed = prompt("Type your message to JARVIS:");
  if (typed && typed.trim()) handleAudioOrText({ text: typed.trim() });
});

// ---------- Time Query ----------
const TIME_PATTERNS = [/\bwhat.?s the time\b/i, /\bwhat time is it\b/i, /\bcurrent time\b/i, /\btell me the time\b/i];

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
  els.infoTime.textContent = t.display;
  els.infoCard.classList.remove("hidden");
  els.reply.textContent = "";
  await speakText(t.spoken);
  els.infoCard.classList.add("hidden");
  setState("idle");
  startWakeListening();
}

// ---------- Brain: Gemini ----------
async function handleAudioOrText(input) {
  els.infoCard.classList.add("hidden");

  if (input.text && TIME_PATTERNS.some(p => p.test(input.text))) {
    els.transcript.textContent = input.text;
    return handleTimeQuery();
  }

  setState("thinking");

  const userParts = input.audioBase64
    ? [{ inline_data: { mime_type: input.mimeType, data: input.audioBase64 } }]
    : [{ text: input.text }];

  history.push({ role: "user", parts: userParts });
  if (input.text) els.transcript.textContent = input.text;

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
      throw new Error("Gemini error " + res.status + ": " + errText.slice(0, 150));
    }

    const data = await res.json();
    const replyText = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
    if (!replyText) throw new Error("Gemini returned an empty response.");

    history.push({ role: "model", parts: [{ text: replyText }] });
    els.reply.textContent = replyText;
    await speakText(replyText);
  } catch (err) {
    console.error(err);
    els.reply.textContent = "JARVIS encountered an error: " + err.message;
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
  if (fishKey && fishVoiceId) {
    try {
      const res = await fetch("https://api.fish.audio/v1/tts", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + fishKey,
          "Content-Type": "application/json",
          "model": "s2-pro",
        },
        body: JSON.stringify({
          text: text,
          reference_id: fishVoiceId,
          format: "mp3",
        }),
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error("HTTP " + res.status + ": " + errText.slice(0, 150));
      }
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
      console.warn("Fish Audio TTS failed, falling back:", err);
      if (els.debug) els.debug.textContent = "Fish Audio failed (" + err.message + ") — using browser voice";
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

// ---------- PWA ----------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((err) => {
      console.warn("SW registration failed:", err);
    });
  });
}
