import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { CapsuleCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'

const SPEED = 5
const CAM_DIST = 9
const CAM_SMOOTH = 5
const LOOK_HEIGHT = 1
const MOUSE_SENS = 0.0025
const MIN_PITCH = 0.05
const MAX_PITCH = 1.3

export default function Player() {
  const body = useRef<RapierRigidBody>(null)
  const keys = useRef<Set<string>>(new Set())
  const yaw = useRef(0)
  const pitch = useRef(0.42)
  const [locked, setLocked] = useState(false)
  const gl = useThree((s) => s.gl)

  useEffect(() => {
    const down = (e: KeyboardEvent) => keys.current.add(e.code)
    const up = (e: KeyboardEvent) => keys.current.delete(e.code)
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => {
      window.removeEventListener('keydown', down)
      window.removeEventListener('keyup', up)
    }
  }, [])

  useEffect(() => {
    const canvas = gl.domElement
    const onLockChange = () => setLocked(document.pointerLockElement === canvas)
    const onMouseMove = (e: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return
      yaw.current -= e.movementX * MOUSE_SENS
      const next = pitch.current + e.movementY * MOUSE_SENS
      pitch.current = Math.min(MAX_PITCH, Math.max(MIN_PITCH, next))
    }
    document.addEventListener('pointerlockchange', onLockChange)
    document.addEventListener('mousemove', onMouseMove)
    return () => {
      document.removeEventListener('pointerlockchange', onLockChange)
      document.removeEventListener('mousemove', onMouseMove)
    }
  }, [gl])

  const lock = () => {
    const r = gl.domElement.requestPointerLock() as unknown as Promise<void> | undefined
    if (r && typeof r.catch === 'function') r.catch(() => {})
  }

  useFrame((state, delta) => {
    const b = body.current
    if (!b) return

    const k = keys.current
    let x = 0
    let z = 0
    if (k.has('KeyW') || k.has('ArrowUp')) z -= 1
    if (k.has('KeyS') || k.has('ArrowDown')) z += 1
    if (k.has('KeyA') || k.has('ArrowLeft')) x -= 1
    if (k.has('KeyD') || k.has('ArrowRight')) x += 1

    if (x !== 0 && z !== 0) {
      x *= Math.SQRT1_2
      z *= Math.SQRT1_2
    }

    const vel = b.linvel()
    b.setLinvel({ x: x * SPEED, y: vel.y, z: z * SPEED }, true)

    const t = b.translation()
    const cam = state.camera
    const cp = Math.cos(pitch.current)
    const targetX = t.x + Math.sin(yaw.current) * cp * CAM_DIST
    const targetY = t.y + Math.sin(pitch.current) * CAM_DIST
    const targetZ = t.z + Math.cos(yaw.current) * cp * CAM_DIST
    const a = 1 - Math.exp(-CAM_SMOOTH * delta)
    cam.position.x += (targetX - cam.position.x) * a
    cam.position.y += (targetY - cam.position.y) * a
    cam.position.z += (targetZ - cam.position.z) * a
    cam.lookAt(t.x, t.y + LOOK_HEIGHT, t.z)
  })

  return (
    <>
      <RigidBody
        ref={body}
        colliders={false}
        position={[20, 2, 20]}
        lockRotations
        friction={1}
        restitution={0}
      >
        <CapsuleCollider args={[0.5, 0.5]} />
        <mesh>
          <capsuleGeometry args={[0.5, 1, 8, 16]} />
          <meshStandardMaterial color="#e63b3b" />
        </mesh>
      </RigidBody>
      <Html fullscreen>
        {locked ? (
          <div
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 6,
              height: 6,
              marginLeft: -3,
              marginTop: -3,
              borderRadius: '50%',
              background: 'white',
              pointerEvents: 'none',
            }}
          />
        ) : (
          <div
            onClick={lock}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.45)',
              color: 'white',
              fontSize: 20,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            Click to look around (WASD to move, ESC to release)
          </div>
        )}
      </Html>
    </>
  )
}
