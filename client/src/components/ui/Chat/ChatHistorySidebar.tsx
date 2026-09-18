import { useMemo } from 'react'
import { Link } from '@tanstack/react-router'
import type { Chat } from '../../../api/chat'
import type { authUser } from '../../../sharedTypes/auth/auth.model'
import LogoLong from '../../../assets/LogoLong'
import { ArrowLeftIcon, SignOutIcon } from "@phosphor-icons/react"

interface ChatHistorySidebarProps {
  chats: Chat[]
  isLoading: boolean
  isError: boolean
  activeChatId?: string | null
  user?: authUser | null
  onLogout: () => void
}

interface ChatGroup {
  label: string
  items: Chat[]
}

function startOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function groupLabel(createdAt: string, today: Date): string {
  const date = new Date(createdAt)
  if (Number.isNaN(date.getTime())) return 'Older'
  const diffDays = Math.floor((startOfDay(today).getTime() - startOfDay(date).getTime()) / 86400000)
  if (diffDays <= 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays <= 7) return 'Previous 7 days'
  if (diffDays <= 30) return 'Previous 30 days'
  return date.toLocaleString(undefined, { month: 'long', year: 'numeric' })
}

function groupRank(label: string): number {
  if (label === 'Today') return 0
  if (label === 'Yesterday') return 1
  if (label === 'Previous 7 days') return 2
  if (label === 'Previous 30 days') return 3
  return 4
}

function groupChats(chats: Chat[]): ChatGroup[] {
  const today = new Date()
  const map = new Map<string, Chat[]>()
  for (const chat of chats) {
    const label = groupLabel(chat.createdAt, today)
    const list = map.get(label)
    if (list) list.push(chat)
    else map.set(label, [chat])
  }
  return [...map.entries()]
    .map(([label, items]) => ({ label, items }))
    .sort((a, b) => {
      const rank = groupRank(a.label) - groupRank(b.label)
      if (rank !== 0) return rank
      return b.label.localeCompare(a.label)
    })
}

export function ChatHistorySidebar({
  chats,
  isLoading,
  isError,
  activeChatId,
  user,
  onLogout,
}: ChatHistorySidebarProps) {
  const groups = useMemo(() => groupChats(chats), [chats])
  const initial = (user?.name ?? user?.email ?? '?').trim().charAt(0).toUpperCase() || '?'

  return (
    <aside className='flex h-screen w-72 shrink-0 flex-col border-r border-white/10 bg-zinc-950 text-white'>
      <div className='p-4 flex gap-4 justify-between items-center'>
        <LogoLong className='h-6' />
        <button>
          <ArrowLeftIcon className='h-5 w-5' />
        </button>
      </div>
      <div className='p-3'>
        <Link
          to='/chat/new'
          className='block rounded-lg border border-white/15 px-3 py-2 text-center text-sm font-semibold hover:bg-white/10'
        >
          + new dream
        </Link>
        <button>explore dreams</button>
      </div>

      <div className='min-h-0 flex-1 overflow-y-auto px-3 pb-3'>
        {isLoading && <p className='px-1 py-2 text-sm text-white/50'>loading chats...</p>}
        {isError && <p className='px-1 py-2 text-sm text-red-400'>could not load chats</p>}
        {!isLoading && !isError && groups.length === 0 && (
          <p className='px-1 py-2 text-sm text-white/40'>no dreams yet</p>
        )}
        {groups.map((group) => (
          <div key={group.label} className='mt-3 first:mt-1'>
            <p className='px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-white/40'>
              {group.label}
            </p>
            <ul className='flex flex-col gap-0.5'>
              {group.items.map((chat) => {
                const isActive = activeChatId === chat.id
                return (
                  <li key={chat.id}>
                    <Link
                      to='/chat/$chatid'
                      params={{ chatid: chat.id }}
                      title={chat.title}
                      className={`block truncate rounded-lg px-2 py-1.5 text-sm ${isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                        }`}
                    >
                      {chat.title}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>

      <div className='flex items-center gap-2 border-t border-white/10 p-3'>
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt='' className='h-8 w-8 shrink-0 rounded-full object-cover' />
        ) : (
          <span className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-sm font-semibold'>
            {initial}
          </span>
        )}
        <div className='min-w-0 flex-1'>
          <p className='truncate text-sm font-medium'>{user?.name ?? 'Dreamer'}</p>
          <p className='truncate text-xs text-white/50'>{user?.email ?? ''}</p>
        </div>
        <button
          onClick={onLogout}
          className='shrink-0 rounded-lg border border-white/20 px-3 py-1.5 text-xs hover:bg-white/10'
        >
          <SignOutIcon className='h-4 w-4' />
        </button>
      </div>
    </aside>
  )
}
