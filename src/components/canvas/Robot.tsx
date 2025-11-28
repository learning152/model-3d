import { useEffect, useRef, useMemo } from 'react'
import { useAnimations } from '@react-three/drei'
import { useLoader, useFrame } from '@react-three/fiber'
import { FBXLoader } from 'three-stdlib'
import { useGameStore } from '../../store/gameStore'
import { Group, Mesh, AnimationClip, Vector3 } from 'three'
import { MODEL_FILES } from '../../config/models'

export function Robot(props: any) {
  const group = useRef<Group>(null)
  
  // Load all models at once. The first one is the base model (X-Bot),
  // the rest are animation files.
  const allModels = useLoader(FBXLoader, MODEL_FILES as unknown as string[])
  const baseModel = allModels[0]
  const extraAnimations = allModels.slice(1)

  // Combine all animations: Base Model Animations + Extra File Animations
  const allAnimations = useMemo(() => {
    const animations: AnimationClip[] = []

    // 1. Add animations from the base model
    if (baseModel.animations) {
      baseModel.animations.forEach((clip: AnimationClip) => {
        // Keep original name or rename if needed
        if (clip.name === 'mixamo.com') clip.name = 'Base_Idle' // Optional renaming
        animations.push(clip)
      })
    }

    // 2. Add animations from extra files
    // We need corresponding file names for naming the animations
    const extraFiles = MODEL_FILES.slice(1)
    
    extraAnimations.forEach((group, index) => {
      const filePath = extraFiles[index]
      
      if (group && group.animations) {
        group.animations.forEach((clip: { name: any; clone: () => any }) => {
          // Extract clean name from file path: "/Crouch To Stand.fbx" -> "Crouch To Stand"
          const cleanName = filePath ? filePath.split('/').pop()?.replace('.fbx', '') : clip.name
          
          // Clone the clip to avoid mutating the cached original
          const newClip = clip.clone()
          newClip.name = cleanName || clip.name
          animations.push(newClip)
        })
      }
    })

    return animations
  }, [baseModel, extraAnimations])

  const { actions, names } = useAnimations(allAnimations, group)
  
  const currentAction = useGameStore((state) => state.currentAction)
  const setAvailableActions = useGameStore((state) => state.setAvailableActions)
  const setAction = useGameStore((state) => state.setAction)
  
  // Control Mode State
  const isControlMode = useGameStore((state) => state.isControlMode)
  const movementMode = useGameStore((state) => state.movementMode)
  const activeControls = useGameStore((state) => state.activeControls)

  // Movement Logic
  useFrame((state, delta) => {
    if (!isControlMode || !group.current) return

    const { forward, backward, left, right } = activeControls
    const moveSpeed = movementMode === 'run' ? 5 : 2
    const rotateSpeed = 3
    
    // Rotation
    if (left) group.current.rotation.y += rotateSpeed * delta
    if (right) group.current.rotation.y -= rotateSpeed * delta

    // Movement
    const isMoving = forward || backward
    if (isMoving) {
      const direction = forward ? 1 : -1
      group.current.translateZ(direction * moveSpeed * delta)
    }

    // Animation Sync
    let desiredAction = 'Base_Idle'
    if (isMoving) {
      desiredAction = movementMode === 'run' ? 'Jogging' : 'Start Walking'
    }

    // Only update if changed and valid
    if (desiredAction !== currentAction) {
      // Check if action exists before setting to avoid flickering or errors
      // We can use 'names' from useAnimations, but we need to access it inside useFrame?
      // Actually setAction updates store, which triggers useEffect below.
      // We should check if the desired action is different to prevent loop.
      setAction(desiredAction)
    }
  })

  // Initialize actions and shadows
  useEffect(() => {
    if (names.length > 0) {
      console.log('Found combined animations:', names)
      setAvailableActions(names)
      
      // Set initial action if current is invalid
      if (!names.includes(currentAction)) {
        // Prefer "Base_Idle" or just the first one
        const idleAnimation = names.find(name => name.includes('Idle')) || names[0]
        setAction(idleAnimation)
      }
    }

    // Enable shadows for base model
    baseModel.traverse((child) => {
      if ((child as Mesh).isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [baseModel, names, setAvailableActions, setAction, currentAction])

  // Handle Animation Transitions
  useEffect(() => {
    let targetActionName = currentAction

    // If specific action not found, try fuzzy match
    if (!actions[targetActionName]) {
      const match = names.find(name => 
        name.toLowerCase().includes(currentAction.toLowerCase())
      )
      if (match) targetActionName = match
    }

    const action = actions[targetActionName]
    if (action) {
      console.log(`Playing: ${targetActionName}`)
      action.reset().fadeIn(0.5).play()
      return () => { action.fadeOut(0.5) }
    } else {
      console.warn(`Action not found: ${targetActionName}`)
    }
  }, [currentAction, actions, names])

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={baseModel} scale={0.01} />
    </group>
  )
}

// Preload all files defined in config
MODEL_FILES.forEach(file => useLoader.preload(FBXLoader, file))
