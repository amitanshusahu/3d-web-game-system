import { Physics } from '@react-three/rapier'
import Lights from '../Rendering/Lights'
import { TestMap } from '../Rendering/map/TestMap'
import EcctrlWrapper from './EcctrlWrapper'
import { useControls } from 'leva'
import { useEffect, useRef } from 'react'
import { GravityField } from './GravityField'
import { useCustomGravity } from 'ecctrl/gravity'

export default function Experience() {
  /**
  * Custom gravity field
  */
  const { gravityField } = GravityField();
  const setGravityField = useCustomGravity((state) => state.setGravityField)
  useEffect(() => setGravityField(gravityField), [gravityField, setGravityField])

  /**
   * Debug settings
   */
  const timeScale = useRef(1)
  const [{ pausedPhysics, physicsDebug, physicsGravity }, setWorldSettings] = useControls(
    "World Settings",
    () => ({
      physicsDebug: false,
      pausedPhysics: true,
      physicsGravity: { value: [0, 0, 0] },
      slowMotion: {
        value: timeScale.current,
        min: 0.01,
        max: 1,
        step: 0.01,
        onChange: (value) => { timeScale.current = value },
      },
    }),
    { collapsed: true }
  );

  /**
   * Delay physics activate
   */
  useEffect(() => {
    const timeout = setTimeout(() => {
      setWorldSettings({ pausedPhysics: false });
    }, 1000);
    return () => clearTimeout(timeout);
  }, [setWorldSettings]);

  return (
    <>
      <axesHelper />
      <Lights />
      <Physics debug={physicsDebug} timeStep="vary" gravity={physicsGravity} paused={pausedPhysics}>
        <TestMap />
        <EcctrlWrapper />
      </Physics>
    </>
  );
}
