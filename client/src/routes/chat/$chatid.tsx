import { createFileRoute, redirect } from '@tanstack/react-router'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import Experience from '../../components/GameSystem/Experience'
import PlayerHud from '../../components/GameSystem/PlayerHud'
import { Suspense } from 'react'
import { getToken } from '../../lib/auth'
import { useDream, useGenerateWorld } from '../../hooks/useDream'

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
  const dreamQuery = useDream(chatid)
  const worldQuery = useGenerateWorld(chatid, dreamQuery.data?.prompt)

  return (
    <div className='grid grid-cols-[30%_70%] h-screen w-screen'>
      <div className='w-full h-full bg-green-300 text-black p-4 flex flex-col gap-2'>
        <div className='font-mono text-sm opacity-60'>{chatid}</div>
        {dreamQuery.isPending && <p>loading dream...</p>}
        {dreamQuery.isError && <p className='text-red-700'>dream not found</p>}
        {dreamQuery.data && (
          <>
            <h2 className='text-xl font-bold'>{dreamQuery.data.title}</h2>
            <p className='text-sm'>{dreamQuery.data.prompt}</p>
          </>
        )}
        <div className='mt-2 text-sm'>chat with ai to create your dream world</div>
        {worldQuery.isPending && <p className='text-sm opacity-60'>generating world...</p>}
        {worldQuery.isError && <p className='text-sm text-red-700'>failed to generate world</p>}
      </div>
      <div className='w-full h-full bg-black relative'>
        {worldQuery.data ? (
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
              <Experience config={worldQuery.data} />
            </Suspense>
          </Canvas>
        ) : (
          <div className='flex h-full items-center justify-center text-white/60'>
            {worldQuery.isError ? 'world failed to load' : 'generating world...'}
          </div>
        )}
        <PlayerHud />
      </div>
    </div>
  )
}
