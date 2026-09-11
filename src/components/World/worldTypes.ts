/** [x, z, radius] plus an optional floor surface Y used for player spawn */
export type SpawnZone = [x: number, z: number, radius: number, y?: number]

export interface WorldObjectConfig {
  model: string
  /** Explicit placement, skips spawn zone resolution */
  position?: [number, number, number]
  /** Spawn zone index to place the object in (defaults to round-robin over zones) */
  zone?: number
  /** Fixed Y rotation; random when omitted */
  rotationY?: number
  scale?: number
  /** Collision probe half extents override; defaults to the model bounding box */
  footprint?: [number, number, number]
  /** 'fixed' adds a static collider, 'decor' is visual only (default 'fixed') */
  physics?: 'fixed' | 'decor'
}

export interface WorldConfig {
  map: string
  objects: WorldObjectConfig[]
}
