import { create } from 'zustand'

interface GameState {
  currentAction: string
  availableActions: string[]
  debugPhysics: boolean
  environmentSettings: {
    ambientIntensity: number
    directionalIntensity: number
    gridVisible: boolean
  }
  
  // New Control Features
  isControlMode: boolean
  movementMode: 'walk' | 'run'
  activeControls: {
    forward: boolean
    backward: boolean
    left: boolean
    right: boolean
  }

  setAction: (action: string) => void
  setAvailableActions: (actions: string[]) => void
  toggleDebugPhysics: () => void
  updateEnvironment: (settings: Partial<GameState['environmentSettings']>) => void
  
  // New Actions
  toggleControlMode: () => void
  setMovementMode: (mode: 'walk' | 'run') => void
  setControlState: (control: keyof GameState['activeControls'], isActive: boolean) => void
}

export const useGameStore = create<GameState>((set) => ({
  currentAction: 'Idle',
  availableActions: [],
  debugPhysics: false,
  environmentSettings: {
    ambientIntensity: 0.5,
    directionalIntensity: 1,
    gridVisible: true,
  },

  // Initial State for Control Mode
  isControlMode: false,
  movementMode: 'walk',
  activeControls: {
    forward: false,
    backward: false,
    left: false,
    right: false,
  },

  setAction: (action) => set({ currentAction: action }),
  setAvailableActions: (actions) => set({ availableActions: actions }),
  toggleDebugPhysics: () => set((state) => ({ debugPhysics: !state.debugPhysics })),
  updateEnvironment: (settings) => 
    set((state) => ({ 
      environmentSettings: { ...state.environmentSettings, ...settings } 
    })),

  toggleControlMode: () => set((state) => ({ isControlMode: !state.isControlMode })),
  setMovementMode: (mode) => set({ movementMode: mode }),
  setControlState: (control, isActive) => 
    set((state) => ({
      activeControls: { ...state.activeControls, [control]: isActive }
    })),
}))
