import React, { Suspense, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

// Fallback Avatar component using basic geometry
function FallbackAvatar({ position = [0, 0, 0], scale = 1 }) {
  const meshRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
      meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={meshRef} position={position} scale={scale}>
      {/* Head */}
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.15, 32, 32]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      
      {/* Body */}
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.2, 0.25, 0.8, 8]} />
        <meshStandardMaterial color="#4a90e2" />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.35, 1.2, 0]} rotation={[0, 0, 0.3]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
        <meshStandardMaterial color="#ffdbac" />
      </mesh>
      <mesh position={[0.35, 1.2, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.05, 0.05, 0.6, 8]} />
        <meshStandardMaterial color="#ffdbac" />
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
    </group>
  );
}

// GLB Avatar component with error handling
function GLBAvatar({ position = [0, 0, 0], scale = 1 }) {
  try {
    const { scene } = useGLTF('/char.glb');
    const avatarRef = useRef<THREE.Group>(null);

    useFrame((state) => {
      if (avatarRef.current) {
        // Gentle floating animation
        avatarRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
        avatarRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      }
    });

    return (
      <group ref={avatarRef} position={position} scale={scale}>
        <primitive object={scene} />
      </group>
    );
  } catch (error) {
    console.warn('Failed to load GLB model, using fallback avatar:', error);
    return <FallbackAvatar position={position} scale={scale} />;
  }
}

interface MixamoAvatarProps {
  position?: [number, number, number];
  scale?: number;
  isListening?: boolean;
  isSpeaking?: boolean;
}

export default function MixamoAvatar({ 
  position = [0, 0, 0], 
  scale = 1,
  isListening = false,
  isSpeaking = false 
}: MixamoAvatarProps) {
  return (
    <Suspense fallback={<FallbackAvatar position={position} scale={scale} />}>
      <GLBAvatar position={position} scale={scale} />
      
      {/* Visual indicators for listening/speaking states */}
      {isListening && (
        <mesh position={[position[0], position[1] + 2, position[2]]}>
          <ringGeometry args={[0.3, 0.35, 32]} />
          <meshBasicMaterial color="#00ff00" transparent opacity={0.6} />
        </mesh>
      )}
      
      {isSpeaking && (
        <mesh position={[position[0], position[1] + 2, position[2]]}>
          <ringGeometry args={[0.3, 0.35, 32]} />
          <meshBasicMaterial color="#ff6b6b" transparent opacity={0.6} />
        </mesh>
      )}
    </Suspense>
  );
}

// Preload the GLB model (with error handling)
try {
  useGLTF.preload('/char.glb');
} catch (error) {
  console.warn('Could not preload GLB model:', error);
}