import { useMemo } from 'react'
import type { ThreeElements } from '@react-three/fiber'
import { getMapSpawnZones, MAP_REGISTRY } from './mapRegistry'
import { WorldObject } from './WorldObject'
import type { WorldConfig } from './worldTypes'

export function World({ config, ...props }: ThreeElements['group'] & { config: WorldConfig }) {
  const entry = MAP_REGISTRY[config.map]
  // Zones resolved to world space so objects land on the scaled map geometry
  const spawnZones = useMemo(() => getMapSpawnZones(config.map), [config.map])
  if (!entry) {
    console.warn(`[World] Unknown map "${config.map}". Available maps: ${Object.keys(MAP_REGISTRY).join(', ')}`)
    return null
  }
  const MapComponent = entry.component
  const mapScale = entry.mapScale ?? 1
  return (
    <group {...props}>
      <group scale={mapScale}>
        <MapComponent />
      </group>
      {config.objects.map((object, index) => (
        <WorldObject
          key={`${object.model}-${index}`}
          config={object}
          defaultZone={index}
          spawnZones={spawnZones}
        />
      ))}
    </group>
  )
}
