import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { useLogout } from '../../hooks/useAuth'
import { getDreamErrorMessage, useCreateDream } from '../../hooks/useDream'
import { getToken } from '../../lib/auth'

export const Route = createFileRoute('/chat/new')({
  beforeLoad: () => {
    if (!getToken()) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const logout = useLogout()
  const [prompt, setPrompt] = useState('')
  const createDream = useCreateDream()

  const canSubmit = prompt.trim().length > 0 && !createDream.isPending

  function handleSubmit() {
    if (!canSubmit) return
    createDream.mutate(prompt.trim())
  }

  return (
    <div className='w-full min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4'>
      <button
        onClick={logout}
        className='absolute top-6 right-6 rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10'
      >
        log out
      </button>
      <h1>Type Your Dreamworld</h1>
      <textarea
        cols={60}
        rows={10}
        value={prompt}
        onChange={(event) => setPrompt(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
            handleSubmit()
          }
        }}
        className='border p-4 resize-none text-white bg-black'
        placeholder='i dream a world where lives a dragon'
      />
      {createDream.isError && (
        <p className='text-sm text-red-400'>{getDreamErrorMessage(createDream.error)}</p>
      )}
      <button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className='rounded-lg bg-white px-6 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50'
      >
        {createDream.isPending ? 'dreaming...' : 'enter dream'}
      </button>
    </div>
  )
}
