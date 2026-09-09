import { useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { CapsuleCollider, RigidBody, type RapierRigidBody } from '@react-three/rapier'

const MOVE_SPEED = 5
const CAMERA_DISTANCE = 3
const CAMERA_SMOOTHING_SPEED = 5
const CAMERA_LOOK_AT_HEIGHT = 1
const MOUSE_SENSITIVITY = 0.0025
const MIN_CAMERA_PITCH = 0.05
const MAX_CAMERA_PITCH = 1.3

export default function Player() {
  const playerBodyRef = useRef<RapierRigidBody>(null)
  const pressedKeysRef = useRef<Set<string>>(new Set())
  const cameraYawRef = useRef(0)
  const cameraPitchRef = useRef(0.42)
  const [isPointerLocked, setIsPointerLocked] = useState(false)
  const renderer = useThree((s) => s.gl)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => pressedKeysRef.current.add(event.code)
    const handleKeyUp = (event: KeyboardEvent) => pressedKeysRef.current.delete(event.code)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useEffect(() => {
    const canvas = renderer.domElement
    const handlePointerLockChange = () => setIsPointerLocked(document.pointerLockElement === canvas)
    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return
      cameraYawRef.current -= event.movementX * MOUSE_SENSITIVITY
      const nextPitch = cameraPitchRef.current + event.movementY * MOUSE_SENSITIVITY
      cameraPitchRef.current = Math.min(MAX_CAMERA_PITCH, Math.max(MIN_CAMERA_PITCH, nextPitch))
    }
    document.addEventListener('pointerlockchange', handlePointerLockChange)
    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [renderer])

  const requestPointerLock = () => {
    const lockRequest = renderer.domElement.requestPointerLock() as unknown as Promise<void> | undefined
    if (lockRequest && typeof lockRequest.catch === 'function') lockRequest.catch(() => {})
  }

  useFrame((state, delta) => {
    const playerBody = playerBodyRef.current
    if (!playerBody) return

    const pressedKeys = pressedKeysRef.current
    let sidewaysInput = 0
    let forwardInput = 0
    if (pressedKeys.has('KeyW') || pressedKeys.has('ArrowUp')) forwardInput -= 1
    if (pressedKeys.has('KeyS') || pressedKeys.has('ArrowDown')) forwardInput += 1
    if (pressedKeys.has('KeyA') || pressedKeys.has('ArrowLeft')) sidewaysInput -= 1
    if (pressedKeys.has('KeyD') || pressedKeys.has('ArrowRight')) sidewaysInput += 1

    if (sidewaysInput !== 0 && forwardInput !== 0) {
      sidewaysInput *= Math.SQRT1_2
      forwardInput *= Math.SQRT1_2
    }

    const sinYaw = Math.sin(cameraYawRef.current)
    const cosYaw = Math.cos(cameraYawRef.current)
    const worldMoveX = sidewaysInput * cosYaw + forwardInput * sinYaw
    const worldMoveZ = -sidewaysInput * sinYaw + forwardInput * cosYaw

    const currentVelocity = playerBody.linvel()
    playerBody.setLinvel({ x: worldMoveX * MOVE_SPEED, y: currentVelocity.y, z: worldMoveZ * MOVE_SPEED }, true)

    const playerPosition = playerBody.translation()
    const camera = state.camera
    const cosPitch = Math.cos(cameraPitchRef.current)
    const desiredCameraX = playerPosition.x + Math.sin(cameraYawRef.current) * cosPitch * CAMERA_DISTANCE
    const desiredCameraY = playerPosition.y + Math.sin(cameraPitchRef.current) * CAMERA_DISTANCE
    const desiredCameraZ = playerPosition.z + Math.cos(cameraYawRef.current) * cosPitch * CAMERA_DISTANCE
    const smoothingFactor = 1 - Math.exp(-CAMERA_SMOOTHING_SPEED * delta)
    camera.position.x += (desiredCameraX - camera.position.x) * smoothingFactor
    camera.position.y += (desiredCameraY - camera.position.y) * smoothingFactor
    camera.position.z += (desiredCameraZ - camera.position.z) * smoothingFactor
    camera.lookAt(playerPosition.x, playerPosition.y + CAMERA_LOOK_AT_HEIGHT, playerPosition.z)
  })

  return (
    <>
      <RigidBody
        ref={playerBodyRef}
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
        {isPointerLocked ? (
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
            onClick={requestPointerLock}
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
