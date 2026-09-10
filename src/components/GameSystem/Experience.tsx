import { Physics } from '@react-three/rapier'
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
