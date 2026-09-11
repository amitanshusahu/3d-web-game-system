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
