import { useEffect, useState, type ReactNode } from 'react'
import { AlarmIcon, PlayIcon } from '@phosphor-icons/react'
import MissionBoard from '../ui/Mission/MissionBoard'
import TimeBar from '../ui/Hud/TimeBar'
import { usePlayerHudStore } from '../../store/playerHudStore'

const DEFAULT_ALARM_MINUTES = 5
/** Below this many seconds the timer turns amber, then rose once it expires. */
const LOW_ALARM_SECONDS = 60

interface PlayerHudProps {
  /** Length of the alarm countdown, in minutes. */
  alarmMinutes?: number
}

function Key({ children }: { children: ReactNode }) {
  return (
    <kbd className='rounded-md border border-white/15 bg-white/5 px-1.5 py-0.5 font-sans text-[10px] font-medium leading-none text-white/70'>
      {children}
    </kbd>
  )
}

function ControlHint({ keys, label }: { keys: string[]; label: string }) {
  return (
    <span className='flex items-center gap-1.5'>
      <span className='flex items-center gap-1'>
        {keys.map((key) => (
          <Key key={key}>{key}</Key>
        ))}
      </span>
      {label}
    </span>
  )
}

interface StartOverlayProps {
  alarmMinutes: number
  onPlay: () => void
}

/**
 * Pre-run briefing. Missions are shown here — and only here — in the fantasy
 * mission board; once the player locks in, the HUD drops to the in-game panels.
 */
function StartOverlay({ alarmMinutes, onPlay }: StartOverlayProps) {
  return (
    <div
      onClick={onPlay}
      className='absolute inset-0 z-10 flex cursor-pointer select-none flex-col items-center justify-center gap-7 overflow-y-auto bg-gradient-to-b from-black/80 via-black/60 to-black/80 px-6 py-8 text-center backdrop-blur-sm'
    >
      <div className='animate-hud-in flex flex-col items-center gap-2'>
        <span className='flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5'>
          <AlarmIcon className='h-6 w-6 text-white/80' weight='duotone' />
        </span>
        <h1 className='font-mono text-2xl font-semibold tracking-tight text-white'>Before the alarm</h1>
      </div>

      <MissionBoard />

      <div className='flex flex-col items-center gap-3'>
        <span className='animate-hud-in flex items-center gap-2.5 rounded-full border border-white/15 bg-white/10 px-5 py-2.5 font-mono text-[13px] font-medium text-white shadow-2xl'>
          <PlayIcon className='h-3.5 w-3.5' weight='fill' />
          Click to explore
        </span>

        <div className='flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 text-[11px] text-white/40'>
          <ControlHint keys={['W', 'A', 'S', 'D']} label='Move' />
          <ControlHint keys={['Space']} label='Jump' />
          <ControlHint keys={['Shift']} label='Run' />
          <ControlHint keys={['Esc']} label='Release' />
        </div>

        <p className='text-[11px] tracking-wide text-white/30'>
          You have {alarmMinutes} minutes before the alarm rings.
        </p>
      </div>
    </div>
  )
}

export default function PlayerHud({ alarmMinutes = DEFAULT_ALARM_MINUTES }: PlayerHudProps = {}) {
  const isPointerLocked = usePlayerHudStore((state) => state.isPointerLocked)
  const alarmEndsAt = usePlayerHudStore((state) => state.alarmEndsAt)
  const startAlarm = usePlayerHudStore((state) => state.startAlarm)
  const resetAlarm = usePlayerHudStore((state) => state.resetAlarm)

  const [now, setNow] = useState(() => Date.now())

  // A run lives exactly as long as the pointer is locked: locking starts the
  // alarm, ESC resets it, so every session gets a fresh countdown.
  useEffect(() => {
    if (isPointerLocked) startAlarm(alarmMinutes * 60_000)
    else resetAlarm()
  }, [isPointerLocked, alarmMinutes, startAlarm, resetAlarm])

  useEffect(() => {
    if (!isPointerLocked || alarmEndsAt === null) return
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [isPointerLocked, alarmEndsAt])

  const requestPointerLock = () => {
    const canvas = document.querySelector('#root canvas')
    if (!(canvas instanceof HTMLCanvasElement)) return
    const lockRequest = canvas.requestPointerLock() as unknown as Promise<void> | undefined
    if (lockRequest && typeof lockRequest.catch === 'function') lockRequest.catch(() => {})
  }

  if (!isPointerLocked) {
    return <StartOverlay alarmMinutes={alarmMinutes} onPlay={requestPointerLock} />
  }

  const totalMs = alarmMinutes * 60_000
  // `now` only ticks once a second, so clamp to the full duration for the first
  // second of a run (and against clock jumps) instead of overshooting 100%.
  const remainingMs =
    alarmEndsAt === null ? totalMs : Math.min(totalMs, Math.max(0, alarmEndsAt - now))
  const expired = alarmEndsAt !== null && remainingMs <= 0
  const low = !expired && remainingMs <= LOW_ALARM_SECONDS * 1000
  const drainColor = expired ? '#fb7185' : low ? '#fbbf24' : '#6226c4'

  return (
    <div className='pointer-events-none absolute left-5 top-5 z-10 drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]'>
      <TimeBar className='w-72' time={totalMs} remaining={remainingMs} drainColor={drainColor} />
    </div>
  )
}
