import { Canvas } from '@react-three/fiber'
import { Physics, RigidBody } from '@react-three/rapier'
import Model from './components/Rendering/models/Model'
import Player from './components/GameSystem/Player'

export default function App() {
  return (
    <Canvas
      camera={{
        fov: 75,
        near: 1,
        far: 1000,
        position: [0, 1, 100],
      }}
    >
      <axesHelper />
      <ambientLight intensity={Math.PI / 2} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} decay={0} intensity={Math.PI} />
      <pointLight position={[-10, -10, -10]} decay={0} intensity={Math.PI} />
      <Physics gravity={[0, -9.81, 0]} debug>
        <RigidBody colliders="cuboid" position={[0, 5, 0]}>
          <Model
            modelPath="/models/black_dragon_with_idle_animation.glb"
            position={[0, 0, 0]}
            rotation={[0, 0, 0]}
            scale={1}
          />
        </RigidBody>
        <Player />
        <RigidBody type="fixed" colliders="cuboid">
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[2000, 0.1, 2000]} />
            <meshStandardMaterial color="#3a3a3a" />
          </mesh>
        </RigidBody>
      </Physics>
    </Canvas>
  )
}