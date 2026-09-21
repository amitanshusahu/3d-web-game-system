import { XIcon } from '@phosphor-icons/react'
import { useDialogueStore } from '../../../store/dialogueStore'

export default function DialogueHud() {
  const dialogue = useDialogueStore((state) => state.dialogue)
  const version = useDialogueStore((state) => state.version)
  const closeDialogue = useDialogueStore((state) => state.closeDialogue)

  // const dialogue = {
  //   id: 'dragon-warning',
  //   speaker: 'Mysterious Dragon',
  //   avatar: '/img/avatar/skeleton-dragon.webp',
  //   text: 'Oh, i smell human',
  // }

  if (!dialogue) return null

  return (
    <div className='pointer-events-none absolute inset-x-0 bottom-24 z-20 flex justify-center px-4'>
      <div
        key={version}
        className='flex w-full max-w-xl animate-dialogue-in items-center gap-4 rounded-2xl border border-white/10 bg-black/70 p-4 shadow-2xl backdrop-blur-md'
      >
        {dialogue.avatar && (
          <img
            src={dialogue.avatar}
            alt={dialogue.speaker}
            className='h-14 w-14 shrink-0 rounded-md border border-white/15 object-cover'
          />
        )}
        <div className='min-w-0 flex-1'>
          <p className='text-xs font-semibold uppercase tracking-widest text-amber-300/90'>
            {dialogue.speaker}
          </p>
          <p className='mt-1 text-[15px] leading-snug text-white/90'>{dialogue.text}</p>
        </div>
        <button
          type='button'
          aria-label='Close dialogue'
          onClick={() => closeDialogue(dialogue.id)}
          className='pointer-events-auto shrink-0 rounded-full p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white'
        >
          <XIcon className='h-4 w-4' weight='bold' />
        </button>
      </div>
    </div>
  )
}
