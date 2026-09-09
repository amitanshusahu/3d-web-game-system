import { useSyncExternalStore } from 'react'

export interface PlayerHudState {
  isPointerLocked: boolean
  isGrounded: boolean
}

let snapshot: PlayerHudState = { isPointerLocked: false, isGrounded: false }
const listeners = new Set<() => void>()

function getSnapshot(): PlayerHudState {
  return snapshot
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setPlayerHud(patch: Partial<PlayerHudState>): void {
  const next: PlayerHudState = { ...snapshot, ...patch }
  if (next.isPointerLocked === snapshot.isPointerLocked && next.isGrounded === snapshot.isGrounded) return
  snapshot = next
  listeners.forEach((listener) => listener())
}

export function usePlayerHud(): PlayerHudState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
