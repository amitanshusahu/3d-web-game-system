import { useRef } from 'react'

interface PostDreamModalProps {
  isPending: boolean
  isError: boolean
  isSuccess: boolean
  errorMessage: string | null
  onPublish: (input: { title: string; tags: string[] }) => void
  onClose: () => void
}

export function PostDreamModal({ isPending, isError, isSuccess, errorMessage, onPublish, onClose }: PostDreamModalProps) {
  const titleRef = useRef<HTMLInputElement>(null)
  const tagsRef = useRef<HTMLInputElement>(null)

  function submit() {
    const title = titleRef.current?.value.trim() ?? ''
    if (title.length === 0 || isPending) return
    const tags = (tagsRef.current?.value ?? '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    onPublish({ title, tags })
  }

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/60'>
      <div className='w-[400px] rounded-xl bg-white p-5 flex flex-col gap-3 text-black'>
        <h2 className='text-lg font-bold'>Post dream</h2>
        <input
          ref={titleRef}
          placeholder='dream title'
          className='rounded-lg border border-black/20 px-3 py-2 text-sm'
        />
        <input
          ref={tagsRef}
          placeholder='tags, comma separated'
          className='rounded-lg border border-black/20 px-3 py-2 text-sm'
        />
        {isError && errorMessage && <p className='text-sm text-red-600'>{errorMessage}</p>}
        {isSuccess && <p className='text-sm text-green-700'>dream posted!</p>}
        <div className='flex justify-end gap-2'>
          <button onClick={onClose} className='rounded-lg border border-black/20 px-4 py-2 text-sm'>
            cancel
          </button>
          <button
            onClick={submit}
            disabled={isPending}
            className='rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isPending ? 'posting...' : 'publish'}
          </button>
        </div>
      </div>
    </div>
  )
}
