import type { ChatHistoryEntry } from '../../../api/chat'
import { ChatComposer } from './ChatComposer'
import { ChatThread } from './ChatThread'

interface ChatSidebarProps {
  title: string
  isLoading: boolean
  loadError: boolean
  alreadyPosted: boolean
  histories: ChatHistoryEntry[]
  sendPending: boolean
  sendError: boolean
  sendErrorMessage: string | null
  onSend: (message: string, opts: { onSuccess: () => void }) => void
  onOpenPostModal: () => void
  onLogout: () => void
}

export function ChatSidebar({
  title,
  isLoading,
  loadError,
  alreadyPosted,
  histories,
  sendPending,
  sendError,
  sendErrorMessage,
  onSend,
  onOpenPostModal,
  onLogout,
}: ChatSidebarProps) {
  return (
    <div className='w-full h-full bg-green-300 text-black p-4 flex flex-col gap-2 min-h-0'>
      <div className='flex items-center justify-between gap-2'>
        <div className='font-mono text-sm opacity-60 truncate'>{title}</div>
        <div className='flex gap-2'>
          <button
            onClick={onOpenPostModal}
            disabled={alreadyPosted}
            className='rounded-lg bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {alreadyPosted ? 'posted' : 'post dream'}
          </button>
          <button onClick={onLogout} className='rounded-lg border border-black/20 px-3 py-1.5 text-xs hover:bg-black/10'>
            log out
          </button>
        </div>
      </div>

      {isLoading && <p>loading chat...</p>}
      {loadError && <p className='text-red-700'>chat not found</p>}

      <ChatThread histories={histories} isPending={sendPending} />
      <ChatComposer isPending={sendPending} isError={sendError} errorMessage={sendErrorMessage} onSend={onSend} />
    </div>
  )
}
