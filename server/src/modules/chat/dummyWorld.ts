const dummyWorld = {
  mode: "open",
  ground: { size: 600 },
  playerSpawn: [0, 1, 40],
  objects: [
    {
      model: "/models/ignore/structure/house.glb",
      position: [28, 0, -14],
      scale: 0.01,
    },
    {
      model: "/models/ignore/props/campfire.glb",
      position: [10, 0, 12],
    },
    {
      model: "/models/ignore/props/bench.glb",
      position: [13, 0, 14],
      rotationY: 2.2,
      scale: 0.5,
    },
    {
      model: "/models/ignore/props/lantern.glb",
      position: [7, 0, 10],
      scale: 0.002,
    },
    {
      model: "/models/ignore/props/animated_old_chest.glb",
      position: [-8, 0, 6],
      rotationY: 0.7,
      scale: 0.02,
    },
    {
      model: "/models/ignore/nature/oak_trees.glb",
      scatter: { count: 10, center: [-80, -40], radius: 70, spacing: 4 },
      scale: 10,
    },
    {
      model: "/models/ignore/nature/oak_trees.glb",
      scatter: { count: 12, center: [-30, 80], radius: 35, spacing: 3 },
      scale: 10,
    },
    {
      model: "/models/ignore/terrain/grass.glb",
      scatter: { count: 60, radius: 120, spacing: 2 },
      physics: "decor",
      offsetY: 0,
    },
    {
      model: "/models/ignore/creatures/deer.glb",
      scatter: { count: 5, center: [-50, -60], radius: 40, spacing: 5 },
      scale: 10,
    },
    {
      model: "/models/ignore/creatures/unicorn.glb",
      position: [20, 0, 30],
    },
    {
      model: "/models/ignore/creatures/armored_horse_edited.glb",
      position: [-15, 0, -10],
      rotationY: 1.8,
      scale: 3,
    },
    {
      model: "/models/ignore/creatures/velkhana.glb",
      position: [-140, 0, 120],
      scale: 1,
    },
    {
      model: "/models/ignore/special/crystal.glb",
      scatter: { count: 8, center: [110, 90], radius: 30, spacing: 3 },
      physics: "decor",
    },
    {
      model: "/models/ignore/special/portal.glb",
      position: [60, 0, 60],
      scale: 0.008,
    },
    {
      model: "/models/ignore/nature/rock_b.glb",
      scatter: { count: 5, radius: 180, spacing: 5 },
      scale: 0.5,
    },
    {
      model: "/models/ignore/nature/stylized_hand_painted_tree_toon.glb",
      scatter: { count: 15, center: [40, -90], radius: 45, spacing: 4 },
      offsetY: 0,
    },
    {
      model: "/models/ignore/nature/bush.glb",
      scatter: { count: 40, radius: 150, spacing: 2 },
      offsetY: 0,
    },
    {
      model: "/models/ignore/nature/flower_bush.glb",
      scatter: { count: 25, center: [0, 40], radius: 40, spacing: 1.5 },
      physics: "decor",
      offsetY: 0,
    },
    {
      model: "/models/ignore/nature/flowers.glb",
      scatter: { count: 30, center: [10, 20], radius: 45, spacing: 1 },
      physics: "decor",
      offsetY: -1,
    },
    {
      model: "/models/ignore/nature/mushroom.glb",
      scatter: { count: 20, center: [-60, 30], radius: 30, spacing: 1 },
      physics: "decor",
      offsetY: 0,
    },
    {
      model: "/models/ignore/fantacy/blue_scrub_bush.glb",
      scatter: { count: 20, center: [70, -40], radius: 40, spacing: 1.5 },
      offsetY: 0,
    },
    {
      model: "/models/ignore/fantacy/glowing_mushroom.glb",
      scatter: { count: 15, center: [-90, 70], radius: 25, spacing: 1 },
      physics: "decor",
      offsetY: 0,
    },
  ],
  environment: {
    terrain: "grass",
    weather: "rain",
    time: "night"
  },
};

export default dummyWorld;
