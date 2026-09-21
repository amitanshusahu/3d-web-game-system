# 16. Mission Board — Fantasy Frame Reuse & Pre-Run Briefing (Beginner Notes)

> Goal of this step: show the world's missions **only before the player clicks to
> explore**, in a big fantasy panel that matches the `SuccessDialogue` art, and
> add the reminder *"Complete the missions and explore the map before the alarm
> goes off and you wake up."*
> Prereq: `15_player_hud_gamification.md` (the HUD/alarm stack) and the mission
> store from `MissionZones` / `missionStore.ts`.

## 0. What we just did (TL;DR)

1. Extracted the big fantasy SVG out of `SuccessDialogue.tsx` into a reusable
   `ui/Hud/FantasyFrame.tsx` that takes `children` and a `boxHeight`.
2. Rewrote `SuccessDialogue` as a thin wrapper over `FantasyFrame` — same props,
   same pixels as before.
3. Added `ui/Mission/MissionBoard.tsx`: the mission list + alarm reminder inside
   a tall `FantasyFrame`.
4. `PlayerHud`'s `StartOverlay` now renders `MissionBoard` instead of the plain
   objective text; the "Click to explore" pill and keycaps stay.
5. `MissionHud` was trimmed to the in-game "Mission complete" toast only, so the
   full list lives on the pre-explore screen and nowhere else.
6. `tsc -b` clean (only pre-existing errors in unrelated files), `oxlint` clean.

## 1. Why the mission list moved

Before this, `MissionHud` drew a small list in the top-right **all the time** —
including behind the start overlay. The request was the opposite: missions are a
*pre-run briefing*. So the split became:

```
pointer NOT locked  →  PlayerHud.StartOverlay  →  MissionBoard (full fantasy panel)
pointer locked      →  in-game HUD             →  MissionHud (toast only)
```

One source of truth (`missionStore`), two very different presentations.

## 2. `FantasyFrame`: one SVG, two sizes

The original `SuccessDialogue` hard-coded its own SVG, so a second box would mean
copy-pasting ~440 lines of paths. Instead we made the frame a component:

```tsx
<FantasyFrame className='w-125' boxHeight={67}>…text…</FantasyFrame>
```

`boxHeight` is measured in **SVG user units** (the viewBox is 298 wide). The
trick is that the art is anchored to edges:

- the **main rect** just gets a new `height`,
- the two **bottom** wing groups (`#left-wing`, `#right-wing`) are pushed down by
  `dy = boxHeight - 67`,
- the top ornaments + dragon stay where they are.

```tsx
const dy = boxHeight - BASE_BOX_HEIGHT            // 170 - 67 = 103
const viewHeight = BASE_VIEW_HEIGHT + dy          // 115 + 103 = 218
…
<g id="left-wing"  transform={`translate(0, ${dy})`}>
<g id="right-wing" transform={`translate(0, ${dy})`}>
```

The `viewBox` grows to `0 0 298 218`, so the frame keeps its aspect ratio at any
rendered width — `w-[38rem]` becomes ~608×445px. Nothing is stretched, so the
corner ornaments never distort.

### The content overlay

Text can't live in the SVG (won't reflow), so `FantasyFrame` positions an
absolutely-placed `<div>` exactly over the rect:

```tsx
const overlayStyle = {
  left:   `${(12.5 / 298) * 100}%`,   // rect x
  top:    `${(25.5 / viewHeight) * 100}%`, // rect y
  width:  `${(273  / 298) * 100}%`,   // rect width
  height: `${(boxHeight / viewHeight) * 100}%`,
}
```

Because CSS percentages here resolve against the wrapper `div` (which is sized by
the SVG), the overlay tracks the panel for free. `contentClassName` lets each
caller choose centering (dialogue) vs. a left-aligned column (mission board).

> Why inline `style` for the overlay instead of Tailwind arbitrary values like
> the old `left-[4.2%]`? The numbers are now *computed from a prop*, so they
> can't be compile-time class names. Static styling is still Tailwind; only the
> dynamic geometry is inline.

## 3. The dragon clearance rule (the one geometry gotcha)

The dragon ornament sits on the **top-center** of the panel and its bottom edge
is at viewBox `y = 52`. The rect top is `y = 25.5`, so the dragon overlaps the
first `26.5` units of the content area. In a short `SuccessDialogue` the centered
text naturally falls below it; a top-aligned list would slide right under the
wings.

The overlap in **pixels** is width-locked:

```
overlap_px = 26.5 × (renderedWidth / 298)
           = 26.5 × (608 / 298) ≈ 54px
```

So `MissionBoard` opens with `pt-16` (64px) — content starts below the dragon for
the same reason the bottom padding (`pb-14`) clears the bottom wing corners.
If you resize `FRAME_WIDTH`, keep padding ≥ those two overlaps.

## 4. Reading the mission store

`MissionBoard` is purely a view over `missionStore`:

```tsx
const missions = useMissionStore((s) => s.missions)
const completedIds = useMissionStore((s) => s.completedIds)
```

`Experience` fills it (`setMissions(worldConfig.missions ?? [])`) as soon as the
world mounts, so the board is populated by the time the canvas is interactive.
Completed missions render struck-through with a check — useful after an ESC and
re-lock, where progress persists.

## 5. How to test / debug this yourself

- **Frame only:** open `/svg` — `SuccessDialogue` should look *identical* to
  before (it now renders through `FantasyFrame` with the default `boxHeight`).
- **Tall frame:** temporarily set `boxHeight={170}` on the `/svg` example — the
  panel grows downward and the bottom wings ride down with it; the dragon and
  top ornaments stay put.
- **Board:** start a world and *don't* click — you should see the mission panel,
  the reminder line, and "Click to explore". Lock in (click) → the panel is gone.
- **Toast:** with `?missionDebug=1` walk into a mission ring — the "Mission
  complete" toast still fires during play (`MissionHud`), even though the list
  does not.

## 6. Common beginner mistakes (frame edition)

1. **Stretching the SVG** (`preserveAspectRatio="none"`) to make a tall box —
   smears every wing. Extend the rect and move the edge-anchored groups instead.
2. **Rendering text inside `<svg>`** — it won't wrap or reflow. Use the overlay
   `<div>`.
3. **Assuming percentage padding** can clear the dragon — CSS `padding-%` is
   relative to *width*, so prefer the width-derived pixel value above.
4. **Two mission lists** — pick one home for the full list. Here it's the start
   overlay; `MissionHud` keeps only feedback.

Related files: `src/components/ui/Hud/FantasyFrame.tsx`,
`src/components/ui/Hud/SuccessDialogue.tsx`,
`src/components/ui/Mission/MissionBoard.tsx`,
`src/components/ui/Mission/MissionHud.tsx`,
`src/components/GameSystem/PlayerHud.tsx`,
`src/store/missionStore.ts`. Packages: none new.
