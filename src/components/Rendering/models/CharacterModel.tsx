import * as THREE from 'three'
import { useGLTF } from '@react-three/drei'
import { type GLTF } from 'three-stdlib'
import { type ThreeElements } from '@react-three/fiber'

export default function CharacterModel(props: ThreeElements['group']) {
  return (
    <group {...props} dispose={null}>
      <mesh castShadow receiveShadow />
    </group>
  )
}

useGLTF.preload('/models/capsule.glb')

type GLTFResult = GLTF & {
  nodes: {
    Capsule: THREE.Mesh
  }
  materials: {
    GridTexture: THREE.MeshStandardMaterial
  }
}
