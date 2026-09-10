import { Physics } from '@react-three/rapier'
import { EffectComposer, HueSaturation, Vignette } from '@react-three/postprocessing'
import Lights from '../Rendering/Lights'
import { TestMap } from '../Rendering/map/TestMap'
import EcctrlWrapper from './EcctrlWrapper'
import { useEffect, useState } from 'react'

export default function Experience() {

  /**
   * Delay physics activate: keep Rapier paused for the first second so the
   * GLB, textures, WASM world and shaders finish loading before the
   * simulation starts (otherwise the first huge frames cause unstable steps)
   */
  const [physicsActive, setPhysicsActive] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => setPhysicsActive(true), 1000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      {/* Dream atmosphere: background + fog must share one color so distant
          geometry melts into the sky (CSS background can never blend with fog) */}
      <color attach="background" args={['#bcc0fe']} />
      <fog attach="fog" args={['#bcc0fe', 0, 100]} />
      <EffectComposer multisampling={1}>
        <HueSaturation saturation={-0.25} />
        <Vignette offset={0.25} darkness={0.8} />
      </EffectComposer>
      <axesHelper />
      <Lights />
      {/*  gravty set through Ecctrl in EcctrlWrapper */}
      <Physics timeStep="vary" gravity={[0, 0, 0]} paused={!physicsActive}>
        <TestMap />
        <EcctrlWrapper />
      </Physics>
    </>
  );
}
