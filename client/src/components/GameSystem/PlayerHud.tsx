import { useEffect, useState, type ReactNode } from 'react'
import { AlarmIcon, PlayIcon } from '@phosphor-icons/react'
import MissionBoard from '../ui/Mission/MissionBoard'
import { usePlayerHudStore } from '../../store/playerHudStore'

const DEFAULT_OBJECTIVE = 'Explore the world before your alarm goes off'
const DEFAULT_ALARM_MINUTES = 5
const LOW_ALARM_SECONDS = 60

interface PlayerHudProps {
  /** The gamified objective shown in the top banner. */
  objective?: string
  /** Length of the alarm countdown, in minutes. */
  alarmMinutes?: number
}

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
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

function Crosshair() {
  return (
    <div className='pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2'>
      <div className='flex h-7 w-7 items-center justify-center rounded-full border border-white/15'>
        <span className='h-1 w-1 rounded-full bg-white/90' />
      </div>
    </div>
  )
}

function StatusPill({ isGrounded }: { isGrounded: boolean }) {
  return (
    <div className='pointer-events-none absolute bottom-5 left-5 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5 backdrop-blur-md'>
      <span className={`h-1.5 w-1.5 rounded-full ${isGrounded ? 'bg-emerald-400' : 'bg-amber-400'}`} />
      <span className='text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70'>
        {isGrounded ? 'Grounded' : 'Airborne'}
      </span>
    </div>
  )
}

function ControlBar() {
  return (
    <div className='pointer-events-none absolute bottom-5 right-5 z-10 hidden items-center gap-5 text-[11px] text-white/45 lg:flex'>
      <ControlHint keys={['W', 'A', 'S', 'D']} label='Move' />
      <ControlHint keys={['Space']} label='Jump' />
      <ControlHint keys={['Shift']} label='Run' />
      <ControlHint keys={['Esc']} label='Release' />
    </div>
  )
}

interface ObjectiveBannerProps {
  objective: string
  remainingSeconds: number
  progress: number
  expired: boolean
}

function ObjectiveBanner({ objective, remainingSeconds, progress, expired }: ObjectiveBannerProps) {
  const low = !expired && remainingSeconds <= LOW_ALARM_SECONDS
  const clockColor = expired ? 'text-rose-300' : low ? 'text-amber-300' : 'text-white/70'
  const barColor = expired
    ? 'bg-rose-500'
    : low
      ? 'bg-amber-400'
      : 'bg-gradient-to-r from-sky-400 to-emerald-400'

  return (
    <div className='pointer-events-none absolute inset-x-0 top-5 z-10 flex justify-center px-5'>
      <div className='animate-hud-in w-full max-w-sm rounded-2xl border border-white/10 bg-black/40 px-4 py-3 shadow-2xl backdrop-blur-md'>
        <div className='flex items-center gap-2'>
          <AlarmIcon
            className={`h-3.5 w-3.5 ${expired ? 'text-rose-300' : 'text-white/50'}`}
            weight='bold'
          />
          <span className='text-[10px] font-semibold uppercase tracking-[0.22em] text-white/50'>
            {expired ? "Time's up" : 'Objective'}
          </span>
          <span className={`ml-auto text-[13px] font-semibold tabular-nums ${clockColor}`}>
            {formatClock(remainingSeconds)}
          </span>
        </div>

        <p className='mt-1.5 text-[13.5px] font-medium leading-snug text-white/90'>{objective}</p>

        <div className='mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10'>
          <div
            className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${barColor}`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
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

export default function PlayerHud({
  objective = DEFAULT_OBJECTIVE,
  alarmMinutes = DEFAULT_ALARM_MINUTES,
}: PlayerHudProps = {}) {
  const isPointerLocked = usePlayerHudStore((state) => state.isPointerLocked)
  const isGrounded = usePlayerHudStore((state) => state.isGrounded)
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
  const remainingSeconds = Math.ceil(remainingMs / 1000)
  const expired = alarmEndsAt !== null && remainingMs <= 0
  const progress = totalMs > 0 ? remainingMs / totalMs : 0

  return (
    <>
      <Crosshair />
      <ObjectiveBanner
        objective={objective}
        remainingSeconds={remainingSeconds}
        progress={progress}
        expired={expired}
      />
      <StatusPill isGrounded={isGrounded} />
      <ControlBar />
    </>
  )
}
