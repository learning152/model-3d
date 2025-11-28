import { Canvas } from '@react-three/fiber'
import { Physics, Debug } from '@react-three/cannon'
import { Suspense } from 'react'
import { OrbitControls, Loader } from '@react-three/drei'
import { ErrorBoundary } from 'react-error-boundary'

import { Robot } from './components/canvas/Robot'
import { Environment } from './components/canvas/Environment'
import { Overlay } from './components/dom/Overlay'
import { useGameStore } from './store/gameStore'
import './App.css'

function Scene() {
  const debugPhysics = useGameStore(state => state.debugPhysics)
  
  return (
    <Physics gravity={[0, -9.8, 0]}>
      {debugPhysics && <Debug color="black" scale={1.1} />}
      <Environment />
      <Robot position={[0, 0, 0]} />
    </Physics>
  )
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div role="alert" className="error-boundary">
      <h2>⚠️ Scene Error</h2>
      <pre>{error.message}</pre>
      <button onClick={() => window.location.reload()}>Reload</button>
    </div>
  )
}

function App() {
  return (
    <div className="app-container">
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 2, 5], fov: 50 }}>
          <Suspense fallback={null}>
            <Scene />
            <OrbitControls makeDefault minPolarAngle={0} maxPolarAngle={Math.PI / 2} />
          </Suspense>
        </Canvas>
        <Loader containerStyles={{ background: '#1a1a1a' }} />
        <Overlay />
      </ErrorBoundary>
    </div>
  )
}

export default App
