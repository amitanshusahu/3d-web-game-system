export const SFX_REGISTRY = {
  animal: [
    '/ignore/sounds/animal/horse.mp3',
  ],
  deepSea: [
    '/ignore/sounds/deepSea/creepy-whale.mp3',
    '/ignore/sounds/deepSea/distant-growl.mp3',
    '/ignore/sounds/deepSea/growl.mp3',
    '/ignore/sounds/deepSea/haunting-whale.mp3',
    '/ignore/sounds/deepSea/long-howl.mp3',
    '/ignore/sounds/deepSea/underwater.mp3',
    '/ignore/sounds/deepSea/whale.mp3',
  ],
  dragon: [
    '/ignore/sounds/dragon/dragon-distant-howling.mp3',
    '/ignore/sounds/dragon/dragon-flaping-winds.mp3',
    '/ignore/sounds/dragon/dragon-roar-near.mp3',
    '/ignore/sounds/dragon/high-growl.mp3',
    '/ignore/sounds/dragon/low-growl.mp3',
  ],
  forest: [
    '/ignore/sounds/forest/crickets-forest-night.mp3',
    '/ignore/sounds/forest/early-forest.mp3',
  ],
  props: [
    '/ignore/sounds/props/ancient-mechanical-gears-city.mp3',
    '/ignore/sounds/props/fire-crackling.mp3',
    '/ignore/sounds/props/magical-opening.mp3',
    '/ignore/sounds/props/magic-item.mp3',
  ],
  rain: [
    '/ignore/sounds/rain/rain.mp3',
  ],
  thunder: [
    '/ignore/sounds/thunder/dry-thunder.mp3',
    '/ignore/sounds/thunder/long-heavy-thunder.mp3',
    '/ignore/sounds/thunder/loud-thunder.mp3',
  ],
  water: [
    '/ignore/sounds/water/stream.mp3',
  ],
  wind: [
    '/ignore/sounds/wind/desert-wind.mp3',
    '/ignore/sounds/wind/winter-wind.mp3',
  ],
} as const

export type SfxCategory = keyof typeof SFX_REGISTRY

export const SFX_CATEGORIES = Object.keys(SFX_REGISTRY) as SfxCategory[]

export function getSfx(category: SfxCategory): string[] {
  return [...SFX_REGISTRY[category]]
}

export function getRandomSfx(category: SfxCategory): string | undefined {
  const clips = SFX_REGISTRY[category]
  if (!clips) return undefined
  return clips[Math.floor(Math.random() * clips.length)]
}

export const sounds: Record<SfxCategory, readonly string[]> = SFX_REGISTRY
