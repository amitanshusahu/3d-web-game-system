import { useState } from 'react'
import { Link, createFileRoute, redirect } from '@tanstack/react-router'
import { useLogout, useMe } from '../../hooks/useAuth'
import { getChatErrorMessage, useChats, useCreateChat } from '../../hooks/useChat'
import { getToken } from '../../lib/auth'
import { ChatHistorySidebar } from '../../components/ui/Chat'
import { TopDreamsGrid } from '../../components/ui/Dream'

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
  const meQuery = useMe()
  const chatsQuery = useChats()
  const [message, setMessage] = useState(() => {
    try {
      const draft = sessionStorage.getItem('dream-draft')
      if (draft) sessionStorage.removeItem('dream-draft')
      return draft ?? ''
    } catch {
      return ''
    }
  })
  const createChat = useCreateChat()

  const canSubmit = message.trim().length > 0 && !createChat.isPending

  function handleSubmit() {
    if (!canSubmit) return
    createChat.mutate(message.trim())
  }

  return (
    <div className='flex min-h-screen w-full bg-black text-white relative'>
      <div className="z-10">
        <ChatHistorySidebar
          chats={chatsQuery.data ?? []}
          isLoading={chatsQuery.isPending}
          isError={chatsQuery.isError}
          user={meQuery.data ?? null}
          onLogout={logout}
        />
      </div>
      <img
        src="/img/bg.jpg"
        alt=''
        aria-hidden='true'
        className='pointer-events-none fixed inset-0 h-full w-full object-cover'
      />
      <div className='pointer-events-none fixed inset-0 bg-linear-to-b from-black/70 via-black/30 to-black/80' />`
      <div className='pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,transparent_0%,rgba(0,0,0,0.5)_100%)]' />
      <div className='flex flex-1 flex-col items-center justify-center gap-4 px-6 py-6 sm:px-12 h-screen z-10'>
        <div className="flex justify-end w-full">
          <button>credits</button>
        </div>
        <div className='flex flex-1 flex-col items-center justify-center gap-4 overflow-y-auto'>
          <h1>Type Your Dreamworld</h1>
          <textarea
            cols={60}
            rows={10}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) {
                handleSubmit()
              }
            }}
            className='border p-4 resize-none text-white bg-black'
            placeholder='i dream a world where lives a dragon'
          />
          {createChat.isError && (
            <p className='text-sm text-red-400'>{getChatErrorMessage(createChat.error)}</p>
          )}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className='rounded-lg bg-white px-6 py-2 text-sm font-semibold text-black hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {createChat.isPending ? 'dreaming...' : 'enter dream'}
          </button>
          <div className='mt-6 flex flex-col items-center gap-4'>
            <p className='text-xs uppercase tracking-widest text-white/40'>top dreams</p>
            <TopDreamsGrid />
            <Link
              to='/explore'
              className='rounded-lg border border-white/20 px-6 py-2 text-sm font-semibold text-white hover:bg-white/10'
            >
              explore more dreams
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
