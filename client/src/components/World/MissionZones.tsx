import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { useMissionStore } from '../../store/missionStore'
import { usePlayerStore } from '../../store/playerStore'
import type { MissionConfig } from './worldTypes'

interface TriggerZone {
  id: string
  x: number
  z: number
  radius: number
}

/**
 * Invisible mission triggers. Each frame the player's ground position is checked
 * against every mission zone and the zone is completed on entry. Nothing is
 * rendered — the mission HUD is the only feedback the player sees.
 */
export default function MissionZones({ missions }: { missions: MissionConfig[] }) {
  const zones = useMemo<TriggerZone[]>(
    () =>
      missions.map((mission) => ({
        id: mission.id,
        x: mission.zone.position[0],
        z: mission.zone.position[2],
        radius: mission.zone.radius,
      })),
    [missions],
  )

  useFrame(() => {
    const player = usePlayerStore.getState().position
    const { completeMission } = useMissionStore.getState()
    for (const zone of zones) {
      if (Math.hypot(player.x - zone.x, player.z - zone.z) <= zone.radius) {
        completeMission(zone.id)
      }
    }
  })

  return null
}
