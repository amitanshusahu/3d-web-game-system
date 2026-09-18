import type { ChatHistoryEntry } from '../../../api/chat'
import type { WorldConfig } from '../../World/worldTypes'

export function parseWorld(response: ChatHistoryEntry['response'] | null | undefined): WorldConfig | null {
  if (!response) return null
  if (typeof response === 'object') return response as WorldConfig
  try {
    return JSON.parse(response) as WorldConfig
  } catch {
    return null
  }
}

export function objectCount(world: WorldConfig | null): number {
  if (!world || !Array.isArray(world.objects)) return 0
  return world.objects.length
}
