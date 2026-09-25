import type { ComponentType } from 'react'
import type { ThreeElements } from '@react-three/fiber'
import { SkeletonDragon } from './components/Rendering/models/SkeletonDragon'

export type ObjectModelProps = ThreeElements['group']
export type ObjectModelComponent = ComponentType<ObjectModelProps>

export type ObjectModelEntry =
  | { kind: 'path'; path: string; defaultScale?: number; footprint?: [number, number, number] }
  | { kind: 'component'; component: ObjectModelComponent; defaultScale?: number; footprint?: [number, number, number] }

/**
 * Client-owned model registry.
 * The backend sends only a model NAME (e.g. "house"); this registry decides
 * how that name loads and renders — a plain GLB path or a bespoke component.
 */
export const MODEL_REGISTRY: Record<string, ObjectModelEntry> = {
  // creatures
  animated_bird_pigeon: { kind: 'path', path: '/models/ignore/creatures/animated_bird_pigeon.glb' },
  'animated-haunted-zombie': { kind: 'path', path: '/models/ignore/creatures/animated-haunted-zombie.glb' },
  armored_horse: { kind: 'path', path: '/models/ignore/creatures/armored_horse.glb' },
  armored_horse_edited: { kind: 'path', path: '/models/ignore/creatures/armored_horse_edited.glb' },
  deer: { kind: 'path', path: '/models/ignore/creatures/deer.glb' },
  'deer.bak': { kind: 'path', path: '/models/ignore/creatures/deer.bak.glb' },
  dragon_animated: { kind: 'path', path: '/models/ignore/creatures/dragon_animated.glb' },
  forest_guardian: { kind: 'path', path: '/models/ignore/creatures/forest_guardian.glb' },
  nilou_1_genshin_impact: { kind: 'path', path: '/models/ignore/creatures/nilou_1_genshin_impact.glb' },
  phoenix_bird: { kind: 'path', path: '/models/ignore/creatures/phoenix_bird.glb' },
  ryuri: { kind: 'path', path: '/models/ignore/creatures/ryuri.glb' },
  skeleton_dragon: { kind: 'component', component: SkeletonDragon },
  skeleton_dragon_opt: { kind: 'path', path: '/models/ignore/original-backup/creatures/skeleton_dragon.glb' },
  the_human_deer_animated_horror: { kind: 'path', path: '/models/ignore/creatures/the_human_deer_animated_horror.glb' },
  unicorn: { kind: 'path', path: '/models/ignore/creatures/unicorn.glb' },
  unicorn_wip: { kind: 'path', path: '/models/ignore/creatures/unicorn_wip.glb' },
  velkhana: { kind: 'path', path: '/models/ignore/creatures/velkhana.glb' },
  yelan_genshin_impact: { kind: 'path', path: '/models/ignore/creatures/yelan_genshin_impact.glb' },
  blue_scrub_bush: { kind: 'path', path: '/models/ignore/fantacy/blue_scrub_bush.glb' },
  glowing_mushroom: { kind: 'path', path: '/models/ignore/fantacy/glowing_mushroom.glb' },
  backrooms_vr: { kind: 'path', path: '/models/ignore/map/backrooms_vr.glb' },
  bazaar_track: { kind: 'path', path: '/models/ignore/map/bazaar_track.glb' },
  cloud_station: { kind: 'path', path: '/models/ignore/map/cloud_station.glb' },
  enchanted_forest_environment: { kind: 'path', path: '/models/ignore/map/enchanted_forest_environment.glb' },
  'fast_racing_3d_-_night_city': { kind: 'path', path: '/models/ignore/map/fast_racing_3d_-_night_city.glb' },
  mobile_home: { kind: 'path', path: '/models/ignore/map/mobile_home.glb' },
  'neo-tokyo': { kind: 'path', path: '/models/ignore/map/neo-tokyo.glb' },
  robin_hood_in_sherwood_forest: { kind: 'path', path: '/models/ignore/map/robin_hood_in_sherwood_forest.glb' },
  the_last_stronghold_animated_floating: { kind: 'path', path: '/models/ignore/map/the_last_stronghold_animated_floating.glb' },
  the_last_stronghold_animated_floating_collider: { kind: 'path', path: '/models/ignore/map/the_last_stronghold_animated_floating_collider.glb' },
  bush: { kind: 'path', path: '/models/ignore/nature/bush.glb' },
  flower_bush: { kind: 'path', path: '/models/ignore/nature/flower_bush.glb' },
  flowers: { kind: 'path', path: '/models/ignore/nature/flowers.glb' },
  mushroom: { kind: 'path', path: '/models/ignore/nature/mushroom.glb' },
  oak_trees: { kind: 'path', path: '/models/ignore/nature/oak_trees.glb' },
  obj_nat_rock_01: { kind: 'path', path: '/models/ignore/nature/obj_nat_rock_01.glb' },
  pine_tree: { kind: 'path', path: '/models/ignore/nature/pine_tree.glb' },
  rock_b: { kind: 'path', path: '/models/ignore/nature/rock_b.glb' },
  sakura_tree_1mb: { kind: 'path', path: '/models/ignore/nature/sakura_tree_1mb.glb' },
  stylized_hand_painted_tree_toon: { kind: 'path', path: '/models/ignore/nature/stylized_hand_painted_tree_toon.glb' },
  animated_old_chest: { kind: 'path', path: '/models/ignore/props/animated_old_chest.glb' },
  bench: { kind: 'path', path: '/models/ignore/props/bench.glb' },
  campfire: { kind: 'path', path: '/models/ignore/props/campfire.glb' },
  chair: { kind: 'path', path: '/models/ignore/props/chair.glb' },
  lantern: { kind: 'path', path: '/models/ignore/props/lantern.glb' },
  'sci_fi_chest_treasurechestchallenge.': { kind: 'path', path: '/models/ignore/props/sci_fi_chest_treasurechestchallenge..glb' },
  table: { kind: 'path', path: '/models/ignore/props/table.glb' },
  'derby_car._free': { kind: 'path', path: '/models/ignore/derby_car._free.glb' },
  drone: { kind: 'path', path: '/models/ignore/drone.glb' },
  crystal: { kind: 'path', path: '/models/ignore/special/crystal.glb' },
  portal: { kind: 'path', path: '/models/ignore/special/portal.glb' },
  'portal-animated': { kind: 'path', path: '/models/ignore/special/portal-animated.glb' },
  ancient_ruins_pack: { kind: 'path', path: '/models/ignore/structure/ancient_ruins_pack.glb' },
  city_ruins_environment: { kind: 'path', path: '/models/ignore/structure/city_ruins_environment.glb' },
  farm_house: { kind: 'path', path: '/models/ignore/structure/farm_house.glb' },
  high_school: { kind: 'path', path: '/models/ignore/structure/high_school.glb' },
  house: { kind: 'path', path: '/models/ignore/structure/house.glb' },
  house_asset: { kind: 'path', path: '/models/ignore/structure/house_asset.glb' },
  kickelhahn_tower: { kind: 'path', path: '/models/ignore/structure/kickelhahn_tower.glb' },
  old_brick_building__lowpoly: { kind: 'path', path: '/models/ignore/structure/old_brick_building__lowpoly.glb' },
  grass: { kind: 'path', path: '/models/ignore/terrain/grass.glb' },
  'moist-stones': { kind: 'path', path: '/models/ignore/terrain/moist-stones.glb' },
  pile_burned_trash: { kind: 'path', path: '/models/ignore/terrain/pile_burned_trash.glb' },
  sand_rock_pack: { kind: 'path', path: '/models/ignore/terrain/sand_rock_pack.glb' },
  water_wave_long: { kind: 'path', path: '/models/ignore/terrain/water_wave_long.glb' },
  // weapons
  'm4a1-gun-fps': { kind: 'path', path: '/models/ignore/character/m4a1-gun-fps.glb' },
  'm4a1-gun-fps-optimized': { kind: 'path', path: '/models/ignore/weapon/m4a1.glb' },
}

export function resolveObjectModel(name: string): ObjectModelEntry | undefined {
  return MODEL_REGISTRY[name]
}

export function isKnownObjectModel(name: string): boolean {
  return name in MODEL_REGISTRY
}

export function listObjectModels(): string[] {
  return Object.keys(MODEL_REGISTRY)
}
