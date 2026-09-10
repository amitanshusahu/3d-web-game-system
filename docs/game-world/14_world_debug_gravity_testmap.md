# 14. World Debug Settings, Custom Gravity Field & Test Map (Beginner Notes) From Ecctrl

> Goal of this step: swap the empty hovercar + flat floor for a real **test playground** with **tweakable world settings** and **location-based gravity**. You can now pause physics, see colliders, kill global gravity, slow time, fall toward a planet core, stick inside a tower, and flip upside-down in the sky — all in one map.
> Prereq: `12_ecctrl_fps_player.md` (the `Player` we keep), `13_zustand_hud_store.md` (untouched HUD). This changes what the world contains and who owns gravity.
> Scope: only `src/` + `public/` changes are noted here. `example/` is the upstream reference this was ported from — deliberately ignored.

## 0. What we just did (TL;DR)

1. Added `public/models/testMap.glb` (~95 KB) — the Blender-built playground mesh set (floor, ramps, track, pillar, tower jumps, seesaw, balls, boxes).
2. Added `src/components/Rendering/map/TestMap.tsx` (281 lines) — loads that GLB, assigns colliders, animates kinematic platforms, and applies custom gravity to dynamic props each frame.
3. Added `src/components/GameSystem/GravityField.tsx` (86 lines) — a single `gravityField(objectPos)` function that returns a different gravity vector depending on where you are: planet sphere, tower cylinder (3 sub-zones), or sky fallback.
4. Replaced `src/App.tsx` with `src/Experience.tsx` (89 lines) — same Canvas/Lights/Player/HUD shell, plus leva World Settings, gravity registration, and `<TestMap />` instead of hovercar + flat floor. `src/main.tsx` now imports `Experience`.
5. Installed `leva` (`^0.10.1`) — the debug panel library behind World Settings.
6. Tweaked `src/components/GameSystem/Player.tsx` by one line: `enableToggleRun={false}` → `{true}` (tap Shift latches run instead of hold-to-sprint).

## 1. Mental model: who owns what now

```
Experience (src/Experience.tsx)
  ├── Leva panel → physicsDebug / paused / global gravity / slow-mo ref
  ├── GravityField → ONE function: position → gravity vector
  │     └── registered once into ecctrl's useCustomGravity store
  ├── <Physics gravity=[0,0,0] paused>   ← global gravity OFF on purpose
  │     ├── <TestMap />                  ← static + kinematic + dynamic props
  │     │     └── dynamic props call applyGravityField(body) every frame
  │     └── <Player /> (Ecctrl)          ← queries the same field internally
  └── <PlayerHud /> (outside Canvas, unchanged)
```

Key idea for beginners: before this step, Rapier had **one global gravity** (`[0,-9.81,0]`) pulling everything down. Now global gravity is `[0,0,0]` (off) and each body asks **"what is gravity at my position?"** — that is the `gravityField` function. Same 9.81 strength, different direction per zone. This is how Dream World will later get space zones, wall-walk towers, and floating islands without touching the player code.

Vocabulary (only 5 new words):

| Term | Plain English | Our use |
|------|---------------|---------|
| `gravityField` | Function `(position) => gravity vector` — answers "which way is down here?" | `GravityField.tsx`, registered in `Experience.tsx` |
| `applyGravityField` | Ecctrl helper that reads the field and pushes a body for one timestep | `TestMap.tsx` calls it for seesaw + cubes + balls + blocks |
| `kinematicPosition` | A body we move by script (`setNextKinematicTranslation/Rotation`), physics moves the player out of its way | Platforms, spinning bar/ball/disk in `TestMap.tsx` |
| `instanced` | One mesh + many collider copies drawn in a single call — cheap crowds | Strips, cube pyramid, ball triangle via `createInstanceStack` |
| `leva / useControls` | Drop-in debug panel (sliders, checkboxes) bound to React values | `World Settings` panel in `Experience.tsx` |

## 2. Leva World Settings (`src/Experience.tsx`)

```tsx
const timeScale = useRef(1)
const [{ pausedPhysics, physicsDebug, physicsGravity }, setWorldSettings] = useControls(
  "World Settings",
  () => ({
    physicsDebug: false,
    pausedPhysics: true,
    physicsGravity: { value: [0, 0, 0] },
    slowMotion: { value: 1, min: 0.01, max: 1, step: 0.01,
      onChange: (value) => { timeScale.current = value } },
  }),
  { collapsed: true }
)

useEffect(() => {
  const timeout = setTimeout(() => setWorldSettings({ pausedPhysics: false }), 1000)
  return () => clearTimeout(timeout)
}, [setWorldSettings])
```

- **Why paused starts `true` for 1 second:** the GLB, Rapier world, and Ecctrl spawn all initialize on mount. Unpausing after 1000 ms avoids the player falling through a floor that isn't ready yet. Same trick as the upstream example.
- **`physicsGravity` defaults to `[0,0,0]`:** global Rapier gravity is OFF. If you set it back to `[0,-9.81,0]` in the panel you get double gravity (global + custom field) — bodies fall twice as fast. Leave at zero unless debugging the field itself.
- **`physicsDebug` checkbox:** passes to `<Physics debug={...}>` — draws all invisible colliders as wireframes. Use it to see why the player floats or clips.
- **`slowMotion` writes into a `ref`, not state:** `timeScale.current = value` avoids re-rendering the whole panel at 60 fps while dragging. `TestMap` reads that ref for its own kinematic clock (`mapTime += delta * timeScale`). Note: `Experience` currently renders plain `<TestMap />`, so it uses default `timeScale=1` — the slow-mo slider is wired up but not yet passed down. That is the next wiring step, not a bug in the panel.
- **`timeStep="vary"`** on `<Physics>`: lets Rapier accept variable frame deltas instead of fixed 1/60. Needed once you pause/slow/step time.

How this helps: you can now freeze the world, inspect colliders, zero out gravity, or slow to 1% speed from a panel — no code edits, no rebuilds.

## 3. GravityField — what it is, how it's used, how it helps

**What it is:** a hook-like function returning one stable callback:

```ts
gravityField = (objectPos: THREE.Vector3) => THREE.Vector3 // reused vector, no alloc
```

It checks zones top-to-bottom and returns the first match, strength always `9.81`:

- **Zone 1 — Sphere (planet) at `(0, 20, 0)`, radius 15:** returns `(center - pos).normalize() * 9.81`. Inside the ball, "down" points toward its core. Walk all around the inside of the `R10Ball` at `[0,20,0]`.
- **Zones 2–4 — Cylinder stack around `(x=0, z=110)`, radius 20, height `y 0–100`** (the tall `Pillar10X100` + spinning `PillarJumps` + top `R80Disk`):
  - Middle (`y 10–90`): returns `(axisPointAtSameHeight - pos)` — pulls horizontally toward the pillar axis, so you stick to the tower wall.
  - Bottom rim (`y < 10`) and top rim (`y >= 90`): compute the nearest point on the rim ring and return `(pos - rimPoint)` — gravity relative to the rim circle, so crossing the lip feels like rounding an edge instead of snapping.
- **Default fallback:** `(0, y > 50 ? +9.81 : -9.81, 0)`. Below `y=50` normal fall; above `y=50` gravity flips upward — the sky zone above the tower. Fly up to the disk at `y=102` to feel it.

**Performance tricks worth copying (beginner-friendly):** AABB pre-check (`|dx| < radius`) before any `sqrt`, squared-distance compares, two reused `THREE.Vector3` refs (`gravityDir`, `cylinderTempVec`) so the 60-fps callback never allocates, and `useCallback(..., [])` so the function identity is stable and the registration effect runs once.

**How it's used (two call sites, one registration):**

```tsx
// Experience.tsx — register once:
const { gravityField } = GravityField()
const setGravityField = useCustomGravity((state) => state.setGravityField)
useEffect(() => setGravityField(gravityField), [gravityField, setGravityField])
```

1. `Player` (Ecctrl internally) queries the field every physics step for the character — no code needed in `Player.tsx`.
2. `TestMap.tsx` manually pushes props that Rapier alone would leave floating (global gravity is zero):
```tsx
if (seesawRef.current) applyGravityField(seesawRef.current, world.timestep)
cubeInstancesRef.current?.forEach((body) => applyGravityField(body, world.timestep))
// same for ballInstancesRef, blockInstancesRef
```
Static (`fixed`) and scripted (`kinematicPosition`) bodies skip this — they don't simulate.

**How this will help Dream World:** adding a new biome = adding one `if` block returning a direction. No player refactor, no per-object gravity flags. Planet interiors, wall-walk towers, zero-G hubs, and sky flips all become data (center + radius + direction rule) instead of new systems.

## 4. TestMap (`src/components/Rendering/map/TestMap.tsx` + `public/models/testMap.glb`)

- **Asset:** GLB nodes (`BaseFloor`, `Track`, `Ramp10/20/30/45`, `RampJump`, `RampU`, `Pillar10X100`, `PillarJumps`, `R80Disk`, `R10Ball`, `Seesaw`, `Box1X1`, `R1Ball`, `Box4X6`, strips…) with a single `GridTexture` material cloned into 6 tints (`variantMaterials`) so zones read by color.
- **`createInstanceStack({ pos, rows, rowStep, itemStep, startCount, countStep })`:** nested loop building `InstancedRigidBodyProps[]` — row start = origin + row × rowStep, item = rowStart + column × itemStep. Used for 4 fixed strips, the cube pyramid (`rows 7, countStep -1`), ball triangle (`countStep +1`), and block row.
- **Fixed (never move):** big floor (`CuboidCollider [80,1,110]` + 3 `CylinderCollider` walls + disk at `[0,102,110]`), two friction test floors (`friction={0}` slick vs `friction={-0.4}` grippy), hull ramps, trimesh track/jumps/pillar.
- **Kinematic (scripted motion):** `platform01` (smootherstep ride `x=45`), `platform02` (slide + Y-spin), spinning bar (Z), spinning planet ball + transparent logo (Y), trimesh stair/disk (Y), spinning pillar jumps at `[0,50,110]` (Y). All driven in one `useFrame` via `setNextKinematicTranslation/Rotation` from `mapTime`.
- **Dynamic (simulated + custom gravity):** tilted seesaw (`density 200`) + instanced cubes/balls/blocks (`density 200`) — the only bodies fed to `applyGravityField`.

## 5. Small wiring changes (still `src/`)

- `src/main.tsx`: `import App from './App.tsx'` → `import Experience from './Experience.tsx'`. Entry point swap only.
- `src/App.tsx` → deleted; `src/Experience.tsx` → new root. Old hovercar + giant flat floor are kept as commented code inside `Experience.tsx` for reference.
- `src/components/GameSystem/Player.tsx`: `enableToggleRun={false}` → `{true}`. Tap Shift now latches run on/off instead of hold-to-sprint. Flip it back if you prefer FPS hold behavior.

## 6. How to test / debug this yourself

- **Panel test:** run, open `World Settings` (leva, top-right) → toggle `physicsDebug` → green wireframe colliders appear. Toggle `pausedPhysics` → world freezes.
- **Planet test:** fly/walk into the ball at `(0,20,0)` → jump → you fall back toward its center, not the floor.
- **Tower test:** go to `(0,*,110)`, mid-height → jump toward the pillar → you pull sideways into the wall. Climb above `y=50` → fallback flips and you drift upward toward the disk.
- **Friction test:** run across `[-35,0,-75]` (slick, `friction 0`) vs `[-35,0,-105]` (grippy) — stopping distance differs.
- **Double-gravity smell:** if everything falls unnaturally fast, `physicsGravity` in leva is non-zero on top of the field. Reset to `[0,0,0]`.
- **Slow-mo wiring check:** dragging `slowMotion` currently slows nothing in `src` because `<TestMap />` gets no `timeScale` prop yet — pass `timeScale={timeScale}` (and `paused`) like the example does to activate it.

## 7. Common beginner mistakes (world-edition)

1. **Re-enabling global gravity:** setting leva `physicsGravity` to `-9.81` while the field runs = double pull. One owner at a time.
2. **Forgetting `applyGravityField` on a new dynamic prop:** with global gravity at zero, any `RigidBody` you add without a field call floats forever. Copy the seesaw pattern.
3. **Applying the field to kinematic/static bodies:** they ignore forces — move them with `setNextKinematic*` instead.
4. **Allocating vectors in the field:** `new THREE.Vector3()` per call at 60 fps × N bodies = GC hitches. Reuse refs like the current code.
5. **Expecting slow-mo to work before prop-passing:** the ref + panel exist, but `<TestMap />` needs the `timeScale`/`paused` props wired before the slider does anything.

## 8. What's next (not yet done)

- [ ] Pass `paused` + `timeScale` into `<TestMap />` so leva slow-mo/pause actually drives kinematics (one-line prop change)
- [ ] Add leva toggles for individual gravity zones (sphere on/off, tower on/off) for isolated testing
- [ ] Visualize zones (transparent sphere at `(0,20,0)` r15 + wire cylinder at `(0,*,110)` r20) so players see where "down" changes
- [ ] Hide the planet-ball seam: player spawn `[20,2,20]` is outside all zones — pick a spawn that demos the field on load
- [ ] Decide `enableToggleRun` default (tap-latch vs hold-sprint) and match the HUD hint

Related files: `src/Experience.tsx`, `src/components/GameSystem/GravityField.tsx`, `src/components/Rendering/map/TestMap.tsx`, `src/components/GameSystem/Player.tsx`, `src/main.tsx`, `public/models/testMap.glb`
Packages: `leva` (new — `useControls`), `ecctrl/gravity` (`useCustomGravity`, `applyGravityField`), `@react-three/rapier` (`Physics paused/debug/timeStep`, `InstancedRigidBodies`, kinematic setters)
