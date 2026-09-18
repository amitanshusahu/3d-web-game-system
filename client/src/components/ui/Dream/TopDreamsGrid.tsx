import { Link } from '@tanstack/react-router'
import { ArrowUpRightIcon, FireIcon, HeartIcon, SparkleIcon } from '@phosphor-icons/react'
import { useDreams } from '../../../hooks/useDream'
import type { dream } from '../../../sharedTypes/dream/dream.model'

const MAX_DREAMS = 3

function timeAgo(iso: string): string {
  const t = new Date(iso).getTime()
  if (Number.isNaN(t)) return ''
  const diff = Date.now() - t
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

function DreamCard({ item, onPick }: { item: dream; onPick?: (d: dream) => void }) {
  return (
    <button
      type='button'
      onClick={() => onPick?.(item)}
      title={onPick ? `Remix "${item.title}"` : item.title}
      className='group relative flex min-h-44 flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/70 p-4 text-left backdrop-blur-md transition duration-200 hover:border-white/25 hover:bg-black/90  focus-visible:outline-2 focus-visible:outline-blue-400'
    >

      <div className="flex justify-between gap-4">
        <p className='line-clamp-1 text-[15px] tracking-tight text-white'>{item.title}</p>
        <span className='ml-auto inline-flex items-center gap-1 rounded-full bg-white/8 px-2 py-0.5 text-[11px] font-medium tabular-nums text-white/70 ring-1 ring-white/10'>
          <HeartIcon className='h-3 w-3 text-rose-400' weight='fill' />
          {item.likes}
        </span>
      </div>
      <p className='mt-4 line-clamp-2 text-[13px] leading-relaxed text-white/55'>{item.prompt}</p>

      <div className='mt-auto flex items-center gap-1.5 pt-3'>
        {item.tags.slice(0, 2).map((tag) => (
          <span key={tag} className='max-w-24 truncate rounded-full bg-white/8 px-2 py-0.5 text-[11px] text-white/60 ring-1 ring-white/10'>
            #{tag}
          </span>
        ))}
        <span className='ml-auto inline-flex translate-y-0 items-center gap-1 text-[11px] font-semibold text-blue-300 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100'>
          <SparkleIcon className='h-3 w-3' weight='fill' />
          remix
        </span>
      </div>
    </button>
  )
}

function Skeleton() {
  return (
    <div className='grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3' aria-hidden='true'>
      {Array.from({ length: MAX_DREAMS }, (_, i) => (
        <div key={i} className='min-h-44 animate-pulse rounded-2xl border border-white/10 bg-white/5 p-4'>
          <div className='mb-3 flex items-center justify-between'>
            <div className='h-6 w-6 rounded-md bg-white/10' />
            <div className='h-5 w-12 rounded-full bg-white/10' />
          </div>
          <div className='h-4 w-3/4 rounded bg-white/10' />
          <div className='mt-2 h-3 w-full rounded bg-white/5' />
          <div className='mt-1.5 h-3 w-2/3 rounded bg-white/5' />
        </div>
      ))}
    </div>
  )
}

export function TopDreamsGrid({ onPick }: { onPick?: (d: dream) => void }) {
  const dreamsQuery = useDreams()

  return (
    <section aria-label='Trending dreams' className='w-full'>
      <div className='mb-4 flex items-end justify-between gap-4'>
        <div>
          <div className='flex items-center gap-2'>
            <FireIcon className='h-4 w-4 text-orange-400' weight='fill' />
            <h2 className='text-sm tracking-tight text-white sm:text-lg'>Trending dreams</h2>
            <p className='mt-1.5 text-[13px] text-white/45'>
              — tap any card to remix.
            </p>
          </div>
        </div>
        <Link
          to='/explore'
          className='group hidden shrink-0 items-center gap-1 rounded-full px-3.5  text-[13px] font-medium text-blue-400 backdrop-blur transition hover:text-blue-300 sm:inline-flex'
        >
          Explore all
          <ArrowUpRightIcon className='h-3.5 w-3.5 transition group-hover:translate-x-px group-hover:-translate-y-px' />
        </Link>
      </div>

      {dreamsQuery.isPending && <Skeleton />}

      {dreamsQuery.isError && (
        <div className='rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur'>
          <p className='text-sm text-white/60'>couldn&apos;t load trending dreams</p>
          <button
            type='button'
            onClick={() => dreamsQuery.refetch()}
            className='mt-3 rounded-full border border-white/15 px-4 py-1.5 text-[13px] font-medium text-white transition hover:bg-white/10'
          >
            Try again
          </button>
        </div>
      )}

      {dreamsQuery.data && (
        <>
          {[...dreamsQuery.data].sort((a, b) => b.likes - a.likes).slice(0, MAX_DREAMS).length === 0 ? (
            <div className='rounded-2xl border border-dashed border-white/15 bg-white/3 p-8 text-center backdrop-blur'>
              <p className='text-sm font-medium text-white/70'>No dreams yet — yours could be #1</p>
              <p className='mt-1 text-[13px] text-white/40'>Describe a world below and it will show up here.</p>
            </div>
          ) : (
            <div className='grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              {[...dreamsQuery.data]
                .sort((a, b) => b.likes - a.likes)
                .slice(0, MAX_DREAMS)
                .map((item) => (
                  <DreamCard key={item.id} item={item} onPick={onPick} />
                ))}
            </div>
          )}
          <div className='mt-3 flex items-center justify-between text-xs text-white/35 sm:hidden'>
            <span>{dreamsQuery.data.length > 0 ? `updated ${timeAgo(dreamsQuery.data[0].updatedAt)}` : ''}</span>
            <Link to='/explore' className='inline-flex items-center gap-1 font-medium text-white/60'>
              Explore all <ArrowUpRightIcon className='h-3.5 w-3.5' />
            </Link>
          </div>
        </>
      )}
    </section>
  )
}
