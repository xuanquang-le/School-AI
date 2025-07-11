import React, { Suspense, useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Character, AVAILABLE_CHARACTERS } from '../types/Character';

// Enhanced Fallback Avatar with more realistic proportions and animations
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
  const leftArmRef = useRef<THREE.Mesh>(null);
  const rightArmRef = useRef<THREE.Mesh>(null);
  const soundWaveRef = useRef<THREE.Mesh>(null);
  const [animationPhase, setAnimationPhase] = useState(0);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const [listeningPulseScale, setListeningPulseScale] = useState(1);
  const [speakingWaveScale, setSpeakingWaveScale] = useState(1);

  useFrame((state) => {
    if (meshRef.current) {
      // Base floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
      
      // Subtle body sway
      meshRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.3) * 0.02;
    }

    if (headRef.current) {
      if (isSpeaking) {
        // Head nodding while speaking
        headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 4) * 0.1;
        headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      } else if (isListening) {
        // Attentive head tilt
        headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1.5) * 0.1;
        headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.05;
      } else {
        // Idle head movement
        headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.8) * 0.03;
        headRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.05;
      }
    }

    // Eye movement for more lifelike appearance
    if (eyeLeftRef.current && eyeRightRef.current) {
      const eyeMovement = Math.sin(state.clock.elapsedTime * 0.5) * 0.02;
      eyeLeftRef.current.position.x = -0.05 + eyeMovement;
      eyeRightRef.current.position.x = 0.05 + eyeMovement;
      
      if (isListening) {
        // Eyes look slightly up when listening
        eyeLeftRef.current.position.y = 1.65 + Math.sin(state.clock.elapsedTime * 1.5) * 0.01;
        eyeRightRef.current.position.y = 1.65 + Math.sin(state.clock.elapsedTime * 1.5) * 0.01;
      }
    }

    // Arm animations
    if (leftArmRef.current && rightArmRef.current) {
      if (isSpeaking) {
        // Gesturing while speaking
        leftArmRef.current.rotation.z = 0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
        rightArmRef.current.rotation.z = -0.3 + Math.sin(state.clock.elapsedTime * 3 + Math.PI) * 0.2;
        leftArmRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2) * 0.1;
        rightArmRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 2 + Math.PI) * 0.1;
      } else {
        // Relaxed arm position
        leftArmRef.current.rotation.z = 0.3 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
        rightArmRef.current.rotation.z = -0.3 + Math.sin(state.clock.elapsedTime * 0.5 + Math.PI) * 0.05;
      }
    }

    // Update sound wave rotation
    if (soundWaveRef.current && isSpeaking) {
      soundWaveRef.current.rotation.z = state.clock.elapsedTime * 2;
    }

    // Update animation scales for status indicators
    setListeningPulseScale(1 + Math.sin(state.clock.elapsedTime * 4) * 0.2);
    setSpeakingWaveScale(1 + Math.sin(state.clock.elapsedTime * 6) * 0.3);
  });

  // Character-specific colors
  const skinColor = character.gender === 'female' ? '#ffdbac' : '#f4c2a1';
  const clothingColor = character.color;

  return (
    <group ref={meshRef} position={position} scale={scale}>
      {/* Head */}
      <mesh ref={headRef} position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      
      {/* Eyes */}
      <mesh ref={eyeLeftRef} position={[-0.05, 1.65, 0.12]}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh ref={eyeRightRef} position={[0.05, 1.65, 0.12]}>
        <sphereGeometry args={[0.02, 16, 16]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Eyebrows for more expression */}
      <mesh position={[-0.05, 1.7, 0.12]}>
        <boxGeometry args={[0.03, 0.005, 0.01]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.05, 1.7, 0.12]}>
        <boxGeometry args={[0.03, 0.005, 0.01]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Mouth */}
      <mesh position={[0, 1.55, 0.12]}>
        <sphereGeometry args={[0.015, 16, 8]} />
        <meshStandardMaterial color="#ff6b6b" />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.8, 8]} />
        <meshStandardMaterial color={clothingColor} />
      </mesh>
      
      {/* Arms */}
      <mesh ref={leftArmRef} position={[-0.35, 1.2, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      <mesh ref={rightArmRef} position={[0.35, 1.2, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      
      {/* Hands */}
      <mesh position={[-0.5, 0.8, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      <mesh position={[0.5, 0.8, 0]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color={skinColor} />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.15, 0.3, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      <mesh position={[0.15, 0.3, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.6, 8]} />
        <meshStandardMaterial color="#2c3e50" />
      </mesh>
      
      {/* Feet */}
      <mesh position={[-0.15, 0.05, 0.1]}>
        <boxGeometry args={[0.12, 0.05, 0.2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[0.15, 0.05, 0.1]}>
        <boxGeometry args={[0.12, 0.05, 0.2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Status indicators */}
      {isListening && (
        <>
          <mesh position={[0, 2.2, 0]}>
            <ringGeometry args={[0.25, 0.3, 32]} />
            <meshBasicMaterial color="#00ff00" transparent opacity={0.7} />
          </mesh>
          {/* Pulsing listening indicator */}
          <mesh position={[0, 2.2, 0]} scale={[listeningPulseScale, listeningPulseScale, 1]}>
            <ringGeometry args={[0.35, 0.4, 32]} />
            <meshBasicMaterial color="#00ff00" transparent opacity={0.3} />
          </mesh>
        </>
      )}
      
      {isSpeaking && (
        <>
          <mesh position={[0, 2.2, 0]}>
            <ringGeometry args={[0.25, 0.3, 32]} />
            <meshBasicMaterial color="#ff6b6b" transparent opacity={0.7} />
          </mesh>
          {/* Sound waves */}
          <mesh ref={soundWaveRef} position={[0, 2.2, 0]}>
            <ringGeometry args={[0.35, 0.4, 32]} />
            <meshBasicMaterial color="#ff6b6b" transparent opacity={0.3} />
          </mesh>
          {/* Additional sound wave */}
          <mesh position={[0, 2.2, 0]} scale={[speakingWaveScale, speakingWaveScale, 1]}>
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

    useFrame((state) => {
      if (avatarRef.current) {
        // Gentle floating animation
        avatarRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
        
        if (isSpeaking) {
          // More animated when speaking
          avatarRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
        } else if (isListening) {
          // Attentive posture when listening
          avatarRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 1) * 0.05;
        } else {
          // Subtle idle movement
          avatarRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.03;
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