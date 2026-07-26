# JARVIS v6.2 — AI Voice Assistant HUD

A cinematic, full-screen HUD dashboard for your personal JARVIS AI assistant. Built with vanilla HTML/CSS/JS — no frameworks needed.

![JARVIS HUD](preview.png)

## Features

- **Full cinematic HUD** — Systems, sensors, environment, global status, AI assistant panels
- **Wake word activation** — Say "Hi Jarvis" and it responds "Yes sir", then listens for your command
- **Voice & text input** — Talk or type your requests
- **Gemini AI brain** — Powered by Google's Gemini API
- **Real voice** — ElevenLabs integration for JARVIS's voice (optional)
- **Live data** — Animated CPU, memory, data streams, clock, and sensor feeds
- **PWA ready** — Install as a standalone app on mobile/desktop
- **All your SVG assets** — Orb rings, scan effects, hex grids, core glow

## Quick Start

1. **Get a Gemini API key** free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. **(Optional)** Get an ElevenLabs API key + Voice ID for JARVIS's real voice at [elevenlabs.io](https://elevenlabs.io)
3. Open `index.html` in Chrome or Edge
4. Enter your keys and click **Initialize System**
5. Say **"Hi Jarvis"** or tap the orb to talk

## File Structure

```
jarvis/
├── index.html          # Main dashboard
├── style.css           # HUD styles & layout
├── app.js              # Voice, AI, and logic
├── animations.css      # Keyframe animations
├── sw.js               # Service worker (PWA)
├── manifest.json       # PWA manifest
├── hud_outer.svg       # Orb outer ring
├── hud_middle.svg      # Orb middle ring
├── hud_inner.svg       # Orb inner ring
├── scan_ring.svg       # Scan sweep effect
├── energy_ring.svg     # Energy pulse ring
├── hex_grid.svg        # Hex grid overlay
├── data_streams.svg    # Data crosshairs
├── target_lock.svg     # Target lock reticle
├── circuit_ring.svg    # Circuit pattern ring
├── core_glow.svg       # Core glow gradient
├── core.svg            # Core sphere
├── jarvis_logo.svg     # JARVIS logo
└── jarvis_hud.svg      # Alternative HUD graphic
```

## Wake Word Flow

```
You: "Hi Jarvis"
JARVIS: "Yes sir" (acknowledgment)
JARVIS: [listening mode — orb pulses]
You: "What's the weather like?"
JARVIS: [thinks — orb spins faster]
JARVIS: "The weather in Johannesburg is partly cloudy, 56°F."
```

## Customization

- **Location/weather**: Edit the Environment panel in `index.html`
- **System names**: Edit the Systems list in `index.html`
- **Colors**: Change CSS variables in `:root` in `style.css`
- **Wake phrase**: Edit `WAKE_PATTERNS` in `app.js`
- **Acknowledgment**: Change the text in `acknowledgeAndListen()` in `app.js`

## Deployment

This is a static site — deploy anywhere:
- **GitHub Pages**: Push to a repo, enable Pages
- **Vercel/Netlify**: Drag & drop the folder
- **Local**: Just open `index.html` in a browser

## Credits

- Fonts: [Rajdhani](https://fonts.google.com/specimen/Rajdhani) & [Share Tech Mono](https://fonts.google.com/specimen/Share+Tech+Mono)
- AI: Google Gemini API
- TTS: ElevenLabs (optional)

---

*"I am JARVIS, your personal AI assistant."*
