import { useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { XIcon } from '@phosphor-icons/react'
import { useLogout, useMe } from '../../hooks/useAuth'
import { useChats } from '../../hooks/useChat'
import { getToken } from '../../lib/auth'
import { ChatHistorySidebar } from '../../components/ui/Chat'
import { TopDreamsGrid } from '../../components/ui/Dream'
import { LandingChatBox } from '../../components/ui/landing/LandingChatBox'
import type { dream } from '../../sharedTypes/dream/dream.model'

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
  const [remix, setRemix] = useState<dream | null>(null)
  const [message, setMessage] = useState(() => {
    try {
      const draft = sessionStorage.getItem('dream-draft')
      if (draft) sessionStorage.removeItem('dream-draft')
      return draft ?? ''
    } catch {
      return ''
    }
  })

  function handlePick(item: dream) {
    setRemix(item)
    setMessage(item.prompt)
    requestAnimationFrame(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    })
  }

  return (
    <div className='relative flex min-h-screen w-full bg-black text-white'>
      <ChatHistorySidebar
        chats={chatsQuery.data ?? []}
        isLoading={chatsQuery.isPending}
        isError={chatsQuery.isError}
        user={meQuery.data ?? null}
        onLogout={logout}
      />
      <div className='relative min-w-0 flex-1'>
        <img
          src='/img/bg.jpg'
          alt=''
          aria-hidden='true'
          className='pointer-events-none fixed inset-0 h-full w-full object-cover'
        />
        <div className='pointer-events-none fixed inset-0 bg-linear-to-b from-black/70 via-black/50 to-black/80' />
        <div className='pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,transparent_0%,rgba(0,0,0,0.5)_100%)]' />

        <div className='relative z-10 mx-auto flex min-h-screen w-full max-w-3xl sm:max-w-4xl flex-col px-6'>

          <main className='w-full flex-1 py-8 sm:py-10'>
            <TopDreamsGrid onPick={handlePick} />
          </main>

          <div className='sticky bottom-0 z-10 px-6 pt-10 pb-5 sm:-mx-12 sm:px-12 sm:pb-20'>
            {remix && (
              <div className='mb-3 flex justify-center'>
                <span className='inline-flex max-w-full items-center gap-2 rounded-full border border-blue-300/30 bg-blue-400/10 py-1 pr-1.5 pl-3 text-xs text-blue-200 backdrop-blur'>
                  <span className='truncate'>remixing “{remix.title}”</span>
                  <button
                    type='button'
                    onClick={() => setRemix(null)}
                    aria-label='Clear remix'
                    className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 transition hover:bg-white/20'
                  >
                    <XIcon className='h-3 w-3' weight='bold' />
                  </button>
                </span>
              </div>
            )}
            <h1 className='mb-4 text-center text-3xl tracking-tight text-white sm:text-4xl'>
              What&apos;s Your <span className='text-blue-400'>Dream</span> ?
            </h1>
            <LandingChatBox
              suggestionsAlign='center'
              hideSuggestion={false}
              controlledValue={message}
              onControlledChange={setMessage}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
