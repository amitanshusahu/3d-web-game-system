import { Canvas } from '@react-three/fiber'
import { OrbitControls, PointerLockControls } from '@react-three/drei'
import Model from './components/Rendering/models/Model'

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
      <Model
        modelPath="/models/black_dragon_with_idle_animation.glb"
        position={[0, 0, 0]}
        rotation={[0, 0, 0]}
        scale={1}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2000, 2000, 100, 100]} />
        <meshBasicMaterial vertexColors />
      </mesh>
      <PointerLockControls />
      {/* <OrbitControls /> */}
    </Canvas>
  )
}