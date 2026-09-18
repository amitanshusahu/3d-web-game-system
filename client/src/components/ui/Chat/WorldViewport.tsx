import { Suspense, memo } from 'react'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import Experience from '../../GameSystem/Experience'
import PlayerHud from '../../GameSystem/PlayerHud'
import type { WorldConfig } from '../../World/worldTypes'

interface WorldViewportProps {
  world: WorldConfig | null
  loadFailed: boolean
}

export const WorldViewport = memo(function WorldViewport({ world, loadFailed }: WorldViewportProps) {
  return (
    <div className='w-full h-full bg-black relative'>
      {world ? (
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
            <Experience config={world} />
          </Suspense>
        </Canvas>
      ) : (
        <div className='flex h-full items-center justify-center text-white/60'>
          {loadFailed ? 'world failed to load' : 'generating world...'}
        </div>
      )}
      <PlayerHud />
    </div>
  )
})
