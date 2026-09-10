import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import Model from './components/Rendering/models/Model'
import Player from './components/GameSystem/Player'
import PlayerHud from './components/GameSystem/PlayerHud'
// import { HoverCar } from './components/Rendering/models/HoverCar'
import * as THREE from 'three'
import Lights from './components/Rendering/Lights'
import { TestMap } from './components/Rendering/map/TestMap'
import { useControls } from "leva";
import { useEffect, useRef } from "react";
import { GravityField } from "./components/GameSystem/GravityField";
import { useCustomGravity } from "ecctrl/gravity";

export default function App() {
  /**
  * Custom gravity field
  */
  const { gravityField } = GravityField();
  const setGravityField = useCustomGravity((state) => state.setGravityField)
  useEffect(() => setGravityField(gravityField), [gravityField, setGravityField])

  /**
   * Debug settings
   */
  const timeScale = useRef(1)
  const [{ pausedPhysics, physicsDebug, physicsGravity }, setWorldSettings] = useControls(
    "World Settings",
    () => ({
      physicsDebug: false,
      pausedPhysics: true,
      physicsGravity: { value: [0, 0, 0] },
      slowMotion: {
        value: timeScale.current,
        min: 0.01,
        max: 1,
        step: 0.01,
        onChange: (value) => { timeScale.current = value },
      },
    }),
    { collapsed: true }
  );

  /**
   * Delay physics activate
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      setWorldSettings({ pausedPhysics: false });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [setWorldSettings]);

  return (
    <>
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        camera={{
          fov: 75,
          near: 0.1,
          far: 1000,
          position: [0, 1, 100],
        }}
      >
        <axesHelper />
        <Lights />
        <Physics debug={physicsDebug} timeStep="vary" gravity={physicsGravity} paused={pausedPhysics}>
          {/* <RigidBody colliders="hull" position={[0, 0, 0]} type='fixed'>
            <Model
              modelPath="/models/cyberpunk_hovercar.glb"
              position={[0, 0, 0]}
              rotation={[0, 0, 0]}
              scale={1}
            />
          </RigidBody>
          <RigidBody type="fixed" colliders="cuboid">
            <mesh position={[0, -0.05, 0]}>
              <boxGeometry args={[2000, 0.1, 2000]} />
              <meshStandardMaterial color="#3a3a3a" />
            </mesh>
          </RigidBody> */}
          <TestMap />
          <Player />
        </Physics>
      </Canvas>
      <PlayerHud />
    </>
  )
}