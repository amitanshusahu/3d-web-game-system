import type { ComponentType } from 'react'
import { TestMap, TestMapSpawnZones } from '../Rendering/map/TestMap'
import type { SpawnZone } from './worldTypes'
import { StrongHoldAnimated, StrongHoldSpawnZones } from '../Rendering/map/StrongHoldAnimated'

export interface MapEntry {
  component: ComponentType
  spawnZones: SpawnZone[]
}

/** Global key-value registry: map id -> map component + its spawn zones */
export const MAP_REGISTRY: Record<string, MapEntry> = {
  testMap: { component: TestMap, spawnZones: TestMapSpawnZones },
  strongHold: { component: StrongHoldAnimated, spawnZones: StrongHoldSpawnZones },
}

/** Clearance above the zone's floor surface the player spawns at */
const PLAYER_SPAWN_CLEARANCE = 1

const SPAWN_ORIGIN: [number, number, number] = [0, PLAYER_SPAWN_CLEARANCE, 0]

/** Player spawn: a random point inside a random spawn zone of the given map */
export function getPlayerSpawnPosition(mapId: string): [number, number, number] {
  const zones = MAP_REGISTRY[mapId]?.spawnZones ?? []

  if (zones.length === 0) {
    console.warn(`[mapRegistry] No spawn zones for map "${mapId}", spawning at origin`)
    return SPAWN_ORIGIN
  }

  const [x, z, radius, floorY = 0] = zones[Math.floor(Math.random() * zones.length)]

  // Uniform sampling inside the zone disk
  const angle = Math.random() * Math.PI * 2
  const distance = Math.sqrt(Math.random()) * radius

  return [
    x + Math.cos(angle) * distance,
    floorY + PLAYER_SPAWN_CLEARANCE,
    z + Math.sin(angle) * distance,
  ]
}
