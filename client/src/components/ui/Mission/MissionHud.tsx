import { useEffect, useState } from 'react'
import { CheckCircleIcon, CircleIcon } from '@phosphor-icons/react'
import { useMissionStore } from '../../../store/missionStore'

const TOAST_DURATION_MS = 4000

export default function MissionHud() {
  const missions = useMissionStore((state) => state.missions)
  const completedIds = useMissionStore((state) => state.completedIds)
  const version = useMissionStore((state) => state.version)

  const [dismissedVersion, setDismissedVersion] = useState(0)

  const lastCompletedId = completedIds[completedIds.length - 1]
  const lastCompleted = lastCompletedId
    ? missions.find((mission) => mission.id === lastCompletedId) ?? null
    : null
  const toast = version > dismissedVersion ? lastCompleted : null

  useEffect(() => {
    if (version === dismissedVersion) return
    const timer = setTimeout(() => setDismissedVersion(version), TOAST_DURATION_MS)
    return () => clearTimeout(timer)
  }, [version, dismissedVersion])

  if (missions.length === 0) return null

  return (
    <>
      {toast && (
        <div className='pointer-events-none absolute inset-x-0 top-16 z-30 flex justify-center px-4'>
          <div
            key={version}
            className='animate-mission-in flex items-center gap-3 rounded-xl border border-emerald-400/25 bg-emerald-500/15 px-4 py-2.5 shadow-2xl backdrop-blur-md'
          >
            <CheckCircleIcon className='h-7 w-7 shrink-0 text-emerald-400' weight='fill' />
            <div>
              <p className='text-[10.5px] font-semibold uppercase tracking-widest text-emerald-300'>
                Mission complete
              </p>
              <p className='text-[14.5px] font-medium text-white'>{toast.name}</p>
            </div>
          </div>
        </div>
      )}

      <div className='pointer-events-none absolute right-3 top-3 z-20 w-64 max-w-[72vw]'>
        <div className='rounded-xl border border-white/10 bg-black/60 p-3 shadow-2xl backdrop-blur-md'>
          <div className='flex items-center justify-between'>
            <p className='text-[10.5px] font-semibold uppercase tracking-widest text-white/50'>Missions</p>
            <span className='text-[11px] tabular-nums text-white/50'>
              {completedIds.length}/{missions.length}
            </span>
          </div>
          <ul className='mt-2 space-y-2'>
            {missions.map((mission) => {
              const done = completedIds.includes(mission.id)
              return (
                <li key={mission.id} className='flex items-start gap-2'>
                  {done ? (
                    <CheckCircleIcon className='mt-0.5 h-4 w-4 shrink-0 text-emerald-400' weight='fill' />
                  ) : (
                    <CircleIcon className='mt-0.5 h-4 w-4 shrink-0 text-white/25' />
                  )}
                  <div className='min-w-0'>
                    <p
                      className={`text-[13px] font-medium leading-tight ${
                        done ? 'text-white/40 line-through' : 'text-white/90'
                      }`}
                    >
                      {mission.name}
                    </p>
                    {mission.description && (
                      <p className='mt-0.5 text-[11.5px] leading-snug text-white/45'>{mission.description}</p>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </>
  )
}
