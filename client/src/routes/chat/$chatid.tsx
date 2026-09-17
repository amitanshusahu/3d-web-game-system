import { createFileRoute, redirect } from '@tanstack/react-router'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import Experience from '../../components/GameSystem/Experience'
import PlayerHud from '../../components/GameSystem/PlayerHud'
import { Suspense } from 'react'
import { getToken } from '../../lib/auth'

export const Route = createFileRoute('/chat/$chatid')({
  beforeLoad: () => {
    if (!getToken()) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: App,
})

function App() {
  const { chatid } = Route.useParams()
  return (
    <div className='grid grid-cols-[30%_70%] h-screen w-screen'>
      <div className='w-full h-full bg-green-300'>
        <div>
          {chatid}
        </div>
        chat with ai to create your dream world
      </div>
      <div className='w-full h-full bg-black relative'>
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
      </div>
    </div>
  )
}
