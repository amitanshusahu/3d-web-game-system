import { createFileRoute, redirect } from '@tanstack/react-router'
import { useLogout } from '../../hooks/useAuth'
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

  return (
    <div className='w-full min-h-screen bg-black text-white flex flex-col items-center justify-center gap-4'>
      <button
        onClick={logout}
        className='absolute top-6 right-6 rounded-lg border border-white/20 px-4 py-2 text-sm hover:bg-white/10'
      >
        log out
      </button>
      <h1>Type Your Dreamworld</h1>
      <textarea cols={60} rows={10} className='border p-4 resize-none' placeholder='i dream a world where lives a dragon'> </textarea>
    </div>
  )
}
