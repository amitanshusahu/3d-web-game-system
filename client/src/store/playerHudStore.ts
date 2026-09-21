import { create } from 'zustand'

interface PlayerHudValues {
  isPointerLocked: boolean
}

interface PlayerHudStore extends PlayerHudValues {
  /**
   * Wall-clock timestamp (ms) the alarm rings, or null while no run is active.
   * Kept as an absolute time, not a countdown, so the HUD can re-derive the
   * remaining time from any tick without the store itself holding a timer.
   */
  alarmEndsAt: number | null
  setPlayerHud: (patch: Partial<PlayerHudValues>) => void
  /** Begin the alarm countdown. No-op while a run is already in progress. */
  startAlarm: (durationMs: number) => void
  /** Clear the run back to its pre-run state. */
  resetAlarm: () => void
}

export const usePlayerHudStore = create<PlayerHudStore>()((set, get) => ({
  isPointerLocked: false,
  alarmEndsAt: null,
  setPlayerHud: (patch) => {
    const currentState = get()
    const nextIsPointerLocked = patch.isPointerLocked ?? currentState.isPointerLocked
    if (nextIsPointerLocked === currentState.isPointerLocked) return
    set(patch)
  },
  startAlarm: (durationMs) => {
    if (get().alarmEndsAt !== null) return
    set({ alarmEndsAt: Date.now() + durationMs })
  },
  resetAlarm: () => {
    if (get().alarmEndsAt === null) return
    set({ alarmEndsAt: null })
  },
}))
