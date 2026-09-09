import { useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CapsuleCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'

const SPEED = 5

export default function Player() {
  const body = useRef<RapierRigidBody>(null)
  const keys = useRef<Set<string>>(new Set())

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

  useFrame(() => {
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
  })

  return (
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
  )
}
