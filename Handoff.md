# Cosmos Explorer — Handoff: 3D Solar System

**Date:** July 2026
**Status of project:** Redesign complete and deployed to production. All pages live.
**Next major feature:** 3D solar system simulation (react-three-fiber), with moons.

---

## 1. Where the project stands

Cosmos Explorer is a React 19 / TypeScript / Vite SPA on Vercel, with serverless
proxies in `api/` and a separate FastAPI + XGBoost ML service on Render.

**All five pages are live and on one design system:** Home, NEOs & Solar, Stars,
Exoplanets, Deep-Sky, About. No dead nav links. The old cyan theme is fully gone —
every component uses the amber/spectral system with CSS variables, Orbitron for
headings, JetBrains Mono for data, and lucide icons (no emoji).

**Design tokens in use:**

| Domain | Accent | Notes |
|---|---|---|
| Brand / NEO | `#f59e0b` amber | primary brand colour |
| Stars | `#aabfff` blue-white | a real stellar colour |
| Exoplanets | `#34d399` green | also means "habitable zone" app-wide |
| Deep-Sky | `#c084d8` violet | |
| NEO "safe" | `#5eead4` teal | paired with `#ff4d4d` hazard |

Shared colour modules exist so encodings can't drift: `src/utils/DSOStyle.ts`
(deep-sky type colours + icons) and `src/utils/neoStyle.ts` (hazard/safe).

Panels are glass: `rgba(10,13,24,0.82)` + `backdrop-filter: blur(8px)`, sitting over
the `CosmicBackground` starfield. Pages do **not** paint an opaque background.

---

## 2. The next feature: 3D solar system

**Goal.** Replace/augment the current 2D D3 orbital map with a real 3D scene —
tilted orbital plane in perspective, glowing sun, planets on true elliptical orbits,
star-field backdrop, clickable bodies, and a date/time scrubber driving positions.
Visual reference: Solar System Scope.

**Then:** add moons, starting with Earth's Moon.

### 2.1 Library decision: react-three-fiber (r3f)

Chosen over Spacekit.js for three reasons specific to this codebase:

1. `src/utils/orbitMath.ts` already implements Keplerian propagation (Newton-Raphson
   solve of Kepler's equation), so Spacekit's built-in ephemerides are less of a draw.
2. r3f composes natively with React 19 and the existing component model; Spacekit is
   an imperative canvas that would need awkward wrapping.
3. **Moons are the deciding factor.** A moon orbiting a planet orbiting the Sun is a
   parent/child transform hierarchy — trivial with nested `<group>` in r3f's scene
   graph, awkward in Spacekit's flatter body model.

Trade-off, stated honestly: Spacekit gets to the *look* faster. r3f gives full control
and extends to moons without hitting a wall.

### 2.2 CRITICAL: the orbital math is 2D-only right now

`src/utils/orbitMath.ts` → `orbitalElementsToXY()` **ignores inclination and longitude
of ascending node.** Read its own comment: *"Project onto ecliptic plane (simplified:
ignore inclination for 2D map)."*

The `OrbitalElements` type **already carries** `inclination` and
`longitudeAscendingNode`, and `solarSystemData.ts` has real values for all eight
planets. They're just unused.

**So the first task is not rendering — it's math.** Add an
`orbitalElementsToXYZ()` alongside the existing 2D function (don't replace it; the
2D `OrbitalMap` still uses it). The standard transform, after computing true anomaly
`ν` and radius `r` exactly as the current code does:

```
Ω = longitudeAscendingNode (rad)
i = inclination (rad)
ω = argumentOfPerihelion (rad)
u = ν + ω                      // argument of latitude

x = r * (cos Ω * cos u − sin Ω * sin u * cos i)
y = r * (sin Ω * cos u + cos Ω * sin u * cos i)
z = r * (sin u * sin i)
```

That yields heliocentric ecliptic coordinates in AU. Note the existing 2D code drops
straight to `r*cos(ν+ω)`, `r*sin(ν+ω)` — i.e. the above with `i = 0, Ω = 0`.

Verify against a known case before building anything on top: Earth at J2000 should sit
near 1 AU with `z ≈ 0`; Mercury (i = 7.005°) should show visible `z` excursion.

### 2.3 Data sources already in the repo

Two separate `PLANETS` exports exist — **don't confuse them**:

- `src/utils/solarSystemData.ts` → `PLANETS: OrbitingBody[]` — **orbital** elements
  (a, e, i, Ω, ω, M at J2000), plus `periodDays`, colour, `radiusPx`. Also exports
  `COMETS`. This drives *position*.
- `src/utils/planetData.ts` → `PLANETS: PlanetData[]` — **physical** properties:
  `diameterKm`, `massEarth`, `densityGcm3`, `gravityEarth`, `rotationHours`,
  `rotationDir`, `moons` (count). This drives *appearance and spin*.

The 3D scene needs both. Join them by name/id. `rotationHours` + `rotationDir` give
you axial rotation for free; `diameterKm` gives relative body sizes (though you will
need a non-linear scale — see below).

### 2.4 The scale problem (decide early)

True-to-scale is unviewable: Neptune is 30 AU out and planets are invisible dots.
Solar System Scope and NASA Eyes both cheat. Decide *explicitly* and document it in
the UI:

- **Distances:** log or compressed radial scale, or a toggle between "true" and
  "compressed".
- **Body radii:** exaggerate massively (e.g. scale `diameterKm` with a power < 1),
  and keep the Sun from swallowing everything.

Whatever is chosen, say so on screen — consistent with this project's stated principle
that nothing is silently faked. `/about` already commits to that publicly.

### 2.5 Moon hierarchy (design in from the start)

Do **not** bolt moons on later. Structure the scene graph now:

```
<group>                          {/* heliocentric root */}
  <Sun />
  <group position={earthXYZ}>    {/* Earth's orbital position */}
    <Planet id="earth" />
    <group>                      {/* Moon's orbit around Earth */}
      <Moon />
    </group>
  </group>
</group>
```

The Moon's position is computed in the *parent's* frame, so its own Keplerian
elements are geocentric, not heliocentric. Earth's Moon: a ≈ 384,400 km
(≈ 0.00257 AU), e ≈ 0.0549, i ≈ 5.145° (to the ecliptic), period ≈ 27.32 days.

Note the Moon's real orbit is nearly invisible at solar-system scale — it will need
its own exaggeration factor, separate from the planet scale. This is exactly why the
hierarchy matters: the moon group can carry its own scale transform.

Planned follow-up: moon *info* (per the backlog), then other major moons —
`planetData.ts` already stores a `moons` count per planet, which is a natural hook.

### 2.6 Time scrubber

`OrbitalMap.tsx` already has working time controls (`dayOffset`, play/pause, a
`requestAnimationFrame` loop, J2000 epoch). **Read it before rewriting** — the
mechanics carry over directly; only the renderer changes.

One landmine, recently fixed, worth not reintroducing:

```ts
// WRONG — useState with a deps array; nowOffset becomes a [value, setter] tuple
const nowOffset = useState(() => (Date.now() - J2000.getTime()) / 86400000, [J2000]);

// RIGHT — lazy initialiser, satisfies both the type-checker and the
// "no impure function during render" lint rule
const [nowOffset] = useState(() => (Date.now() - J2000.getTime()) / 86400000);
```

`Date.now()` cannot be called bare during render — the lint rule will reject it.
A lazy `useState` initialiser is the accepted escape hatch.

### 2.7 Practical r3f notes

- Add deps: `three`, `@react-three/fiber`, `@react-three/drei` (drei gives
  `OrbitControls`, `Stars`, `Html` labels — all directly useful).
- Bundle size is already flagged in the build (772 kB, >500 kB warning). Three.js is
  heavy — **lazy-load the 3D route** (`React.lazy` + `Suspense`) so it doesn't bloat
  first paint for people who never open it.
- Existing `CosmicBackground.tsx` is a 2D starfield. In 3D, drei's `<Stars>` may
  replace it inside the canvas — decide whether to keep both.
- Keep the glass-panel UI overlaying the canvas (matches the rest of the app and the
  Solar System Scope reference).

---

## 3. Working practices for this repo (learned the hard way)

### `pnpm build` is the only gate that means anything

`type-check` was a **placebo for the entire project's life**: the script was
`tsc --noEmit`, run against a root `tsconfig.json` with `"files": []` and only project
*references*. `--noEmit` does not traverse references — it checked **zero files** and
always exited 0.

It is now `tsc -b`, which does traverse. But the rule stands:

```
pnpm type-check    # tsc -b — now real
pnpm lint
pnpm build         # tsc -b && vite build — what Vercel actually runs
```

**Run all three before pushing.** `pnpm build` is the only one that replicates
production.

Also: green CI ≠ the page loads. A stale type declaration (lucide's `Github` icon,
which no longer exists in v1.x) passed type-check and crashed at runtime. Click
through the affected page under `vercel dev`.

### `api/` is now type-checked — keep it that way

`tsconfig.api.json` exists solely because `api/` was previously invisible to the
type-checker, which let a `dataLimmiter` typo ship. That typo silently **disabled all
rate limiting** (the `catch` in `checkRateLimit` fails open). It is referenced from
the root `tsconfig.json`; don't remove it.

### Windows → Linux case sensitivity

`DSOCard.tsx` imported `'../utils/dsoStyle'` while the file is `DSOStyle.ts`. Windows
resolves it; **Vercel's Linux build does not**. This class of bug is invisible locally
and fatal on deploy. Match import casing to the filename exactly.

### One clone, and push every session

An hour was lost to a *second* clone of the repo (Visual Studio's default
`source\repos\...` path) sitting alongside the real one in `Documents\GitHub\`. Work
in **`C:\Users\arami\Documents\GitHub\cosmos-explorer`** only.

Cross-laptop routine:
```
git status              # clean?
git checkout develop
git pull --ff-only
pnpm install            # if package.json / lockfile changed
vercel dev              # NOT `pnpm dev` — that skips the /api proxies
```
And **push at the end of every session.** A commit that lives on one laptop isn't safe.

PowerShell 5.1 does not support `&&`. Run commands separately, or install PowerShell 7.

### Deploying

`main` is protected — **direct pushes are rejected**. Merge via pull request:
`develop` → PR → CI green → check the Vercel preview → merge. Vercel deploys `main`.

---

## 4. Known bug: Star Catalog shows the same image for every star

**Priority: high — this one is a credibility problem, not just a cosmetic one.**

Every star in the catalogue displays the *same* NASA image, captioned as though it
depicts that star. It doesn't. Here is the chain:

1. `useStarCatalog.ts` builds each star as `id: \`HIP${...}\`` and **never sets `name`**.
   The VizieR query only requests `HIP, RAhms, DEdms, Vmag, B-V, Plx` — there is no
   common-name column in the request at all. So `Star.name` is *always* `undefined`.
2. `StarCatalogPage.tsx` passes `query={selectedStar.name ?? selectedStar.id}` — which
   therefore always resolves to something like `HIP71683`.
3. The NASA Image Library has no images filed under Hipparcos catalogue numbers, so
   `searchNASA()` returns `null`.
4. `fetchNASAImage()` then falls through to the fallback query, which is the constant
   string `"Hubble space telescope star"` — identical for every star.

Result: one generic Hubble image, shown for all ~200–1000 stars, presented as if it
were imagery of the selected object. This directly contradicts what `/about` promises
("Nothing is filled in for the sake of a complete-looking interface").

### Fix options, in order of preference

**a) Resolve real names, then only show an image when there is a genuine match.**
Bright stars *do* have common names (Vega, Betelgeuse, Rigel…) and NASA *does* have
imagery for some of them. Two routes:
   - Add a cross-identification step: SIMBAD can resolve `HIP 91262` → `Vega`. There is
     already a working SIMBAD proxy at `api/simbad.ts` — reuse it. Note this would add
     a lookup per selected star (only on click, so cheap), and the rate limiter and 24h
     cache already handle that pattern.
   - Or ship a small curated HIP → common-name map for the few hundred named stars
     (there is precedent: `src/data/curated_stars.json` already does this kind of thing
     for the ML model, and `DSOCard.tsx` has a `DSO_SEARCH_NAMES` lookup for exactly
     this "make the image query actually match" problem).

**b) Remove the star fallback entirely.** The minimal, honest fix: drop the
`fallback="Hubble space telescope star"` prop in `StarCatalogPage.tsx`. With no
fallback, `NASAImagePanel` already renders its "No dedicated NASA imagery available for
this star" state — which is *true*, and consistent with the rest of the app.

**Do (b) immediately even if (a) is deferred** — a wrong image is worse than no image.

Be careful with the generic-image trap in general: `NASAImagePanel` is shared by
`ExoplanetCard`, `DSOCard`, and `StarCatalogPage`. The exoplanet fallback
(`${hostStar} star`) and DSO lookups are more targeted, but the same failure mode
(fallback returns something plausible-but-unrelated) is possible anywhere. The panel's
own caption already warns that artist concepts "cannot be verified as accurate
representations" — but that warning only shows on the *no-image* path, not when a
fallback image is displayed.

---

## 5. Backlog after the 3D work

1. **Moon info panels** — physical/orbital data per moon, once the hierarchy exists.
2. **Batch SIMBAD lookups into one ADQL query.** `useDeepSkyObjects` currently fires
   31 separate `/api/simbad` calls (now through a 5-at-a-time concurrency pool). One
   `WHERE id IN (...)` query would make it a single request and allow restoring the
   tighter 20/min rate limit (it's at 40/min to accommodate the burst).
3. **Bundle splitting** — already over the 500 kB warning before Three.js lands.
4. **Pin the toolchain** — no `packageManager`, `engines`, or `.nvmrc` exists, though
   CI uses Node 22 + pnpm 9. Volta (`volta pin node@22`, `volta pin pnpm@9`) would make
   both laptops auto-select correctly.

---

## 6. The LLM interpreter (just shipped — context for extending it)

`api/interpret.ts` takes a planet's measured values plus its host-likelihood score and
returns a plain-language reading. Design constraints, worth preserving if it gets
extended to NEOs or stars:

- The payload is **rebuilt field by field server-side** (`sanitize()`); nothing the
  client sends is forwarded raw, so no free text can reach the model as instructions.
- The system prompt forbids introducing any fact not in the JSON, requires it to say
  "unknown" rather than estimate, and **explicitly forbids** framing the
  host-likelihood score as a probability that the planet exists — the planet is already
  confirmed; the score is only about how typical the *star* is. It also can't speculate
  about life or habitability.
- Separate `llmLimiter` (10/min) because calls cost money. Uses Haiku for cost.
- Requires `ANTHROPIC_API_KEY` in Vercel env; returns a clean 503 without it.

The honesty constraints here are deliberate and match `/about`. Keep them.

---

## 7. The ML model (unchanged, for context)

XGBoost host-likelihood classifier, 5 Gaia DR3 features (teff, radius, mass,
metallicity, luminosity), trained on 1,346 confirmed hosts, **test ROC-AUC 0.703**.

The story worth remembering: an early version scored a perfect 1.0 — that was
*leakage*, not success. Host and comparison stars came from different catalogues, so
the model learned to recognise the row's source rather than the star's physics.
Rebuilding both groups from identical Gaia columns dropped it to ~0.70. The comparison
sample is also matched to known hosts, which deliberately costs accuracy: an unmatched
model can score higher by exploiting detection bias (surveys target bright, nearby,
well-observed stars) — measuring telescope time rather than planet formation.

All of this is now public on `/about`, along with the archives' standard
acknowledgements (NASA Exoplanet Archive, SIMBAD, VizieR, Gaia), which those archives
formally request.