import React, { Suspense, useRef, useEffect, useState } from 'react';
import { iuseFrame as useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Character, AVAILABLE_CHARACTERS } from '../types/Character';

// Enhanced Fallback Avatar with realistic human proportions and body language
function EnhancedFallbackAvatar({ 
  position = [0, 0, 0], 
  scale = 1, 
  isListening = false, 
  isSpeaking = false,
  character 
}: {
  position?: [number, number, number];
  scale?: number;
  isListening?: boolean;
  isSpeaking?: boolean;
  character: Character;
}) {
  const meshRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const leftForearmRef = useRef<THREE.Mesh>(null);
  const rightForearmRef = useRef<THREE.Mesh>(null);
  const torsoRef = useRef<THREE.Mesh>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftHandRef = useRef<THREE.Mesh>(null);
  const rightHandRef = useRef<THREE.Mesh>(null);
  
  const [animationPhase, setAnimationPhase] = useState(0);
  const [gesturePhase, setGesturePhase] = useState(0);
  const [blinkTimer, setBlinkTimer] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    setCurrentTime(time);
    if (meshRef.current) {
      // Subtle breathing animation
      meshRef.current.position.y = position[1] + Math.sin(time * 1.2) * 0.02;
      
      // Natural body sway
      meshRef.current.rotation.z = Math.sin(time * 0.4) * 0.01;
      meshRef.current.rotation.y = Math.sin(time * 0.3) * 0.005;
    }

    // Torso breathing
    if (torsoRef.current) {
      torsoRef.current.scale.y = 1 + Math.sin(time * 1.2) * 0.02;
      torsoRef.current.scale.x = 1 + Math.sin(time * 1.2) * 0.01;
    }

    // Head animations with body language
    if (headRef.current) {
      if (isSpeaking) {
        // Active speaking gestures
        headRef.current.rotation.x = Math.sin(time * 6) * 0.08 + Math.sin(time * 2.5) * 0.03;
        headRef.current.rotation.y = Math.sin(time * 3) * 0.12;
        headRef.current.rotation.z = Math.sin(time * 4) * 0.04;
        
        // Head nodding emphasis
        headRef.current.position.y = 1.6 + Math.sin(time * 8) * 0.02;
      } else if (isListening) {
        // Attentive listening posture
        headRef.current.rotation.x = -0.05 + Math.sin(time * 1.5) * 0.03;
        headRef.current.rotation.y = Math.sin(time * 0.8) * 0.08;
        headRef.current.rotation.z = Math.sin(time * 1.2) * 0.02;
        
        // Slight forward lean when listening
        headRef.current.position.z = 0.02;
      } else {
        // Idle natural movement
        headRef.current.rotation.x = Math.sin(time * 0.7) * 0.02;
        headRef.current.rotation.y = Math.sin(time * 0.5) * 0.04;
        headRef.current.rotation.z = Math.sin(time * 0.6) * 0.01;
        headRef.current.position.z = 0;
      }
    }

    // Eye movements and blinking
    if (eyeLeftRef.current && eyeRightRef.current) {
      // Natural eye movement
      const eyeMovementX = Math.sin(time * 0.3) * 0.01;
      const eyeMovementY = Math.sin(time * 0.4) * 0.005;
      
      if (!isBlinking) {
        eyeLeftRef.current.scale.set(1, 1, 1);
        eyeRightRef.current.scale.set(1, 1, 1);
        
        eyeLeftRef.current.position.x = -0.05 + eyeMovementX;
        eyeRightRef.current.position.x = 0.05 + eyeMovementX;
        eyeLeftRef.current.position.y = 1.65 + eyeMovementY;
        eyeRightRef.current.position.y = 1.65 + eyeMovementY;
        
        if (isListening) {
          // Eyes slightly wider when listening
          eyeLeftRef.current.scale.set(1.1, 1.1, 1.1);
          eyeRightRef.current.scale.set(1.1, 1.1, 1.1);
        }
      }
      
      // Blinking animation
      setBlinkTimer(prev => prev + 0.016);
      if (blinkTimer > 3 + Math.random() * 2) {
        setIsBlinking(true);
        setBlinkTimer(0);
        setTimeout(() => setIsBlinking(false), 150);
      }
      
      if (isBlinking) {
        eyeLeftRef.current.scale.y = 0.1;
        eyeRightRef.current.scale.y = 0.1;
      }
    }

    // Mouth animation for speaking
    if (mouthRef.current) {
      if (isSpeaking) {
        // Mouth movement while speaking
        const mouthMovement = Math.sin(time * 12) * 0.3 + Math.sin(time * 8) * 0.2;
        mouthRef.current.scale.y = 0.5 + Math.abs(mouthMovement) * 0.5;
        mouthRef.current.scale.x = 1 + mouthMovement * 0.2;
        mouthRef.current.position.y = 1.55 + mouthMovement * 0.01;
      } else {
        // Neutral mouth
        mouthRef.current.scale.set(1, 0.5, 1);
        mouthRef.current.position.y = 1.55;
      }
    }

    // Advanced arm gestures with body language
    if (leftArmRef.current && rightArmRef.current) {
      if (isSpeaking) {
        // Dynamic speaking gestures
        const gestureIntensity = 0.4;
        const gestureSpeed = 2.5;
        
        // Left arm gestures
        leftArmRef.current.rotation.z = 0.4 + Math.sin(time * gestureSpeed) * gestureIntensity;
        leftArmRef.current.rotation.x = Math.sin(time * gestureSpeed * 1.3) * 0.3;
        leftArmRef.current.rotation.y = Math.sin(time * gestureSpeed * 0.7) * 0.2;
        
        // Right arm gestures (slightly offset)
        rightArmRef.current.rotation.z = -0.4 + Math.sin(time * gestureSpeed + Math.PI * 0.6) * gestureIntensity;
        rightArmRef.current.rotation.x = Math.sin(time * gestureSpeed * 1.1 + Math.PI * 0.3) * 0.3;
        rightArmRef.current.rotation.y = Math.sin(time * gestureSpeed * 0.8 + Math.PI * 0.4) * 0.2;
        
        // Forearm movement
        if (leftForearmRef.current && rightForearmRef.current) {
          leftForearmRef.current.rotation.x = Math.sin(time * gestureSpeed * 1.5) * 0.4;
          rightForearmRef.current.rotation.x = Math.sin(time * gestureSpeed * 1.5 + Math.PI * 0.5) * 0.4;
        }
        
        // Hand gestures
        if (leftHandRef.current && rightHandRef.current) {
          leftHandRef.current.rotation.z = Math.sin(time * gestureSpeed * 2) * 0.3;
          rightHandRef.current.rotation.z = Math.sin(time * gestureSpeed * 2 + Math.PI * 0.7) * 0.3;
        }
        
      } else if (isListening) {
        // Attentive listening posture
        leftArmRef.current.rotation.z = 0.2;
        leftArmRef.current.rotation.x = 0.1;
        rightArmRef.current.rotation.z = -0.2;
        rightArmRef.current.rotation.x = 0.1;
        
        // Subtle movement while listening
        leftArmRef.current.rotation.y = Math.sin(time * 0.5) * 0.05;
        rightArmRef.current.rotation.y = Math.sin(time * 0.5 + Math.PI) * 0.05;
        
        if (leftForearmRef.current && rightForearmRef.current) {
          leftForearmRef.current.rotation.x = 0.2;
          rightForearmRef.current.rotation.x = 0.2;
        }
        
      } else {
        // Relaxed idle position
        leftArmRef.current.rotation.z = 0.1 + Math.sin(time * 0.4) * 0.05;
        leftArmRef.current.rotation.x = Math.sin(time * 0.3) * 0.03;
        rightArmRef.current.rotation.z = -0.1 + Math.sin(time * 0.4 + Math.PI) * 0.05;
        rightArmRef.current.rotation.x = Math.sin(time * 0.3 + Math.PI) * 0.03;
        
        if (leftForearmRef.current && rightForearmRef.current) {
          leftForearmRef.current.rotation.x = 0.1;
          rightForearmRef.current.rotation.x = 0.1;
        }
      }
    }
  });

  // Character-specific realistic colors
  const skinColor = character.gender === 'female' ? '#fdbcb4' : '#e8b4a0';
  const hairColor = character.gender === 'female' ? '#8B4513' : '#654321';
  const clothingColor = character.color;
  const eyeColor = '#2D4A3E';

  return (
    <group ref={meshRef} position={position} scale={scale}>
      {/* More realistic head shape */}
      <mesh ref={headRef} position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshStandardMaterial color={skinColor} roughness={0.8} metalness={0.1} />
      </mesh>
      
      {/* Hair */}
      <mesh position={[0, 1.75, -0.05]}>
        <sphereGeometry args={[0.19, 32, 16, 0, Math.PI * 2, 0, Math.PI * 0.7]} />
        <meshStandardMaterial color={hairColor} roughness={0.9} />
      </mesh>
      
      {/* Eyes with more detail */}
      <mesh ref={eyeLeftRef} position={[-0.06, 1.65, 0.15]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.06, 1.65, 0.17]}>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshStandardMaterial color={eyeColor} />
      </mesh>
      <mesh position={[-0.06, 1.65, 0.18]}>
        <sphereGeometry args={[0.008, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      <mesh ref={eyeRightRef} position={[0.06, 1.65, 0.15]}>
        <sphereGeometry args={[0.025, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.06, 1.65, 0.17]}>
        <sphereGeometry args={[0.015, 16, 16]} />
        <meshStandardMaterial color={eyeColor} />
      </mesh>
      <mesh position={[0.06, 1.65, 0.18]}>
        <sphereGeometry args={[0.008, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Eyebrows */}
      <mesh position={[-0.06, 1.72, 0.15]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.04, 0.008, 0.015]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>
      <mesh position={[0.06, 1.72, 0.15]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.04, 0.008, 0.015]} />
        <meshStandardMaterial color={hairColor} />
      </mesh>
      
      {/* Nose */}
      <mesh position={[0, 1.6, 0.16]}>
        <coneGeometry args={[0.015, 0.04, 8]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      
      {/* Mouth */}
      <mesh ref={mouthRef} position={[0, 1.55, 0.15]}>
        <sphereGeometry args={[0.02, 16, 8]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, 1.4, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.2, 16]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      
      {/* More realistic torso */}
      <mesh ref={torsoRef} position={[0, 1, 0]}>
        <capsuleGeometry args={[0.22, 0.6, 8, 16]} />
        <meshStandardMaterial color={clothingColor} roughness={0.7} />
      </mesh>
      
      {/* Chest detail for more human-like appearance */}
      <mesh position={[0, 1.15, 0.1]}>
        <sphereGeometry args={[0.18, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color={clothingColor} roughness={0.7} />
      </mesh>
      
      {/* Left arm with joints */}
      <group ref={leftArmRef} position={[-0.3, 1.2, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.15, 0]}>
          <capsuleGeometry args={[0.06, 0.25, 8, 16]} />
          <meshStandardMaterial color={clothingColor} />
        </mesh>
        {/* Shoulder */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={clothingColor} />
        </mesh>
        {/* Forearm */}
        <mesh ref={leftForearmRef} position={[0, -0.4, 0]}>
          <capsuleGeometry args={[0.05, 0.22, 8, 16]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>
      
      {/* Right arm with joints */}
      <group ref={rightArmRef} position={[0.3, 1.2, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.15, 0]}>
          <capsuleGeometry args={[0.06, 0.25, 8, 16]} />
          <meshStandardMaterial color={clothingColor} />
        </mesh>
        {/* Shoulder */}
        <mesh position={[0, 0, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color={clothingColor} />
        </mesh>
        {/* Forearm */}
        <mesh ref={rightForearmRef} position={[0, -0.4, 0]}>
          <capsuleGeometry args={[0.05, 0.22, 8, 16]} />
          <meshStandardMaterial color={skinColor} />
        </mesh>
      </group>
      
      {/* Hands with fingers */}
      <mesh ref={leftHandRef} position={[-0.3, 0.65, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      {/* Left fingers */}
      <mesh position={[-0.32, 0.62, 0.05]}>
        <cylinderGeometry args={[0.008, 0.008, 0.04, 8]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      <mesh position={[-0.28, 0.62, 0.05]}>
        <cylinderGeometry args={[0.008, 0.008, 0.04, 8]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      
      <mesh ref={rightHandRef} position={[0.3, 0.65, 0]}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      {/* Right fingers */}
      <mesh position={[0.32, 0.62, 0.05]}>
        <cylinderGeometry args={[0.008, 0.008, 0.04, 8]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      <mesh position={[0.28, 0.62, 0.05]}>
        <cylinderGeometry args={[0.008, 0.008, 0.04, 8]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      
      {/* Waist */}
      <mesh position={[0, 0.6, 0]}>
        <cylinderGeometry args={[0.18, 0.22, 0.15, 16]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      {/* Legs with more realistic proportions */}
      <mesh position={[-0.12, 0.25, 0]}>
        <capsuleGeometry args={[0.09, 0.5, 8, 16]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[0.12, 0.25, 0]}>
        <capsuleGeometry args={[0.09, 0.5, 8, 16]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      {/* Knees */}
      <mesh position={[-0.12, 0.15, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[0.12, 0.15, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      {/* Feet with more detail */}
      <mesh position={[-0.12, 0.05, 0.08]}>
        <boxGeometry args={[0.14, 0.06, 0.25]} />
        <meshStandardMaterial color="#654321" roughness={0.8} />
      </mesh>
      <mesh position={[0.12, 0.05, 0.08]}>
        <boxGeometry args={[0.14, 0.06, 0.25]} />
        <meshStandardMaterial color="#654321" roughness={0.8} />
      </mesh>

      {/* Status indicators with better positioning */}
      {isListening && (
        <>
          <mesh position={[0, 2.1, 0]}>
            <ringGeometry args={[0.25, 0.3, 32]} />
            <meshBasicMaterial color="#00ff00" transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, 2.1, 0]} scale={[1 + Math.sin(currentTime * 4) * 0.2, 1 + Math.sin(currentTime * 4) * 0.2, 1]}>
            <ringGeometry args={[0.35, 0.4, 32]} />
            <meshBasicMaterial color="#00ff00" transparent opacity={0.3} />
          </mesh>
        </>
      )}
      
      {isSpeaking && (
        <>
          <mesh position={[0, 2.1, 0]}>
            <ringGeometry args={[0.25, 0.3, 32]} />
            <meshBasicMaterial color="#ff6b6b" transparent opacity={0.7} />
          </mesh>
          <mesh position={[0, 2.1, 0]} rotation={[0, 0, currentTime * 2]}>
            <ringGeometry args={[0.35, 0.4, 32]} />
            <meshBasicMaterial color="#ff6b6b" transparent opacity={0.3} />
          </mesh>
          <mesh position={[0, 2.1, 0]} scale={[1 + Math.sin(currentTime * 6) * 0.3, 1 + Math.sin(currentTime * 6) * 0.3, 1]}>
            <ringGeometry args={[0.45, 0.5, 32]} />
            <meshBasicMaterial color="#ff6b6b" transparent opacity={0.2} />
          </mesh>
        </>
      )}
    </group>
  );
}

// GLB Avatar component with enhanced error handling
function GLBAvatar({ 
  position = [0, 0, 0], 
  scale = 1, 
  isListening = false, 
  isSpeaking = false,
  character 
}: {
  position?: [number, number, number];
  scale?: number;
  isListening?: boolean;
  isSpeaking?: boolean;
  character: Character;
}) {
  try {
    const { scene } = useGLTF(character.modelPath);
    const avatarRef = useRef<THREE.Group>(null);

    useEffect(() => {
      if (scene) {
        scene.traverse((child: THREE.Object3D) => {
          if ((child as THREE.Mesh).isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      }
    }, [scene]);

    useFrame((state: import('@react-three/fiber').RootState) => {
      const time = state.clock.elapsedTime;
      if (avatarRef.current) {
        
        // Gentle floating animation
        avatarRef.current.position.y = position[1] + Math.sin(time * 0.5) * 0.05;
        
        if (isSpeaking) {
          // More animated when speaking
          avatarRef.current.rotation.y = Math.sin(time * 2) * 0.1;
          avatarRef.current.rotation.x = Math.sin(time * 3) * 0.02;
          avatarRef.current.rotation.z = Math.sin(time * 4) * 0.01;
        } else if (isListening) {
          // Attentive posture when listening
          avatarRef.current.rotation.y = Math.sin(time * 1) * 0.05;
          avatarRef.current.rotation.x = -0.02 + Math.sin(time * 1.5) * 0.01;
        } else {
          // Subtle idle movement
          avatarRef.current.rotation.y = Math.sin(time * 0.5) * 0.03;
          avatarRef.current.rotation.x = Math.sin(time * 0.7) * 0.01;
        }
      }
    });

    return (
      <group ref={avatarRef} position={position} scale={scale}>
        <primitive object={scene} />
        
        {/* Status indicators */}
        {isListening && (
          <mesh position={[0, 2.5, 0]}>
            <ringGeometry args={[0.3, 0.35, 32]} />
            <meshBasicMaterial color="#00ff00" transparent opacity={0.6} />
          </mesh>
        )}
        
        {isSpeaking && (
          <mesh position={[0, 2.5, 0]}>
            <ringGeometry args={[0.3, 0.35, 32]} />
            <meshBasicMaterial color="#ff6b6b" transparent opacity={0.6} />
          </mesh>
        )}
      </group>
    );
  } catch (error) {
    console.warn('Failed to load GLB model, using enhanced fallback avatar:', error);
    return (
      <EnhancedFallbackAvatar 
        position={position} 
        scale={scale} 
        isListening={isListening}
        isSpeaking={isSpeaking}
        character={character}
      />
    );
  }
}

interface EnhancedMixamoAvatarProps {
  position?: [number, number, number];
  scale?: number;
  isListening?: boolean;
  isSpeaking?: boolean;
  character: Character;
}

export default function EnhancedMixamoAvatar({ 
  position = [0, 0, 0], 
  scale = 1,
  isListening = false,
  isSpeaking = false,
  character
}: EnhancedMixamoAvatarProps) {
  return (
    <Suspense fallback={
      <EnhancedFallbackAvatar 
        position={position} 
        scale={scale} 
        isListening={isListening}
        isSpeaking={isSpeaking}
        character={character}
      />
    }>
      <GLBAvatar 
        position={position} 
        scale={scale} 
        isListening={isListening}
        isSpeaking={isSpeaking}
        character={character}
      />
    </Suspense>
  );
}

// Preload models with error handling
AVAILABLE_CHARACTERS.forEach(character => {
  try {
    useGLTF.preload(character.modelPath);
  } catch (error) {
    console.warn(`Could not preload model for ${character.name}:`, error);
  }
});