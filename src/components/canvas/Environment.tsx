import { usePlane, useBox } from '@react-three/cannon'
import { useGameStore } from '../../store/gameStore'
import { Mesh } from 'three'

export function Environment() {
  const { ambientIntensity, directionalIntensity, gridVisible } = useGameStore(state => state.environmentSettings)
  
  // Physics Ground
  const [ref] = usePlane<Mesh>(() => ({ 
    rotation: [-Math.PI / 2, 0, 0], 
    position: [0, 0, 0],
    material: { friction: 0.1 }
  }))

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={ambientIntensity} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={directionalIntensity} 
        castShadow 
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0001}
      />

      {/* Floor Visuals */}
      <mesh ref={ref} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#303030" roughness={0.8} metalness={0.2} />
      </mesh>

      {/* Grid Helper - with explicit measurements */}
      {gridVisible && <gridHelper args={[100, 100, 0xff0000, 0x666666]} position={[0, 0.01, 0]} />}

      {/* Platforms / Obstacles */}
      <Platform position={[3, 0.5, 0]} args={[2, 1, 2]} color="#44aa88" />
      <Platform position={[-3, 0.25, 2]} args={[2, 0.5, 2]} color="#aa4488" />
      <Platform position={[0, 0.25, -3]} args={[4, 0.5, 2]} color="#4488aa" />
    </>
  )
}

function Platform({ position, args, color }: { position: [number, number, number], args: [number, number, number], color: string }) {
  const [ref] = useBox<Mesh>(() => ({ 
    mass: 0, // Static
    type: 'Static',
    position, 
    args 
  }))

  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}
