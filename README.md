# XYRO — AI Lifeform Interface

The official AI companion interface of the Xyrenis ecosystem. Not a dashboard,
not a chatbot — a living interface where a procedural AI energy core reacts to
voice, thought, and touch.

## Design language

Pure cosmic black (`#020203`), expensive restrained glow, electric cyan /
neon blue / aurora purple accents. Everything breathes, everything reacts,
nothing is static. Motion with purpose; calm technology.

## The XYRO Core

The center of the experience — a fully procedural energy orb built with
Three.js + custom GLSL shaders (no images, no GIFs):

- displaced icosahedron shell with layered simplex-noise plasma
- fresnel energy rim, inner nucleus, magnetic field rings, neural particle field
- UnrealBloom + vignette post-processing on pure cosmic black
- cursor parallax (the whole rig reacts to pointer)
- **state machine** — idle (breathing) · listening · thinking · speaking,
  each eased with its own amplitude, speed, color, ring dynamics, and bloom

## Voice bridge

The browser can't reach macOS Personal Voice (Apple restricts it to native
apps), so XYRO speaks in your own voice through a tiny local server: the page
POSTs its text, the server synthesizes via the `personal-say` Swift bridge
(engine chain: ElevenLabs clone → macOS Personal Voice → stock `say`) and
plays it out the Mac's speakers on the same machine.

```bash
npm run build:voice   # compile the Personal Voice bridge (once)
npm run voice         # start the bridge on :8788
npm run prototype     # serve the orb on :8777
```

Then open http://localhost:8777 in Chrome, allow the mic, and clap or say
"Hello Xyro" — it wakes and greets you in your voice.

## Always-on (launchd)

For daily use, run all three as background services that auto-start at login
and auto-restart if they crash — no terminals to keep open:

```bash
bin/xyro install   # one-time: installs + starts the launchd services
bin/xyro status     # check what's running
bin/xyro logs       # tail all three logs
bin/xyro restart    # e.g. after pulling code changes
bin/xyro stop       # take it down
```

Logs land in `~/Library/Logs/xyro/`. The plists live in `launchd/` (templates)
and get copied to `~/Library/LaunchAgents/` on install.

## Structure

- `prototype/` — self-contained single-file Three.js prototype of the Core,
  the locked visual language. Run: `npm run prototype`
- `server/` — the local voice bridge (`voice-server.mjs`) + Personal Voice
  Swift bridge (`personal-say.swift`)
- (planned) full **Next.js 15 + React 19 + React Three Fiber** app: ports the
  Core into R3F/drei/postprocessing, adds holographic windows, interface modes,
  voice, and the command center. Connects to the Jarvis brain via API.

## Status

- [x] XYRO Core prototype — procedural orb, 4 states, cursor parallax, bloom
- [ ] Port to Next.js 15 + React Three Fiber
- [ ] Holographic window system + micro-interactions
- [ ] Voice experience (wake word, speech viz) wired to the Jarvis brain
- [ ] Interface modes + command center
