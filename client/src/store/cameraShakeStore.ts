import { create } from 'zustand'

interface StartShakeOptions {
  /** How long the shake lasts, in milliseconds. */
  durationMs: number
  /** Peak camera displacement in world units. Defaults to DEFAULT_SHAKE_INTENSITY. */
  intensity?: number
}

interface CameraShakeStore {
  /**
   * Wall-clock timestamp (ms) the shake stops, or null while the camera is
   * still. Stored as an absolute time (not a countdown) so the per-frame camera
   * code can derive the current strength from any tick without the store
   * owning a timer — same idea as `alarmEndsAt` in playerHudStore.
   */
  shakeEndsAt: number | null
  /** Total length of the active shake, used to fade the offset out. */
  shakeDurationMs: number
  /** Peak camera displacement in world units. */
  intensity: number
  /** Begin a shake. Restarts and overrides any shake already in progress. */
  startShake: (options: StartShakeOptions) => void
  /** Stop the shake immediately. No-op while idle. */
  stopShake: () => void
}

export const DEFAULT_SHAKE_INTENSITY = 0.35
export const DEFAULT_SHAKE_DURATION_MS = 1200

export const useCameraShakeStore = create<CameraShakeStore>()((set, get) => ({
  shakeEndsAt: null,
  shakeDurationMs: DEFAULT_SHAKE_DURATION_MS,
  intensity: DEFAULT_SHAKE_INTENSITY,
  startShake: ({ durationMs, intensity }) => {
    set({
      shakeEndsAt: Date.now() + durationMs,
      shakeDurationMs: durationMs,
      intensity: intensity ?? DEFAULT_SHAKE_INTENSITY,
    })
  },
  stopShake: () => {
    if (get().shakeEndsAt === null) return
    set({ shakeEndsAt: null })
  },
}))
