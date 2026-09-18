import { useRef } from 'react'

interface ChatComposerProps {
  isPending: boolean
  isError: boolean
  errorMessage: string | null
  onSend: (message: string, opts: { onSuccess: () => void }) => void
}

export function ChatComposer({ isPending, isError, errorMessage, onSend }: ChatComposerProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function submit() {
    const value = inputRef.current?.value.trim() ?? ''
    if (value.length === 0 || isPending) return
    onSend(value, {
      onSuccess: () => {
        if (inputRef.current) inputRef.current.value = ''
      },
    })
  }

  return (
    <div className='flex flex-col gap-2'>
      {isError && errorMessage && <p className='text-sm text-red-700'>{errorMessage}</p>}
      <div className='flex gap-2'>
        <input
          ref={inputRef}
          defaultValue=''
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault()
              submit()
            }
          }}
          placeholder='describe a change to your world...'
          className='flex-1 rounded-lg border border-black/20 bg-white px-3 py-2 text-sm text-black'
        />
        <button
          onClick={submit}
          disabled={isPending}
          className='rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-black/80 disabled:cursor-not-allowed disabled:opacity-50'
        >
          send
        </button>
      </div>
    </div>
  )
}
