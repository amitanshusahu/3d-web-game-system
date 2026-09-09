import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { CapsuleCollider, RigidBody, useRapier, type RapierRigidBody } from '@react-three/rapier'
import { setPlayerHud } from './playerHudStore'

const MOVE_SPEED = 5
const JUMP_VELOCITY = 5
const GROUND_RAY_LENGTH = 1.1
const CAMERA_DISTANCE = 5
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
  const isGroundedRef = useRef(false)
  const renderer = useThree((s) => s.gl)
  const { world, rapier } = useRapier()

  const groundRayRef = useRef<InstanceType<typeof rapier.Ray> | null>(null)

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
    const handlePointerLockChange = () => {
      setPlayerHud({ isPointerLocked: document.pointerLockElement === canvas })
    }
    const handleMouseMove = (event: MouseEvent) => {
      if (document.pointerLockElement !== canvas) return
      cameraYawRef.current -= event.movementX * MOUSE_SENSITIVITY
      const nextPitch = cameraPitchRef.current + event.movementY * MOUSE_SENSITIVITY
      cameraPitchRef.current = Math.min(MAX_CAMERA_PITCH, Math.max(MIN_CAMERA_PITCH, nextPitch))
    }
    handlePointerLockChange()
    document.addEventListener('pointerlockchange', handlePointerLockChange)
    document.addEventListener('mousemove', handleMouseMove)
    return () => {
      document.removeEventListener('pointerlockchange', handlePointerLockChange)
      document.removeEventListener('mousemove', handleMouseMove)
    }
  }, [renderer])

  useFrame((state, delta) => {
    const playerBody = playerBodyRef.current
    if (!playerBody) return

    const playerPosition = playerBody.translation()
    if (groundRayRef.current === null) {
      groundRayRef.current = new rapier.Ray({ x: 0, y: 0, z: 0 }, { x: 0, y: -1, z: 0 })
    }
    const groundRay = groundRayRef.current
    groundRay.origin.x = playerPosition.x
    groundRay.origin.y = playerPosition.y
    groundRay.origin.z = playerPosition.z
    const groundHit = world.castRay(groundRay, GROUND_RAY_LENGTH, true, undefined, undefined, undefined, playerBody)
    const groundedNow = groundHit !== null
    if (groundedNow !== isGroundedRef.current) {
      isGroundedRef.current = groundedNow
      setPlayerHud({ isGrounded: groundedNow })
    }

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
    let verticalVelocity = currentVelocity.y
    if (pressedKeys.has('Space') && isGroundedRef.current) {
      verticalVelocity = JUMP_VELOCITY
    }
    playerBody.setLinvel({ x: worldMoveX * MOVE_SPEED, y: verticalVelocity, z: worldMoveZ * MOVE_SPEED }, true)

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
  )
}
