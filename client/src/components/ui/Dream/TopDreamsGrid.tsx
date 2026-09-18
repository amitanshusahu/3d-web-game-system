import { useDreams } from '../../../hooks/useDream'
import type { dream } from '../../../sharedTypes/dream/dream.model'

const MAX_DREAMS = 6

function DreamCard({ item }: { item: dream }) {
  return (
    <div className='flex flex-col gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-left'>
      <p className='truncate text-sm font-semibold text-white'>{item.title}</p>
      {item.tags.length > 0 && (
        <div className='flex flex-wrap gap-1'>
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className='rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/70'>
              {tag}
            </span>
          ))}
        </div>
      )}
      <div className='mt-auto flex items-center gap-1 text-xs text-white/50'>
        <svg viewBox='0 0 24 24' fill='currentColor' className='h-3 w-3 text-red-400'>
          <path d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' />
        </svg>
        <span>{item.likes}</span>
      </div>
    </div>
  )
}

export function TopDreamsGrid() {
  const dreamsQuery = useDreams()

  if (dreamsQuery.isPending) {
    return (
      <div className='grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3'>
        {Array.from({ length: MAX_DREAMS }, (_, index) => (
          <div key={index} className='h-20 animate-pulse rounded-xl border border-white/10 bg-white/5' />
        ))}
      </div>
    )
  }

  if (dreamsQuery.isError) {
    return <p className='text-sm text-white/50'>couldn't load dreams</p>
  }

  const topDreams = [...dreamsQuery.data].sort((a, b) => b.likes - a.likes).slice(0, MAX_DREAMS)

  if (topDreams.length === 0) {
    return <p className='text-sm text-white/50'>no dreams posted yet — be the first</p>
  }

  return (
    <div className='grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3'>
      {topDreams.map((item) => (
        <DreamCard key={item.id} item={item} />
      ))}
    </div>
  )
}
