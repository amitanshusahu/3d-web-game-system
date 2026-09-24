import { useEffect, useRef } from 'react'
import { useMapExploreStore } from '../../../store/mapExploreStore'
import { usePlayerStore } from '../../../store/playerStore'

const MAP_PX = 168
const COMPASS_PX = 56

const COLOR_UNEXPLORED = 'rgba(8, 5, 16, 0.92)'
const COLOR_EXPLORED = 'rgba(124, 58, 237, 0.5)'
const COLOR_GRID = 'rgba(255, 255, 255, 0.06)'
const COLOR_MARKER = '#c084fc'
const COLOR_PLAYER = '#f8fafc'
const COLOR_FRAME = 'rgba(255, 255, 255, 0.14)'

/** Compass direction → dial angle (clockwise from north). */
const COMPASS_POINTS: Array<[label: string, angle: number]> = [
  ['N', 0],
  ['E', Math.PI / 2],
  ['S', Math.PI],
  ['W', -Math.PI / 2],
]

/** Size the backing store for the device pixel ratio while drawing in CSS pixels. */
function prepareCanvas(canvas: HTMLCanvasElement, size: number, dpr: number) {
  canvas.width = Math.round(size * dpr)
  canvas.height = Math.round(size * dpr)
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return ctx
}

/**
 * Flat top-down minimap for the in-game HUD. Explored cells, config object
 * positions (purple dots) and the player arrow are drawn north-up, with a
 * compass dial showing which way the player faces. Drawing runs on its own
 * animation frame and reads the stores imperatively, so neither the player's
 * per-frame position nor the map repaints re-render React.
 */
export default function MiniMap() {
  const active = useMapExploreStore((state) => state.active)
  const percent = useMapExploreStore((state) => state.percent)
  const mapRef = useRef<HTMLCanvasElement>(null)
  const compassRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (!active) return
    const mapCanvas = mapRef.current
    const compassCanvas = compassRef.current
    if (!mapCanvas || !compassCanvas) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const mapCtx = prepareCanvas(mapCanvas, MAP_PX, dpr)
    const compassCtx = prepareCanvas(compassCanvas, COMPASS_PX, dpr)
    if (!mapCtx || !compassCtx) return

    // Repainting the whole grid every frame is wasteful, so cache the coverage
    // in an offscreen canvas and only rebuild it when a cell is revealed.
    const coverage = document.createElement('canvas')
    coverage.width = Math.round(MAP_PX * dpr)
    coverage.height = Math.round(MAP_PX * dpr)
    const coverageCtx = coverage.getContext('2d')
    if (!coverageCtx) return
    coverageCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
    let cachedRevision = -1

    const drawMap = () => {
      const state = useMapExploreStore.getState()
      const { size, divisions, visited, cellSize, markers } = state
      if (size <= 0) return

      const cellPx = (cellSize / size) * MAP_PX
      const toMapX = (x: number) => ((x + size / 2) / size) * MAP_PX
      const toMapY = (z: number) => ((z + size / 2) / size) * MAP_PX

      if (cachedRevision !== state.revision) {
        coverageCtx.clearRect(0, 0, MAP_PX, MAP_PX)
        coverageCtx.fillStyle = COLOR_UNEXPLORED
        coverageCtx.fillRect(0, 0, MAP_PX, MAP_PX)
        coverageCtx.fillStyle = COLOR_EXPLORED
        for (let row = 0; row < divisions; row++) {
          const y = row * cellPx
          for (let col = 0; col < divisions; col++) {
            if (visited[row * divisions + col]) coverageCtx.fillRect(col * cellPx, y, cellPx + 0.5, cellPx + 0.5)
          }
        }
        coverageCtx.strokeStyle = COLOR_GRID
        coverageCtx.lineWidth = 1
        for (let i = 1; i < divisions; i++) {
          const p = i * cellPx
          coverageCtx.beginPath()
          coverageCtx.moveTo(p, 0)
          coverageCtx.lineTo(p, MAP_PX)
          coverageCtx.stroke()
          coverageCtx.beginPath()
          coverageCtx.moveTo(0, p)
          coverageCtx.lineTo(MAP_PX, p)
          coverageCtx.stroke()
        }
        cachedRevision = state.revision
      }

      mapCtx.clearRect(0, 0, MAP_PX, MAP_PX)
      mapCtx.drawImage(coverage, 0, 0, MAP_PX, MAP_PX)

      // Config object positions as purple dots.
      mapCtx.fillStyle = COLOR_MARKER
      for (const marker of markers) {
        mapCtx.beginPath()
        mapCtx.arc(toMapX(marker.x), toMapY(marker.z), 2.4, 0, Math.PI * 2)
        mapCtx.fill()
      }

      // Player arrow. North (−Z) is up, so the camera yaw rotates the arrow.
      const { position, heading } = usePlayerStore.getState()
      mapCtx.save()
      mapCtx.translate(toMapX(position.x), toMapY(position.z))
      mapCtx.rotate(-heading)
      mapCtx.beginPath()
      mapCtx.moveTo(0, -7)
      mapCtx.lineTo(5, 5)
      mapCtx.lineTo(0, 2)
      mapCtx.lineTo(-5, 5)
      mapCtx.closePath()
      mapCtx.fillStyle = COLOR_PLAYER
      mapCtx.fill()
      mapCtx.restore()

      mapCtx.strokeStyle = COLOR_FRAME
      mapCtx.lineWidth = 1
      mapCtx.strokeRect(0.5, 0.5, MAP_PX - 1, MAP_PX - 1)
      mapCtx.fillStyle = 'rgba(255, 255, 255, 0.7)'
      mapCtx.font = '600 9px "DM Sans", sans-serif'
      mapCtx.textAlign = 'center'
      mapCtx.textBaseline = 'top'
      mapCtx.fillText('N', MAP_PX / 2, 3)
    }

    const drawCompass = () => {
      const r = COMPASS_PX / 2
      const { heading } = usePlayerStore.getState()

      compassCtx.clearRect(0, 0, COMPASS_PX, COMPASS_PX)
      compassCtx.beginPath()
      compassCtx.arc(r, r, r - 2, 0, Math.PI * 2)
      compassCtx.fillStyle = 'rgba(8, 5, 16, 0.72)'
      compassCtx.fill()
      compassCtx.strokeStyle = COLOR_FRAME
      compassCtx.lineWidth = 1
      compassCtx.stroke()

      // Rotating the dial by the camera yaw keeps the faced direction at the top.
      compassCtx.save()
      compassCtx.translate(r, r)
      compassCtx.rotate(heading)
      compassCtx.textAlign = 'center'
      compassCtx.textBaseline = 'middle'
      const ring = r - 11
      for (const [label, angle] of COMPASS_POINTS) {
        compassCtx.font = `700 ${label === 'N' ? 11 : 9}px "DM Sans", sans-serif`
        compassCtx.fillStyle = label === 'N' ? '#f59e0b' : 'rgba(255, 255, 255, 0.55)'
        compassCtx.fillText(label, Math.sin(angle) * ring, -Math.cos(angle) * ring)
      }
      compassCtx.restore()

      // Fixed pointer marking the direction the player faces.
      compassCtx.beginPath()
      compassCtx.moveTo(r, 1)
      compassCtx.lineTo(r + 4, 7)
      compassCtx.lineTo(r - 4, 7)
      compassCtx.closePath()
      compassCtx.fillStyle = COLOR_PLAYER
      compassCtx.fill()
    }

    let frame = requestAnimationFrame(function render() {
      drawMap()
      drawCompass()
      frame = requestAnimationFrame(render)
    })
    return () => cancelAnimationFrame(frame)
  }, [active])

  if (!active) return null

  return (
    <div className='flex flex-col items-end gap-2'>
      <div className='flex items-end gap-2'>
        <div className='rounded-xl border border-white/10 bg-black/45 p-1.5 shadow-2xl backdrop-blur-sm'>
          <canvas ref={mapRef} className='block rounded-md' style={{ width: MAP_PX, height: MAP_PX }} />
        </div>
        <canvas ref={compassRef} className='block' style={{ width: COMPASS_PX, height: COMPASS_PX }} />
      </div>
      <div className='rounded-lg border border-white/10 bg-black/45 px-2.5 py-1 font-mono text-[10.5px] font-semibold uppercase tracking-[0.22em] text-white/60 shadow-2xl backdrop-blur-sm'>
        Explored <span className='tabular-nums text-white'>{percent}%</span>
      </div>
    </div>
  )
}
