import { useMemo, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { getToken } from '../../lib/auth'
import { getChatErrorMessage, useChat, useChats, useSendMessage } from '../../hooks/useChat'
import { getDreamErrorMessage, usePublishDream } from '../../hooks/useDream'
import { useLogout, useMe } from '../../hooks/useAuth'
import {
  ChatHistorySidebar,
  ChatSidebar,
  PostDreamModal,
  WorldViewport,
  objectCount,
  parseWorld,
} from '../../components/ui/Chat'
import {
  ArrowClockwiseIcon,
  CheckIcon,
  CloudArrowUpIcon,
  SidebarSimpleIcon,
} from '@phosphor-icons/react'

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
  const logout = useLogout()
  const meQuery = useMe()
  const chatsQuery = useChats()
  const chatQuery = useChat(chatid)
  const sendMessage = useSendMessage(chatid)
  const publishDream = usePublishDream(chatid)
  const [showPostModal, setShowPostModal] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(true)
  const [mobileHistoryOpen, setMobileHistoryOpen] = useState(false)

  const histories = chatQuery.data?.userChatHistories ?? []
  const latestResponse = histories.length > 0 ? histories[histories.length - 1]?.response : null
  const latestWorld = useMemo(() => parseWorld(latestResponse ?? null), [latestResponse])
  const alreadyPosted = !!chatQuery.data?.dream
  const title = chatQuery.data?.title ?? 'Untitled dream'
  const refreshing = chatQuery.isFetching

  const historyList = chatsQuery.data ?? []
  const user = meQuery.data ?? null

  return (
    <div className='flex gap-4 h-screen w-full flex-col overflow-hidden bg-black text-white lg:flex-row'>
      <div className='hidden shrink-0 lg:block'>
        <ChatHistorySidebar
          chats={historyList}
          isLoading={chatsQuery.isPending}
          isError={chatsQuery.isError}
          activeChatId={chatid}
          user={user}
          collapsed={!historyOpen}
          onToggle={() => setHistoryOpen((v) => !v)}
          onLogout={logout}
        />
      </div>

      {mobileHistoryOpen && (
        <div className='fixed inset-0 z-40 lg:hidden'>
          <div
            className='absolute inset-0 bg-black/60 backdrop-blur-sm'
            onClick={() => setMobileHistoryOpen(false)}
          />
          <div className='absolute inset-y-0 left-0'>
            <ChatHistorySidebar
              chats={historyList}
              isLoading={chatsQuery.isPending}
              isError={chatsQuery.isError}
              activeChatId={chatid}
              user={user}
              collapsed={false}
              onToggle={() => setMobileHistoryOpen(false)}
              onLogout={logout}
            />
          </div>
        </div>
      )}

      <main className='relative order-1 flex h-[38vh] min-h-0 shrink-0 flex-col border-b border-white/10 lg:order-2 lg:h-auto lg:min-w-0 lg:flex-1 lg:border-b-0'>
        <header className='flex h-14 shrink-0 items-center gap-1.5 border-b border-white/10 bg-[#0a0a0a] px-3'>
          <button
            type='button'
            onClick={() => setMobileHistoryOpen(true)}
            title='Open dream history'
            aria-label='Open dream history'
            className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/5 hover:text-white lg:hidden'
          >
            <SidebarSimpleIcon className='h-5 w-5' />
          </button>
          <button
            type='button'
            onClick={() => setHistoryOpen((v) => !v)}
            title={historyOpen ? 'Hide dream history' : 'Show dream history'}
            aria-label={historyOpen ? 'Hide dream history' : 'Show dream history'}
            className='hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white/60 transition hover:bg-white/5 hover:text-white lg:flex'
          >
            <SidebarSimpleIcon className='h-5 w-5' />
          </button>

          <div className='min-w-0 flex-1 px-1'>
            <h1 className='truncate text-[13.5px] font-semibold leading-tight'>{title}</h1>
            <p className='flex items-center gap-1.5 text-[11px] text-white/40'>
              <span
                className={`h-1.5 w-1.5 rounded-full ${sendMessage.isPending ? 'animate-pulse bg-amber-300' : 'bg-emerald-400'}`}
              />
              {sendMessage.isPending ? 'Dreaming…' : `${histories.length} ${histories.length === 1 ? 'edit' : 'edits'}`}
            </p>
          </div>

          <button
            type='button'
            onClick={() => void chatQuery.refetch()}
            disabled={refreshing}
            title='Refresh world'
            aria-label='Refresh world'
            className='flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/60 transition hover:border-white/25 hover:text-white disabled:opacity-50'
          >
            <ArrowClockwiseIcon className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          {alreadyPosted ? (
            <span className='flex h-9 shrink-0 items-center gap-1.5 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-3.5 text-[13px] font-medium text-emerald-300'>
              <CheckIcon className='h-4 w-4' weight='bold' />
              Published
            </span>
          ) : (
            <button
              type='button'
              onClick={() => setShowPostModal(true)}
              title='Publish dream'
              aria-label='Publish dream'
              className='flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-white px-3.5 text-[13px] font-semibold text-black transition hover:bg-blue-100 active:scale-[0.98]'
            >
              <CloudArrowUpIcon className='h-4 w-4' weight='bold' />
              Publish
            </button>
          )}
        </header>

        <div className='relative min-h-0 flex-1'>
          <WorldViewport world={latestWorld} loadFailed={chatQuery.isError} />
          {latestWorld && (
            <div className='pointer-events-none absolute left-3 top-3 rounded-full border border-white/10 bg-black/60 px-3 py-1 text-[11.5px] text-white/70 backdrop-blur'>
              {objectCount(latestWorld)} {objectCount(latestWorld) === 1 ? 'object' : 'objects'}
            </div>
          )}
        </div>
      </main>

      <section className='order-2 flex min-h-0 flex-1 flex-col bg-[#0a0a0a] lg:order-1 lg:my-3 lg:mr-0 lg:w-[380px] lg:flex-none lg:overflow-hidden lg:rounded-2xl lg:border lg:border-white/10 xl:w-[400px]'>
        <ChatSidebar
          title={title}
          historyOpen={historyOpen}
          isLoading={chatQuery.isPending}
          loadError={chatQuery.isError}
          histories={histories}
          sendPending={sendMessage.isPending}
          sendError={sendMessage.isError}
          sendErrorMessage={sendMessage.isError ? getChatErrorMessage(sendMessage.error) : null}
          onSend={(message, opts) => sendMessage.mutate(message, opts)}
          onToggleHistory={() => {
            if (window.innerWidth < 1024) setMobileHistoryOpen(true)
            else setHistoryOpen((v) => !v)
          }}
        />
      </section>

      {showPostModal && (
        <PostDreamModal
          isPending={publishDream.isPending}
          isError={publishDream.isError}
          isSuccess={publishDream.isSuccess}
          errorMessage={publishDream.isError ? getDreamErrorMessage(publishDream.error) : null}
          onPublish={(input) =>
            publishDream.mutate(input, {
              onSuccess: () => {
                setShowPostModal(false)
                void chatQuery.refetch()
              },
            })
          }
          onClose={() => {
            publishDream.reset()
            setShowPostModal(false)
          }}
        />
      )}
    </div>
  )
}
