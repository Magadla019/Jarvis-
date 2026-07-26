// ============================================
// JARVIS SYSTEM v6.2 — Core Logic
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
  elevenKey: document.getElementById("elevenKey"),
  elevenVoiceId: document.getElementById("elevenVoiceId"),
  enableBtn: document.getElementById("enableBtn"),
  errorBox: document.getElementById("errorBox"),
  orb: document.getElementById("orb"),
  miniOrb: document.getElementById("miniOrb"),
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
  hudCenterNum: document.getElementById("hudCenterNum"),
  aiIndicator: document.getElementById("aiIndicator"),
  aiStatusText: document.getElementById("aiStatusText"),
  modeBarFill: document.getElementById("modeBarFill"),
  dockSetup: document.getElementById("dockSetup"),
};

function sanitizeKey(raw) {
  return raw.replace(/[^\x20-\x7E]/g, "").trim();
}

let geminiKey = "";
let elevenKey = "";
let elevenVoiceId = "";
let history = [];
let startTime = Date.now();

function showError(msg) {
  els.errorBox.textContent = msg;
  els.errorBox.classList.remove("hidden");
}

function setState(state) {
  els.orb.className = "orb " + state;
  const labelMap = {
    idle: "STANDBY MODE",
    listening: "LISTENING...",
    thinking: "PROCESSING...",
    speaking: "RESPONDING...",
    offline: "OFFLINE"
  };
  els.stateLabel.textContent = labelMap[state] || state.toUpperCase();

  if (state === "offline") {
    els.aiIndicator.style.background = "var(--danger)";
    els.aiIndicator.style.boxShadow = "0 0 10px var(--danger)";
    els.aiStatusText.textContent = "Offline";
  } else if (state === "thinking") {
    els.aiIndicator.style.background = "var(--warning)";
    els.aiIndicator.style.boxShadow = "0 0 10px var(--warning)";
    els.aiStatusText.textContent = "Processing";
  } else {
    els.aiIndicator.style.background = "var(--success)";
    els.aiIndicator.style.boxShadow = "0 0 10px var(--success)";
    els.aiStatusText.textContent = "Online";
  }

  const fillMap = { idle: "0%", listening: "30%", thinking: "70%", speaking: "100%", offline: "10%" };
  els.modeBarFill.style.width = fillMap[state] || "0%";
}

// ---------- Live Data Simulation ----------
function updateMetrics() {
  els.cpuBar.style.width = (18 + Math.random() * 20) + "%";
  els.memBar.style.width = (35 + Math.random() * 25) + "%";

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
  els.hudCenterNum.textContent = now.getSeconds();
}
setInterval(updateMetrics, 1000);
updateMetrics();

// Sensor dots
const sensorDotsContainer = document.getElementById("sensorDots");
for (let i = 0; i < 8; i++) {
  const dot = document.createElement("div");
  dot.className = "sensor-dot";
  dot.style.left = (15 + Math.random() * 70) + "%";
  dot.style.top = (15 + Math.random() * 70) + "%";
  dot.style.animationDelay = (Math.random() * 3) + "s";
  sensorDotsContainer.appendChild(dot);
}

// ---------- Dock Navigation ----------
document.querySelectorAll(".dock-item").forEach(item => {
  item.addEventListener("click", () => {
    document.querySelectorAll(".dock-item").forEach(i => i.classList.remove("active"));
    item.classList.add("active");
    const tab = item.dataset.tab;
    const mods = ["sys","net","com","data","ai","sens","sec","logs"];
    document.querySelectorAll(".hud-module").forEach((m, idx) => {
      m.classList.toggle("active", mods[idx] === tab);
    });
  });
});

els.dockSetup.addEventListener("click", () => {
  els.dashboard.classList.add("hidden");
  els.setup.classList.remove("hidden");
  stopWakeListening();
});

// ---------- Keys ----------
async function loadSavedKeys() {
  try {
    const g = await window.storage.get("gemini_api_key", false);
    if (g) els.geminiKey.value = g.value;
  } catch (_) {}
  try {
    const e = await window.storage.get("elevenlabs_api_key", false);
    if (e) els.elevenKey.value = e.value;
  } catch (_) {}
  try {
    const v = await window.storage.get("elevenlabs_voice_id", false);
    if (v) els.elevenVoiceId.value = v.value;
  } catch (_) {}
}

async function saveKeys() {
  try { await window.storage.set("gemini_api_key", geminiKey, false); } catch (_) {}
  try { if (elevenKey) await window.storage.set("elevenlabs_api_key", elevenKey, false); } catch (_) {}
  try { if (elevenVoiceId) await window.storage.set("elevenlabs_voice_id", elevenVoiceId, false); } catch (_) {}
}

loadSavedKeys();

// ---------- Enable Flow ----------
let micStream = null;

els.enableBtn.addEventListener("click", async () => {
  els.errorBox.classList.add("hidden");
  geminiKey = sanitizeKey(els.geminiKey.value);
  elevenKey = sanitizeKey(els.elevenKey.value);
  elevenVoiceId = sanitizeKey(els.elevenVoiceId.value);

  if (!geminiKey) {
    showError("A Gemini API key is required — get one free at aistudio.google.com/apikey");
    return;
  }

  try {
    micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch (err) {
    showError("Microphone access was denied or unavailable. You can still use the ⌨ button to type instead.");
  }

  await saveKeys();
  els.setup.classList.add("hidden");
  els.dashboard.classList.remove("hidden");

  setupRecorder();
  setState(recorderReady ? "idle" : "offline");
  if (!recorderReady) {
    els.transcript.textContent = "Mic unavailable — tap the orb or ⌨ to type instead.";
  }

  startWakeListening();
});

els.settingsLink.addEventListener("click", () => {
  els.dashboard.classList.add("hidden");
  els.setup.classList.remove("hidden");
  stopWakeListening();
});

// ============================================
// WAKE WORD + COMMAND FLOW (Fixed)
// ============================================
// Flow: Wake word detected -> "Yes sir" -> Listen for command -> Process -> Back to wake

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const WAKE_PATTERNS = [/\bhi jarvis\b/i, /\bhey jarvis\b/i, /\bjarvis\b/i];

let wakeRec = null;
let commandRec = null;
let isListeningForCommand = false;

function stopWakeListening() {
  if (wakeRec) {
    try { wakeRec.stop(); } catch (_) {}
    wakeRec = null;
  }
  if (commandRec) {
    try { commandRec.stop(); } catch (_) {}
    commandRec = null;
  }
  isListeningForCommand = false;
}

function startWakeListening() {
  if (!SpeechRecognition) {
    els.debug.textContent = "debug: SpeechRecognition API not supported";
    return;
  }
  if (wakeRec) return; // already running

  wakeRec = new SpeechRecognition();
  wakeRec.continuous = true;
  wakeRec.interimResults = true;
  wakeRec.lang = "en-US";

  wakeRec.onstart = () => {
    els.debug.textContent = "debug: listening for wake word...";
  };

  wakeRec.onspeechstart = () => {
    els.debug.textContent = "debug: speech detected...";
  };

  wakeRec.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    const text = result[0].transcript.trim();
    els.debug.textContent = 'debug: heard "' + text + '"' + (result.isFinal ? " (final)" : "");

    if (isListeningForCommand) return; // don't process while in command mode

    if (WAKE_PATTERNS.some((p) => p.test(text))) {
      // WAKE WORD DETECTED
      els.debug.textContent = "debug: WAKE WORD DETECTED — acknowledging...";
      try { wakeRec.stop(); } catch (_) {}
      wakeRec = null;

      // Acknowledge with "Yes sir" then listen for command
      acknowledgeAndListen();
    }
  };

  wakeRec.onerror = (event) => {
    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      els.debug.textContent = "debug: recognition error — " + event.error;
      wakeRec = null;
      return;
    }
    // Auto-restart on other errors
    els.debug.textContent = "debug: recognition error — " + event.error + ", restarting...";
    wakeRec = null;
    setTimeout(startWakeListening, 500);
  };

  wakeRec.onend = () => {
    if (!isListeningForCommand && !wakeRec) {
      els.debug.textContent = "debug: wake listener ended, restarting...";
      setTimeout(startWakeListening, 300);
    }
  };

  try { wakeRec.start(); } catch (err) {
    els.debug.textContent = "debug: failed to start wake listener: " + err.message;
  }
}

// Step 1: Say "Yes sir" then start command listening
async function acknowledgeAndListen() {
  isListeningForCommand = true;
  setState("speaking");
  els.transcript.textContent = "";
  els.reply.textContent = "";

  // Speak "Yes sir"
  await speakText("Yes sir");

  // Now start listening for the actual command
  startCommandListening();
}

// Step 2: Listen for command (single utterance, ~8s timeout)
function startCommandListening() {
  if (!SpeechRecognition) return;

  setState("listening");
  els.debug.textContent = "debug: listening for your command...";

  commandRec = new SpeechRecognition();
  commandRec.continuous = false;
  commandRec.interimResults = true;
  commandRec.lang = "en-US";

  let commandText = "";
  let finalReceived = false;

  // 8-second timeout
  const timeoutId = setTimeout(() => {
    if (!finalReceived && commandRec) {
      els.debug.textContent = "debug: command timeout — no speech detected";
      try { commandRec.stop(); } catch (_) {}
    }
  }, 8000);

  commandRec.onresult = (event) => {
    const result = event.results[event.results.length - 1];
    commandText = result[0].transcript.trim();
    els.transcript.textContent = commandText;
    els.debug.textContent = 'debug: command: "' + commandText + '"' + (result.isFinal ? " (final)" : "");

    if (result.isFinal) {
      finalReceived = true;
      clearTimeout(timeoutId);
      try { commandRec.stop(); } catch (_) {}
    }
  };

  commandRec.onerror = (event) => {
    clearTimeout(timeoutId);
    els.debug.textContent = "debug: command error — " + event.error;
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
      // Process the command
      handleAudioOrText({ text: commandText.trim() });
    } else {
      els.debug.textContent = "debug: no command heard, returning to wake mode";
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

// ---------- Audio Recording (orb tap) ----------
let mediaRecorder = null;
let audioChunks = [];
let recorderReady = false;

function setupRecorder() {
  try {
    if (!micStream) throw new Error("No microphone stream available.");
    mediaRecorder = new MediaRecorder(micStream);
    mediaRecorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunks.push(e.data); };
    recorderReady = true;
  } catch (err) {
    console.warn("Mic setup failed:", err);
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
    const typed = prompt("Mic isn't available here — type your message to Jarvis:");
    if (typed && typed.trim()) handleAudioOrText({ text: typed.trim() });
    return;
  }

  if (mediaRecorder.state === "inactive") {
    audioChunks = [];
    els.transcript.textContent = "";
    els.reply.textContent = "";
    setState("listening");
    stopWakeListening();
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

els.orb.addEventListener("click", toggleRecording);
els.miniOrb.addEventListener("click", toggleRecording);

// Fallback: type instead of talk
els.ptt.addEventListener("click", () => {
  const typed = prompt("Type your message to Jarvis:");
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

  if (input.text && TIME_PATTERNS.some((p) => p.test(input.text))) {
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
    els.reply.textContent = "Jarvis hit an error: " + err.message;
    setState("offline");
    setTimeout(() => setState("idle"), 2500);
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
      console.warn("ElevenLabs TTS failed, falling back to browser voice:", err);
    }
  }
  await speakWithBrowserVoice(text);
}

function speakWithBrowserVoice(text) {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) return resolve();
    const utter = new SpeechSynthesisUtterance(text);
    utter.onend = resolve;
    utter.onerror = resolve;
    window.speechSynthesis.speak(utter);
  });
}

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch (_) {}
}

// ---------- PWA ----------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((err) => {
      console.warn("Service worker registration failed:", err);
    });
  });
}
