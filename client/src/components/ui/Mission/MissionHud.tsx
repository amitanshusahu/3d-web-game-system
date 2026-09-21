import { useEffect, useState } from 'react'
import { CheckCircleIcon } from '@phosphor-icons/react'
import { useMissionStore } from '../../../store/missionStore'

const TOAST_DURATION_MS = 4000

/**
 * In-game feedback only: the full mission list is shown before exploring (see
 * `MissionBoard` in the start overlay), so during a run this just flashes a
 * "mission complete" toast.
 */
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

  if (!toast) return null

  return (
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
  )
}
