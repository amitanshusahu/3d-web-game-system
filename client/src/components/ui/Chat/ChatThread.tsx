import { memo, useEffect, useRef } from 'react'
import type { ChatHistoryEntry } from '../../../api/chat'
import { objectCount, parseWorld } from './worldUtils'

interface ChatThreadProps {
  histories: ChatHistoryEntry[]
  isPending: boolean
}

export const ChatThread = memo(function ChatThread({ histories, isPending }: ChatThreadProps) {
  const threadRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight })
  }, [histories.length, isPending])

  return (
    <div ref={threadRef} className='flex-1 overflow-y-auto flex flex-col gap-2 min-h-0'>
      {histories.map((h) => (
        <div key={h.id} className='flex flex-col gap-1'>
          <div className='rounded-lg bg-black/80 text-white text-sm px-3 py-2 self-end max-w-[90%]'>{h.message}</div>
          <div className='text-xs opacity-70'>world updated · {objectCount(parseWorld(h.response))} objects</div>
        </div>
      ))}
      {isPending && <p className='text-sm opacity-60'>dreaming...</p>}
    </div>
  )
})
