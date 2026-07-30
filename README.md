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

## Structure

- `prototype/` — self-contained single-file Three.js prototype of the Core,
  the locked visual language. Run: `cd prototype && python3 -m http.server 8777`
- (planned) full **Next.js 15 + React 19 + React Three Fiber** app: ports the
  Core into R3F/drei/postprocessing, adds holographic windows, interface modes,
  voice, and the command center. Connects to the Jarvis brain via API.

## Status

- [x] XYRO Core prototype — procedural orb, 4 states, cursor parallax, bloom
- [ ] Port to Next.js 15 + React Three Fiber
- [ ] Holographic window system + micro-interactions
- [ ] Voice experience (wake word, speech viz) wired to the Jarvis brain
- [ ] Interface modes + command center
