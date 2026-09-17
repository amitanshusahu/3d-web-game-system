import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import Experience from './components/GameSystem/Experience'
import PlayerHud from './components/GameSystem/PlayerHud'
import { Suspense } from 'react'

export default function App() {
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
        <Suspense fallback={null}>
          <Experience />
        </Suspense>
      </Canvas>
      <PlayerHud />
    </>
  )
}
