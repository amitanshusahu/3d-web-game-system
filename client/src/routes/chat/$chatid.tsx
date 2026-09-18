import { Suspense, useEffect, useRef, useState } from 'react'
import { createFileRoute, redirect } from '@tanstack/react-router'
import { Canvas } from '@react-three/fiber'
import * as THREE from 'three'
import Experience from '../../components/GameSystem/Experience'
import PlayerHud from '../../components/GameSystem/PlayerHud'
import { getToken } from '../../lib/auth'
import { getChatErrorMessage, useChat, useSendMessage } from '../../hooks/useChat'
import { getDreamErrorMessage, usePublishDream } from '../../hooks/useDream'
import { useLogout } from '../../hooks/useAuth'
import type { WorldConfig } from '../../components/World/worldTypes'
import type { ChatHistoryEntry } from '../../api/chat'

export const Route = createFileRoute('/chat/$chatid')({
  beforeLoad: () => {
    if (!getToken()) {
      throw redirect({ to: '/auth/login' })
    }
  },
  component: App,
})

function parseWorld(response: ChatHistoryEntry['response']): WorldConfig | null {
  if (!response) return null
  if (typeof response === 'object') return response as WorldConfig
  try {
    return JSON.parse(response) as WorldConfig
  } catch {
    return null
  }
}

function objectCount(world: WorldConfig | null): number {
  if (!world || !Array.isArray(world.objects)) return 0
  return world.objects.length
}

function App() {
  const { chatid } = Route.useParams()
  const logout = useLogout()
  const chatQuery = useChat(chatid)
  const sendMessage = useSendMessage(chatid)
  const publishDream = usePublishDream(chatid)
  const [input, setInput] = useState('')
  const [showPostModal, setShowPostModal] = useState(false)
  const [title, setTitle] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const threadRef = useRef<HTMLDivElement>(null)

  const histories = chatQuery.data?.userChatHistories ?? []
  const latestWorld = histories.length > 0 ? parseWorld(histories[histories.length - 1]!.response) : null
  const alreadyPosted = !!chatQuery.data?.dream

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight })
  }, [histories.length, sendMessage.isPending])

  const canSend = input.trim().length > 0 && !sendMessage.isPending

  function handleSend() {
    if (!canSend) return
    sendMessage.mutate(input.trim(), {
      onSuccess: () => setInput(''),
    })
  }

  function handlePublish() {
    const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean)
    publishDream.mutate(
      { title: title.trim(), tags },
      {
        onSuccess: () => {
          setShowPostModal(false)
          void chatQuery.refetch()
        },
      },
    )
  }

  return (
    <div className='grid grid-cols-[30%_70%] h-screen w-screen'>
      <div className='w-full h-full bg-green-300 text-black p-4 flex flex-col gap-2 min-h-0'>
        <div className='flex items-center justify-between gap-2'>
          <div className='font-mono text-sm opacity-60 truncate'>{chatQuery.data?.title ?? chatid}</div>
          <div className='flex gap-2'>
            <button
              onClick={() => setShowPostModal(true)}
              disabled={alreadyPosted}
              className='rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {alreadyPosted ? 'posted' : 'post dream'}
            </button>
            <button
              onClick={logout}
              className='rounded-lg border border-black/20 px-3 py-1.5 text-xs hover:bg-black/10'
            >
              log out
            </button>
          </div>
        </div>

        {chatQuery.isPending && <p>loading chat...</p>}
        {chatQuery.isError && <p className='text-red-700'>chat not found</p>}

        <div ref={threadRef} className='flex-1 overflow-y-auto flex flex-col gap-2 min-h-0'>
          {histories.map((h) => (
            <div key={h.id} className='flex flex-col gap-1'>
              <div className='rounded-lg bg-black/80 text-white text-sm px-3 py-2 self-end max-w-[90%]'>{h.message}</div>
              <div className='text-xs opacity-70'>world updated · {objectCount(parseWorld(h.response))} objects</div>
            </div>
          ))}
          {sendMessage.isPending && <p className='text-sm opacity-60'>dreaming...</p>}
        </div>

        <div className='flex flex-col gap-2'>
          {sendMessage.isError && (
            <p className='text-sm text-red-700'>{getChatErrorMessage(sendMessage.error)}</p>
          )}
          <div className='flex gap-2'>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault()
                  handleSend()
                }
              }}
              placeholder='describe a change to your world...'
              className='flex-1 rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-black'
            />
            <button
              onClick={handleSend}
              disabled={!canSend}
              className='rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50'
            >
              send
            </button>
          </div>
        </div>
      </div>

      <div className='w-full h-full bg-black relative'>
        {latestWorld ? (
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
              <Experience config={latestWorld} />
            </Suspense>
          </Canvas>
        ) : (
          <div className='flex h-full items-center justify-center text-white/60'>
            {chatQuery.isError ? 'world failed to load' : 'generating world...'}
          </div>
        )}
        <PlayerHud />
      </div>

      {showPostModal && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
          <div className='w-[400px] rounded-xl bg-white p-5 flex flex-col gap-3 text-black'>
            <h2 className='text-lg font-bold'>Post dream</h2>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder='dream title'
              className='rounded-lg border border-black/20 px-3 py-2 text-sm'
            />
            <input
              value={tagsInput}
              onChange={(event) => setTagsInput(event.target.value)}
              placeholder='tags, comma separated'
              className='rounded-lg border border-black/20 px-3 py-2 text-sm'
            />
            {publishDream.isError && (
              <p className='text-sm text-red-600'>{getDreamErrorMessage(publishDream.error)}</p>
            )}
            {publishDream.isSuccess && <p className='text-sm text-green-700'>dream posted!</p>}
            <div className='flex justify-end gap-2'>
              <button
                onClick={() => setShowPostModal(false)}
                className='rounded-lg border border-black/20 px-4 py-2 text-sm'
              >
                cancel
              </button>
              <button
                onClick={handlePublish}
                disabled={title.trim().length === 0 || publishDream.isPending}
                className='rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50'
              >
                {publishDream.isPending ? 'posting...' : 'publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
