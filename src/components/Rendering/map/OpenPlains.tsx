import * as THREE from 'three'
import { useLoader, type ThreeElements } from '@react-three/fiber'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { TextureLoader, RepeatWrapping, SRGBColorSpace } from 'three'

const SIZE = 2000
const HALF = SIZE / 2
const WALL_HEIGHT = 4
const WALL_THICKNESS = 1

export const OpenPlainsSpawnZones: Array<[number, number, number]> = [
    [0, 0, 20],
    [400, 300, 20],
    [-400, -300, 20],
    [600, -500, 20],
    [-600, 500, 20],
]

export function OpenPlains(props: ThreeElements['group']) {
    const [diffuse, normal, roughness, ao] = useLoader(TextureLoader, [
        '/texture/ground/optimized/road_damaged_diff.png',
        '/texture/ground/optimized/road_damaged_nor_gl.png',
        '/texture/ground/optimized/road_damaged_rough.png',
        '/texture/ground/optimized/road_damaged_ao.png',
    ])

    diffuse.colorSpace = SRGBColorSpace;
    [diffuse, normal, roughness, ao].forEach((texture) => {
        texture.wrapS = RepeatWrapping
        texture.wrapT = RepeatWrapping
        texture.repeat.set(200, 200)
        texture.anisotropy = 8
    })

    return (
        <group {...props} dispose={null}>
            <RigidBody type="fixed" colliders={false} position={[0, -1, 0]}>
                <CuboidCollider args={[HALF, 1, HALF]} />
                <mesh receiveShadow rotation-x={-Math.PI / 2}>
                    <planeGeometry args={[SIZE, SIZE]} />
                    <meshStandardMaterial map={diffuse} normalMap={normal} roughnessMap={roughness} aoMap={ao} />
                </mesh>
            </RigidBody>

            {/* Invisible boundary walls (no mesh, colliders only) */}
            <RigidBody type="fixed" colliders={false}>
                <CuboidCollider args={[WALL_THICKNESS, WALL_HEIGHT / 2, HALF]} position={[-HALF, WALL_HEIGHT / 2, 0]} />
                <CuboidCollider args={[WALL_THICKNESS, WALL_HEIGHT / 2, HALF]} position={[HALF, WALL_HEIGHT / 2, 0]} />
                <CuboidCollider args={[HALF, WALL_HEIGHT / 2, WALL_THICKNESS]} position={[0, WALL_HEIGHT / 2, -HALF]} />
                <CuboidCollider args={[HALF, WALL_HEIGHT / 2, WALL_THICKNESS]} position={[0, WALL_HEIGHT / 2, HALF]} />
            </RigidBody>
        </group>
    )
}
