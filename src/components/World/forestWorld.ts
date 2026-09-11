import type { WorldConfig } from "./worldTypes";

const forestWorld: WorldConfig = {
  "mode": "open",
  "ground": { "size": 600 },
  "playerSpawn": [0, 1, 40],
  "objects": [
    {
      "model": "/models/ignore/structure/house.glb",
      "position": [28, -1.5, -14],
      "scale": 0.01
    },
    // {
    //   "model": "/models/ignore/structure/farm_house.glb",
    //   "position": [0, 0.1, 0],
    //   "rotationY": 0.4
    // },
    {
      "model": "/models/ignore/props/campfire.glb",
      "position": [10, -1, 12]
    },
    {
      "model": "/models/ignore/props/bench.glb",
      "position": [13, -1, 14],
      "rotationY": 2.2,
      "scale": 0.5
    },
    {
      "model": "/models/ignore/props/lantern.glb",
      "position": [7, -1, 10],
      "scale": 0.002
    },
    {
      "model": "/models/ignore/props/animated_old_chest.glb",
      "position": [-8, -1, 6],
      "rotationY": 0.7,
      "scale": 0.02
    },
    {
      "model": "/models/ignore/nature/oak_trees.glb",
      "scatter": { "count": 10, "center": [-80, -40], "radius": 70 },
      "scale": 10
    },
    {
      "model": "/models/ignore/nature/oak_trees.glb",
      "scatter": { "count": 12, "center": [-30, 80], "radius": 35 },
      "scale": 10
    },
    {
      "model": "/models/ignore/terrain/grass.glb",
      "scatter": { "count": 60, "radius": 120 },
      "physics": "decor",
      "offsetY": -1
    },
    {
      "model": "/models/ignore/creatures/deer.glb",
      "scatter": { "count": 5, "center": [-50, -60], "radius": 40 },
      "scale": 10
    },
    {
      "model": "/models/ignore/creatures/unicorn.glb",
      "position": [20, 0.1, 30]
    },
    {
      "model": "/models/ignore/creatures/armored_horse.glb",
      "position": [-15, 1.3, -10],
      "rotationY": 1.8,
      "scale": 3
    },
    {
      "model": "/models/ignore/creatures/velkhana.glb",
      "position": [-140, 0.1, 120],
      "scale": 1
    },
    {
      "model": "/models/ignore/special/crystal.glb",
      "scatter": { "count": 8, "center": [110, 90], "radius": 30 },
      "physics": "decor"
    },
    {
      "model": "/models/ignore/special/portal.glb",
      "position": [60, 0.1, 60],
      "scale": 0.008
    },
    {
      "model": "/models/ignore/nature/rock_b.glb",
      "scatter": { "count": 5, "radius": 180 },
      "scale": 0.5
    },

    {
      "model": "/models/ignore/nature/stylized_hand_painted_tree_toon.glb",
      "scatter": { "count": 15, "center": [40, -90], "radius": 45 },
      "offsetY": -1
    },
    {
      "model": "/models/ignore/nature/bush.glb",
      "scatter": { "count": 40, "radius": 150 },
      "offsetY": -1
    },
    {
      "model": "/models/ignore/nature/flower_bush.glb",
      "scatter": { "count": 25, "center": [0, 40], "radius": 40 },
      "physics": "decor",
      "offsetY": -1
    },
    {
      "model": "/models/ignore/nature/flowers.glb",
      "scatter": { "count": 30, "center": [10, 20], "radius": 45 },
      "physics": "decor",
      "offsetY": -1
    },
    {
      "model": "/models/ignore/nature/mushroom.glb",
      "scatter": { "count": 20, "center": [-60, 30], "radius": 30 },
      "physics": "decor",
      "offsetY": -1
    },
    {
      "model": "/models/ignore/fantacy/blue_scrub_bush.glb",
      "scatter": { "count": 20, "center": [70, -40], "radius": 40 },
      "offsetY": -1
    },
    {
      "model": "/models/ignore/fantacy/glowing_mushroom.glb",
      "scatter": { "count": 15, "center": [-90, 70], "radius": 25 },
      "physics": "decor",
      "offsetY": -1
    },
  ]
}

export default forestWorld