import { useGameStore } from '../../store/gameStore'
import { motion } from 'framer-motion'

export function Overlay() {
  const { 
    currentAction, 
    availableActions, 
    setAction, 
    environmentSettings, 
    updateEnvironment,
    debugPhysics,
    toggleDebugPhysics,
    isControlMode,
    toggleControlMode,
    movementMode,
    setMovementMode,
    activeControls,
    setControlState
  } = useGameStore()

  // Helper for directional buttons
  const bindControl = (control: 'forward' | 'backward' | 'left' | 'right') => ({
    onPointerDown: () => setControlState(control, true),
    onPointerUp: () => setControlState(control, false),
    onPointerLeave: () => setControlState(control, false),
    className: `d-pad-btn ${control === 'forward' ? 'up' : control === 'backward' ? 'down' : control} ${activeControls[control] ? 'pressed' : ''}`
  })

  return (
    <div className="overlay-container">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="status-panel"
      >
        <h1>🤖 Robot Controller</h1>
        <div className="status-indicator">
          Status: <span className="status-value">{isControlMode ? `Moving (${movementMode})` : currentAction}</span>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="controls-panel"
      >
        <div className="panel-section">
          <h3>Control Mode</h3>
          <div className="mode-toggle-container">
            <button 
              className={`mode-toggle-btn ${isControlMode ? 'active' : ''}`}
              onClick={toggleControlMode}
            >
              {isControlMode ? '🎮 Directional Control' : '🎬 Animation Presets'}
            </button>
          </div>

          {isControlMode ? (
            <div className="directional-controls">
              <div className="movement-mode-selector">
                <button 
                  className={`move-mode-btn ${movementMode === 'walk' ? 'active' : ''}`}
                  onClick={() => setMovementMode('walk')}
                >
                  Walk
                </button>
                <button 
                  className={`move-mode-btn ${movementMode === 'run' ? 'active' : ''}`}
                  onClick={() => setMovementMode('run')}
                >
                  Run
                </button>
              </div>

              <div className="d-pad">
                <button {...bindControl('forward')}>⬆️</button>
                <button {...bindControl('left')}>⬅️</button>
                <button {...bindControl('backward')}>⬇️</button>
                <button {...bindControl('right')}>➡️</button>
              </div>
            </div>
          ) : (
            <div className="actions-grid">
              {availableActions.length === 0 ? (
                <p>Loading animations...</p>
              ) : (
                availableActions.map(action => (
                  <button
                    key={action}
                    className={`action-btn ${currentAction === action ? 'active' : ''}`}
                    onClick={() => setAction(action)}
                  >
                    {action}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <div className="panel-section">
          <h3>Environment</h3>
          <div className="env-controls">
            <label>
              <input 
                type="checkbox" 
                checked={environmentSettings.gridVisible} 
                onChange={(e) => updateEnvironment({ gridVisible: e.target.checked })} 
              />
              Grid
            </label>
            <label>
              <input 
                type="checkbox" 
                checked={debugPhysics} 
                onChange={toggleDebugPhysics} 
              />
              Debug
            </label>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
