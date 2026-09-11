import { useEffect, useMemo, useState } from 'react'
import * as THREE from 'three'
import { Clone, useGLTF } from '@react-three/drei'
import { RigidBody, useRapier } from '@react-three/rapier'
import type { SpawnZone, WorldObjectConfig } from './worldTypes'

const MAX_PLACEMENT_ATTEMPTS = 20
const RAY_ORIGIN_Y = 60
const RAY_LENGTH = 120

interface Placement {
  position: [number, number, number]
  rotationY: number
}

interface Bounds {
  half: [number, number, number]
  centerY: number
  bottomOffset: number
  scale: number
}

export function WorldObject({ config, defaultZone, spawnZones, scatterSpot }: {
  config: WorldObjectConfig
  defaultZone: number
  spawnZones: SpawnZone[]
  /** Pre-planned scatter copy: deterministic x/z + rotation, skips the random zone search */
  scatterSpot?: { x: number; z: number; rotationY: number }
}) {
  const { scene } = useGLTF(config.model)
  const { world, rapier } = useRapier()
  const [placement, setPlacement] = useState<Placement | null>(null)

  const bounds = useMemo<Bounds>(() => {
    const scale = config.scale ?? 1
    if (config.footprint) {
      return { half: config.footprint, centerY: 0, bottomOffset: 0, scale }
    }
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const halfXZ = Math.max(Math.abs(box.min.x), Math.abs(box.max.x), Math.abs(box.min.z), Math.abs(box.max.z)) * scale
    return {
      half: [halfXZ + 0.1, (size.y * scale) / 2 + 0.1, halfXZ + 0.1],
      centerY: box.getCenter(new THREE.Vector3()).y * scale,
      bottomOffset: box.min.y * scale,
      scale,
    }
  }, [scene, config])

  useEffect(() => {
    // Scatter copies prefer their own offsetY, falling back to the object-level one
    const offsetY = config.scatter?.offsetY ?? config.offsetY ?? 0
    if (config.position) {
      const [x, y, z] = config.position
      setPlacement({ position: [x, y + offsetY, z], rotationY: config.rotationY ?? 0 })
      return
    }

    const probe = new rapier.Cuboid(bounds.half[0], bounds.half[1], bounds.half[2])
    const identityRotation = { x: 0, y: 0, z: 0, w: 1 }
    let cancelled = false
    let timeout: ReturnType<typeof setTimeout> | undefined
    let attempts = 0
    const MAX_GROUND_RETRIES = 150

    // Scatter copies use their pre-planned spot: one ground-snap attempt only,
    // so a cold load behaves exactly like a hot reload (no fallback stampede).
    const candidateSpots = scatterSpot
      ? [{ x: scatterSpot.x, z: scatterSpot.z, rotationY: config.rotationY ?? scatterSpot.rotationY }]
      : Array.from({ length: MAX_PLACEMENT_ATTEMPTS }, () => {
        const zone = spawnZones[(config.zone ?? defaultZone) % spawnZones.length]
        return {
          x: zone[0] + (Math.random() * 2 - 1) * zone[2],
          z: zone[1] + (Math.random() * 2 - 1) * zone[2],
          rotationY: config.rotationY ?? Math.random() * Math.PI * 2,
        }
      })

    const tryPlace = () => {
      if (cancelled) return
      let groundMissing = false

      for (const candidate of candidateSpots) {
        // Snap the model's base to the ground surface under the candidate spot
        const ray = new rapier.Ray({ x: candidate.x, y: RAY_ORIGIN_Y, z: candidate.z }, { x: 0, y: -1, z: 0 })
        const hit = world.castRay(ray, RAY_LENGTH, true)
        if (!hit) {
          // On a cold load the ground collider may not exist yet when this
          // effect first runs (hot reloads reuse the ready physics world),
          // so remember to retry instead of treating it as "outside the map".
          groundMissing = true
          if (scatterSpot) break
          continue
        }
        const position: [number, number, number] = [candidate.x, RAY_ORIGIN_Y - hit.timeOfImpact - bounds.bottomOffset + offsetY, candidate.z]

        // Reject the spot when the model's bounding volume overlaps any collider
        // (probe lifted slightly so resting exactly on the floor doesn't count as overlap)
        const probeCenter = { x: candidate.x, y: position[1] + bounds.centerY + bounds.half[1] + 0.05, z: candidate.z }
        if (world.intersectionWithShape(probeCenter, identityRotation, probe)) {
          if (scatterSpot) break
          continue
        }
        setPlacement({ position, rotationY: candidate.rotationY })
        return
      }

      if (scatterSpot) {
        if (groundMissing && attempts++ < MAX_GROUND_RETRIES) {
          timeout = setTimeout(tryPlace, 60)
          return
        }
        // Scatter copy found no ground (e.g. outside the map): stay hidden rather
        // than stacking onto the zone center.
        console.warn(`[WorldObject] Scatter copy of ${config.model} missed the ground, hiding it`)
        return
      }

      const zone = spawnZones[(config.zone ?? defaultZone) % spawnZones.length]
      // No clear spot found: fall back to the zone center on the ground
      const ray = new rapier.Ray({ x: zone[0], y: RAY_ORIGIN_Y, z: zone[1] }, { x: 0, y: -1, z: 0 })
      const hit = world.castRay(ray, RAY_LENGTH, true);
      console.log('[WorldObject] Spawn debug:', { model: config.model, fallback: true, zone })
      setPlacement({
        position: [zone[0], RAY_ORIGIN_Y - (hit?.timeOfImpact ?? RAY_ORIGIN_Y) - bounds.bottomOffset + offsetY, zone[1]],
        rotationY: config.rotationY ?? 0,
      })
    }

    tryPlace()
    return () => {
      cancelled = true
      if (timeout) clearTimeout(timeout)
    }
  }, [config, bounds, world, rapier, spawnZones, defaultZone, scatterSpot])

  if (!placement) return null

  const model = <Clone object={scene} scale={bounds.scale} />
  if (config.physics === 'decor') {
    return <group position={placement.position} rotation={[0, placement.rotationY, 0]}>{model}</group>
  }
  return (
    <RigidBody type="fixed" colliders="cuboid" position={placement.position} rotation={[0, placement.rotationY, 0]}>
      {model}
    </RigidBody>
  )
}
