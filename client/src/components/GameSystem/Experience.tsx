import { Physics } from '@react-three/rapier'
import Lights from '../Rendering/Lights'
import { World } from '../World/World'
import type { WorldConfig } from '../World/worldTypes'
import EcctrlWrapper from './EcctrlWrapper'
import { useEffect, useState } from 'react'
import { EffectComposer,HueSaturation, Vignette } from '@react-three/postprocessing'
import { useTexture } from '@react-three/drei'
import { GROUND_TEXTURES } from '../Rendering/map/OpenPlains'

// note for me: player + ground before first paint, everything else streams via Suspense, else things will get fucked !! :)
useTexture.preload(GROUND_TEXTURES)

export default function Experience({ config }: { config: WorldConfig }) {
  const worldConfig = config
  const mapId = worldConfig.mode === 'open' ? 'openPlains' : worldConfig.map

  const [physicsActive, setPhysicsActive] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setPhysicsActive(true), 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      {/* note for me: background + fog must share one color so distant
          geometry melts into the sky (CSS background can never blend with fog) */}
      <color attach="background" args={['#bcc0fe']} />
      <fog attach="fog" args={['#bcc0fe', 0, 100]} />
      <EffectComposer multisampling={0}>
        <HueSaturation saturation={-0.25} />
        <Vignette offset={0.25} darkness={0.8} />
      </EffectComposer>
      <Lights />
      {/*  note for me: gravty set through Ecctrl in EcctrlWrapper */}
      <Physics timeStep="vary" gravity={[0, 0, 0]} paused={!physicsActive}>
        <World config={worldConfig} />
        <EcctrlWrapper mapId={mapId} config={worldConfig} />
      </Physics>
    </>
  );
}
