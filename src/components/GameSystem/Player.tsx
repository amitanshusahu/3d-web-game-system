import { CapsuleCollider, RigidBody } from '@react-three/rapier'

export default function Player() {
  return (
    <RigidBody
      colliders={false}
      position={[3, 2, 0]}
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
