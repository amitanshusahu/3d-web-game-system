# 15. Player HUD — Tailwind + Gamification (Beginner Notes)

> Goal of this step: turn the bare `PlayerHud.tsx` (a white crosshair dot, a
> `Grounded/Airborne` badge, and a `Click to look around` overlay — all inline
> `style={{}}`) into a clean, spacious, game-like HUD with a real gamified
> objective: **"Explore the world before your alarm goes off."**
> Prereq: `11_hud_out_of_canvas.md` (why the HUD is a DOM sibling of `<Canvas>`),
> `13_zustand_hud_store.md` (the store the HUD reads from). This step touches UI
> and one store field only — no physics, no movement, no camera changes.

## 0. What we just did (TL;DR)

1. Extended `playerHudStore.ts` with a run/alarm field: `alarmEndsAt` plus
   `startAlarm(durationMs)` and `resetAlarm()` actions.
2. Rewrote `PlayerHud.tsx` in Tailwind — no inline styles anywhere — as small
   presentational pieces: `Crosshair`, `ObjectiveBanner`, `StatusPill`,
   `ControlBar`, `StartOverlay`, and a shared `Key`/`ControlHint` pair.
3. Added the headline gamification element: a top-center **objective banner**
   with an alarm countdown (`5:00`), a draining progress bar, and a low/expired
   color shift (emerald → amber → rose).
4. Added a `hud-in` entrance animation to the Tailwind `@theme` in `index.css`.
5. `tsc -b` and `oxlint` on the touched files are clean.

## 1. Mental model: the HUD is a stack of small "panels", not one blob

The old file was one component with two branches (locked / not locked) and a
pile of inline styles. Screen-space HUDs read better as a **flat stack of
independent panels**, each pinned to a screen edge:

```
┌─ viewport ───────────────────────────────────────────┐
│              ┌──────────────────────────┐            │  ObjectiveBanner  (top-center)
│              │ ⏰ OBJECTIVE       4:59  │            │    = objective + clock + bar
│              │ Explore the world…       │            │
│              │ ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░░░  │            │
│              └──────────────────────────┘            │
│                                                      │
│                        ⊙                             │  Crosshair        (dead-center)
│                                                      │
│ ┌────────────────┐          W A S D Move  Space Jump│  StatusPill (bottom-left)
│ │ ● GROUNDED     │          Shift Run      Esc Rel.  │  ControlBar (bottom-right)
│ └────────────────┘                                   │
└──────────────────────────────────────────────────────┘
```

When the pointer is **not** locked, the whole stack is replaced by
`StartOverlay` — a full-screen title card (`Before the alarm` + objective +
keycaps + "click to explore"). Same two-branch shape as before, just with the
panels split into functions so each one is short enough to read.

## 2. Core concept: a "run" is just a timestamp

The gamification asked for one real rule: *you have until your alarm to explore.*
A countdown could live in three places — a `useState` number, a `setInterval`
that decrements it, or an **end timestamp**. We chose the timestamp:

```
startAlarm(5 min)                       every second tick
      │                                       │
      ▼                                       ▼
alarmEndsAt = Date.now() + 300000       remaining = alarmEndsAt - Date.now()
```

Why a timestamp beats a decrementing counter:

| Approach | Failure mode |
|----------|--------------|
| `setCount(count - 1)` every second | Drifts — a dropped/throttled tick permanently loses a second; two tabs fight over the number |
| `alarmEndsAt` timestamp + local `now` | Self-correcting — every render re-derives the truth from the wall clock; the interval only exists to *trigger re-renders*, it never owns the value |

The store holds the truth (`alarmEndsAt`); the component holds a disposable
`now` that just forces a repaint. If the interval is late, the next render is
still exact.

The **run lifecycle** is tied to pointer lock, which is the natural "you are
playing / you paused" signal we already track:

```
pointer lock ON   → startAlarm(5 min)   (no-op if a run is already going)
pointer lock OFF  → resetAlarm()        (ESC = fresh countdown next time)
```

So changing worlds resets naturally, and there is no stale expired alarm on the
next run.

## 3. Every new line, explained

**`playerHudStore.ts` — three additions:**

```ts
alarmEndsAt: number | null
startAlarm: (durationMs: number) => void
resetAlarm: () => void
```

- `alarmEndsAt: number | null` — absolute ms timestamp, or `null` before a run.
  Storing an *end time* (not a duration) is the whole trick from §2.
- `startAlarm` guards with `if (get().alarmEndsAt !== null) return` — the lock
  effect can re-run (e.g. `alarmMinutes` prop changes) without restarting the
  clock. Same "drop redundant writes" habit as the existing `setPlayerHud`.
- `resetAlarm` also early-returns when already `null`, so ESC doesn't churn
  subscribers.

**`PlayerHud.tsx` — the gamified panel:**

```tsx
const [now, setNow] = useState(() => Date.now())
```

- The disposable repaint trigger. `useState(() => …)` is *lazy init* — the
  function runs once, we're not calling `Date.now()` on every render.

```tsx
useEffect(() => {
  if (isPointerLocked) startAlarm(alarmMinutes * 60_000)
  else resetAlarm()
}, [isPointerLocked, alarmMinutes, startAlarm, resetAlarm])
```

- Run lifecycle. The three actions are stable zustand references, so the dep
  array never causes a spurious re-run.

```tsx
useEffect(() => {
  if (!isPointerLocked || alarmEndsAt === null) return
  const timer = setInterval(() => setNow(Date.now()), 1000)
  return () => clearInterval(timer)
}, [isPointerLocked, alarmEndsAt])
```

- Starts the ticker only while a run is live; the cleanup clears it on ESC.
  Note there is **no** `setNow(Date.now())` *inside* the effect body — calling
  `setState` synchronously in an effect is flagged by `oxlint`
  (`react(set-state-in-effect)`) as a cascading-render smell. The first second
  is handled by clamping instead (below).

```tsx
const remainingMs =
  alarmEndsAt === null ? totalMs : Math.min(totalMs, Math.max(0, alarmEndsAt - now))
```

- `Math.max(0, …)` floors at zero (never a negative clock); `Math.min(totalMs, …)`
  caps at full duration for the first second before `now` has ticked, and
  protects against system clock jumps. `Math.ceil(remainingMs / 1000)` then makes
  the clock read `5:00` immediately instead of `4:59`.

```tsx
const low = !expired && remainingSeconds <= LOW_ALARM_SECONDS   // 60s
const barColor = expired ? 'bg-rose-500'
  : low ? 'bg-amber-400'
  : 'bg-gradient-to-r from-sky-400 to-emerald-400'
```

- The only "game feedback" logic: three tension states by color. The bar animates
  with `transition-[width] duration-1000 ease-linear` so the 1-second ticks look
  continuous instead of stepping.

**Tailwind, not inline styles:**

- Every old `style={{ ... }}` became classes: `absolute left-1/2 top-1/2
  -translate-x-1/2 -translate-y-1/2` (centering), `rounded-2xl border
  border-white/10 bg-black/40 backdrop-blur-md` (the glass panel shared with
  `DialogueHud` / `MissionHud`), `pointer-events-none` on every in-game panel so
  the crosshair never eats a click.
- Micro-labels use `text-[10px] font-semibold uppercase tracking-[0.22em]`, the
  same "eyebrow" style already used in `MissionHud` and `DialogueHud`.
- `Key` renders a real `<kbd>` with `font-sans` (the global `* { font-family }`
  rule would otherwise leave it on the monospace UA default) — keycaps are a
  cheap, very "game UI" signal.

**`index.css` — one theme entry:**

```css
--animate-hud-in: hud-in 0.35s ease-out;
@keyframes hud-in { from { opacity: 0; transform: translateY(-0.5rem) scale(0.98) } … }
```

- Tailwind v4 turns `--animate-*` theme vars into `animate-*` utilities, so
  `animate-hud-in` now works exactly like the existing `animate-dialogue-in` /
  `animate-mission-in`. Panels fade + settle in on pointer lock.

## 4. What you see now

- **Before click:** the start overlay — alarm icon, `Before the alarm`, the
  objective, keycaps, and `You have 5 minutes before the alarm rings.` Click
  anywhere → pointer lock.
- **On lock:** the HUD stack fades in. A green→emerald bar slowly drains; the
  clock counts `5:00 → 0:00`. Under 60s the clock and bar turn amber; at zero
  the label flips to `Time's up` in rose. The crosshair sits dead-center; the
  grounded pill and keycap bar stay pinned to the bottom corners.
- **ESC:** immediately back to the start overlay, and the next lock starts a
  fresh 5:00.

## 5. How to test / debug this yourself

- **Countdown test:** lock in, watch the clock for ~10s — it should drop one
  second per second. If it jumps or freezes, the interval isn't running: check
  `alarmEndsAt` is non-null (the lock effect must have fired `startAlarm`).
- **Reset test:** lock, wait, press ESC, lock again — clock is back to `5:00`.
  If it resumes mid-countdown, `resetAlarm` isn't wired to the unlock branch.
- **Color test:** temporarily pass `alarmMinutes={0.05}` (3s) to
  `<PlayerHud … />` in `WorldViewport.tsx` — you should see amber under a minute
  then rose at zero, without touching any other code.
- **Layout test:** lock in and orbit — panels stay pinned to their corners, only
  the crosshair is centered, and no panel blocks a click (they're all
  `pointer-events-none`).
- **Re-render sanity:** the only component re-rendering per second is
  `PlayerHud`. If the 3D scene re-renders every second, someone subscribed the
  ticker higher up — keep `now` local to this file.

## 6. Common beginner mistakes (HUD edition)

1. **Decrementing a counter instead of using a timestamp:** drift and
   multi-tab fights. Store the *end time*; derive the remainder.
2. **`setState` synchronously inside an effect:** `setNow(Date.now())` in the
   ticker body triggers a cascading render and `oxlint`'s
   `react(set-state-in-effect)`. Clamp the derived value instead of force-setting
   state on mount.
3. **Letting the crosshair swallow clicks:** every in-game panel needs
   `pointer-events-none`; only the start overlay should be clickable.
4. **Mixing inline styles with Tailwind:** defeats theming and the shared glass
   look. Everything here is classes.
5. **Restarting the alarm on every re-render:** `startAlarm` guards on
   `alarmEndsAt !== null` for exactly this reason — don't remove the guard.

## 7. Series checkpoint

- [x] Crash-free, screen-pinned HUD (doc 11)
- [x] Zustand HUD store (doc 13)
- [x] Tailwind, data-driven, gamified HUD with an alarm objective — this step

Natural next steps: **failing the alarm** (trigger a `DialogueHud` line from the
store when `remainingMs` hits 0), a **discovered-zones counter** feeding the same
banner, or converting the alarm into a real scoring loop (missions completed
before the alarm = score).

Related files: `src/components/GameSystem/PlayerHud.tsx`,
`src/store/playerHudStore.ts`, `src/index.css`,
`src/components/ui/Chat/WorldViewport.tsx`
Packages: none new — phosphor icons and Tailwind were already in the project
