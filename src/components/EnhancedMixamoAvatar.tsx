import React, { Suspense, useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { Character, AVAILABLE_CHARACTERS } from '../types/Character';

// Game-style Counselor Avatar với body language đơn giản
function GameStyleCounselorAvatar({ 
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
  const bodyRef = useRef<THREE.Mesh>(null);
  const eyeLeftRef = useRef<THREE.Mesh>(null);
  const eyeRightRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftHandRef = useRef<THREE.Mesh>(null);
  const rightHandRef = useRef<THREE.Mesh>(null);
  
  const [blinkTimer, setBlinkTimer] = useState(0);
  const [isBlinking, setIsBlinking] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    setCurrentTime(time);
    
    if (meshRef.current) {
      // Gentle floating - game style nhẹ nhàng
      meshRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.04;
      // Subtle body sway
      meshRef.current.rotation.z = Math.sin(time * 0.6) * 0.008;
    }

    // Head body language - thể hiện cảm xúc
    if (headRef.current) {
      if (isSpeaking) {
        // Engaging speaking gestures - gật đầu khi nói
        headRef.current.rotation.x = Math.sin(time * 5) * 0.05;
        headRef.current.rotation.y = Math.sin(time * 2.5) * 0.08;
        headRef.current.rotation.z = Math.sin(time * 3) * 0.03;
        // Slight head movement for emphasis
        headRef.current.position.y = 1.5 + Math.sin(time * 6) * 0.015;
      } else if (isListening) {
        // Attentive listening - nghiêng đầu quan tâm
        headRef.current.rotation.x = -0.04 + Math.sin(time * 1.2) * 0.02;
        headRef.current.rotation.y = 0.05 + Math.sin(time * 0.8) * 0.03;
        headRef.current.rotation.z = 0.02; // Slight tilt showing interest
        headRef.current.position.z = 0.03; // Lean forward slightly
      } else {
        // Calm, approachable idle
        headRef.current.rotation.x = Math.sin(time * 0.5) * 0.02;
        headRef.current.rotation.y = Math.sin(time * 0.4) * 0.03;
        headRef.current.rotation.z = 0;
        headRef.current.position.z = 0;
        headRef.current.position.y = 1.5;
      }
    }

    // Body breathing và posture
    if (bodyRef.current) {
      bodyRef.current.scale.y = 1 + Math.sin(time * 1.3) * 0.02;
      if (isListening) {
        // Slight forward lean when listening
        bodyRef.current.rotation.x = 0.02;
      } else {
        bodyRef.current.rotation.x = 0;
      }
    }

    // Arm gestures - đơn giản nhưng có ý nghĩa
    if (leftArmRef.current && rightArmRef.current) {
      if (isSpeaking) {
        // Gentle hand gestures while speaking
        leftArmRef.current.rotation.z = 0.4 + Math.sin(time * 2.5) * 0.15;
        leftArmRef.current.rotation.x = Math.sin(time * 2.2) * 0.1;
        rightArmRef.current.rotation.z = -0.4 + Math.sin(time * 2.5 + Math.PI * 0.6) * 0.15;
        rightArmRef.current.rotation.x = Math.sin(time * 2.1 + Math.PI * 0.3) * 0.1;
        
        // Hand movements
        if (leftHandRef.current && rightHandRef.current) {
          leftHandRef.current.rotation.z = Math.sin(time * 3) * 0.15;
          rightHandRef.current.rotation.z = Math.sin(time * 3 + Math.PI * 0.5) * 0.15;
        }
      } else if (isListening) {
        // Open, welcoming posture
        leftArmRef.current.rotation.z = 0.2;
        leftArmRef.current.rotation.x = 0.1;
        rightArmRef.current.rotation.z = -0.2;
        rightArmRef.current.rotation.x = 0.1;
        
        // Subtle movement
        leftArmRef.current.rotation.y = Math.sin(time * 0.6) * 0.03;
        rightArmRef.current.rotation.y = Math.sin(time * 0.6 + Math.PI) * 0.03;
      } else {
        // Relaxed, professional stance
        leftArmRef.current.rotation.z = 0.15 + Math.sin(time * 0.5) * 0.02;
        rightArmRef.current.rotation.z = -0.15 + Math.sin(time * 0.5 + Math.PI) * 0.02;
        leftArmRef.current.rotation.x = 0.05;
        rightArmRef.current.rotation.x = 0.05;
        leftArmRef.current.rotation.y = 0;
        rightArmRef.current.rotation.y = 0;
      }
    }

    // Eye blinking và expression
    if (eyeLeftRef.current && eyeRightRef.current) {
      setBlinkTimer(prev => prev + 0.016);
      if (blinkTimer > 2.5 + Math.random() * 2) {
        setIsBlinking(true);
        setBlinkTimer(0);
        setTimeout(() => setIsBlinking(false), 120);
      }
      
      if (isBlinking) {
        eyeLeftRef.current.scale.y = 0.1;
        eyeRightRef.current.scale.y = 0.1;
      } else {
        eyeLeftRef.current.scale.y = 1;
        eyeRightRef.current.scale.y = 1;
        
        // Eyes slightly wider when listening - showing attention
        if (isListening) {
          eyeLeftRef.current.scale.setScalar(1.1);
          eyeRightRef.current.scale.setScalar(1.1);
        } else {
          eyeLeftRef.current.scale.setScalar(1);
          eyeRightRef.current.scale.setScalar(1);
        }
      }
    }

    // Mouth expression
    if (mouthRef.current) {
      if (isSpeaking) {
        // Natural speaking mouth movement
        const mouthMovement = Math.sin(time * 8) * 0.3 + Math.sin(time * 12) * 0.2;
        mouthRef.current.scale.y = 0.7 + Math.abs(mouthMovement) * 0.3;
        mouthRef.current.scale.x = 1 + mouthMovement * 0.1;
      } else {
        // Gentle smile - friendly and approachable
        mouthRef.current.scale.set(1.2, 0.8, 1);
      }
    }
  });

  // Game-style colors - warm và professional
  const skinColor = character.gender === 'female' ? '#f5c6a0' : '#e0a888';
  const hairColor = character.gender === 'female' ? '#6b4423' : '#4a3018';
  const clothingColor = character.color || '#4a90a4';
  const eyeColor = '#2d5a3d';

  return (
    <group ref={meshRef} position={position} scale={scale}>
      {/* Game-style human head */}
      <mesh ref={headRef} position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.22, 20, 20]} />
        <meshToonMaterial color={skinColor} />
      </mesh>
      
      {/* Hair - simple but recognizable */}
      <mesh position={[0, 1.7, -0.08]}>
        <sphereGeometry args={[0.23, 20, 14, 0, Math.PI * 2, 0, Math.PI * 0.65]} />
        <meshToonMaterial color={hairColor} />
      </mesh>
      
      {/* Eyes - expressive và friendly */}
      <mesh ref={eyeLeftRef} position={[-0.08, 1.54, 0.18]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-0.08, 1.54, 0.2]}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshBasicMaterial color={eyeColor} />
      </mesh>
      <mesh position={[-0.08, 1.54, 0.21]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      <mesh ref={eyeRightRef} position={[0.08, 1.54, 0.18]}>
        <sphereGeometry args={[0.035, 12, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.08, 1.54, 0.2]}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshBasicMaterial color={eyeColor} />
      </mesh>
      <mesh position={[0.08, 1.54, 0.21]}>
        <sphereGeometry args={[0.01, 8, 8]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      
      {/* Eyebrows - expressive */}
      <mesh position={[-0.08, 1.62, 0.17]} rotation={[0, 0, 0.1]}>
        <boxGeometry args={[0.04, 0.008, 0.015]} />
        <meshToonMaterial color={hairColor} />
      </mesh>
      <mesh position={[0.08, 1.62, 0.17]} rotation={[0, 0, -0.1]}>
        <boxGeometry args={[0.04, 0.008, 0.015]} />
        <meshToonMaterial color={hairColor} />
      </mesh>
      
      {/* Nose - subtle */}
      <mesh position={[0, 1.48, 0.19]}>
        <sphereGeometry args={[0.015, 8, 8]} />
        <meshToonMaterial color={skinColor} />
      </mesh>
      
      {/* Mouth - friendly smile */}
      <mesh ref={mouthRef} position={[0, 1.42, 0.18]}>
        <sphereGeometry args={[0.025, 12, 8]} />
        <meshToonMaterial color="#d4756b" />
      </mesh>
      
      {/* Neck */}
      <mesh position={[0, 1.25, 0]}>
        <cylinderGeometry args={[0.1, 0.12, 0.2, 12]} />
        <meshToonMaterial color={skinColor} />
      </mesh>
      
      {/* Body - professional counselor */}
      <mesh ref={bodyRef} position={[0, 0.9, 0]}>
        <capsuleGeometry args={[0.28, 0.7, 8, 16]} />
        <meshToonMaterial color={clothingColor} />
      </mesh>
      
      {/* Shoulders */}
      <mesh position={[-0.22, 1.15, 0]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshToonMaterial color={clothingColor} />
      </mesh>
      <mesh position={[0.22, 1.15, 0]}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshToonMaterial color={clothingColor} />
      </mesh>
      
      {/* Arms - expressive gestures */}
      <group ref={leftArmRef} position={[-0.3, 1.1, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.07, 0.35, 6, 12]} />
          <meshToonMaterial color={clothingColor} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.5, 0]}>
          <capsuleGeometry args={[0.06, 0.28, 6, 12]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
      </group>
      
      <group ref={rightArmRef} position={[0.3, 1.1, 0]}>
        {/* Upper arm */}
        <mesh position={[0, -0.2, 0]}>
          <capsuleGeometry args={[0.07, 0.35, 6, 12]} />
          <meshToonMaterial color={clothingColor} />
        </mesh>
        {/* Forearm */}
        <mesh position={[0, -0.5, 0]}>
          <capsuleGeometry args={[0.06, 0.28, 6, 12]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
      </group>
      
      {/* Hands - simple but expressive */}
      <mesh ref={leftHandRef} position={[-0.3, 0.55, 0]}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshToonMaterial color={skinColor} />
      </mesh>
      <mesh ref={rightHandRef} position={[0.3, 0.55, 0]}>
        <sphereGeometry args={[0.08, 10, 10]} />
        <meshToonMaterial color={skinColor} />
      </mesh>
      
      {/* Lower body */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.22, 0.28, 0.25, 12]} />
        <meshToonMaterial color="#4a5568" />
      </mesh>
      
      {/* Legs - simple */}
      <mesh position={[-0.14, 0.15, 0]}>
        <capsuleGeometry args={[0.09, 0.4, 6, 12]} />
        <meshToonMaterial color="#4a5568" />
      </mesh>
      <mesh position={[0.14, 0.15, 0]}>
        <capsuleGeometry args={[0.09, 0.4, 6, 12]} />
        <meshToonMaterial color="#4a5568" />
      </mesh>
      
      {/* Feet - professional */}
      <mesh position={[-0.14, 0.02, 0.08]}>
        <boxGeometry args={[0.12, 0.04, 0.22]} />
        <meshToonMaterial color="#2d3748" />
      </mesh>
      <mesh position={[0.14, 0.02, 0.08]}>
        <boxGeometry args={[0.12, 0.04, 0.22]} />
        <meshToonMaterial color="#2d3748" />
      </mesh>

      {/* Status indicators - game-style nhưng nhẹ nhàng */}
      {isListening && (
        <group position={[0, 2, 0]}>
          {/* Listening ring */}
          <mesh>
            <torusGeometry args={[0.32, 0.02, 8, 24]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.8} />
          </mesh>
          {/* Pulsing effect */}
          <mesh scale={[1 + Math.sin(currentTime * 3) * 0.15, 1 + Math.sin(currentTime * 3) * 0.15, 1]}>
            <torusGeometry args={[0.4, 0.015, 8, 24]} />
            <meshBasicMaterial color="#10b981" transparent opacity={0.4} />
          </mesh>
          
          {/* Listening particles */}
          {[...Array(4)].map((_, i) => (
            <mesh 
              key={i}
              position={[
                Math.cos((currentTime * 2 + i * Math.PI * 0.5)) * 0.25,
                Math.sin((currentTime * 2 + i * Math.PI * 0.5)) * 0.05,
                Math.sin((currentTime * 2 + i * Math.PI * 0.5)) * 0.25
              ]}
              scale={[1 + Math.sin(currentTime * 4 + i) * 0.3, 1 + Math.sin(currentTime * 4 + i) * 0.3, 1]}
            >
              <sphereGeometry args={[0.015, 6, 6]} />
              <meshBasicMaterial color="#10b981" transparent opacity={0.7} />
            </mesh>
          ))}
        </group>
      )}
      
      {isSpeaking && (
        <group position={[0, 2, 0]}>
          {/* Speaking ring */}
          <mesh>
            <torusGeometry args={[0.32, 0.02, 8, 24]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.8} />
          </mesh>
          {/* Rotating effect */}
          <mesh rotation={[0, 0, currentTime * 1.5]} scale={[1.2, 1.2, 1]}>
            <torusGeometry args={[0.4, 0.015, 8, 24]} />
            <meshBasicMaterial color="#3b82f6" transparent opacity={0.3} />
          </mesh>
          
          {/* Speaking wave particles */}
          {[...Array(6)].map((_, i) => (
            <mesh 
              key={i}
              position={[
                Math.cos(currentTime * 4 + i * Math.PI * 0.33) * (0.2 + i * 0.05),
                Math.sin(currentTime * 6 + i * Math.PI * 0.5) * 0.03,
                Math.sin(currentTime * 4 + i * Math.PI * 0.33) * (0.2 + i * 0.05)
              ]}
              scale={[1 + Math.sin(currentTime * 8 + i) * 0.4, 1, 1]}
            >
              <sphereGeometry args={[0.012 + i * 0.002, 6, 6]} />
              <meshBasicMaterial color="#3b82f6" transparent opacity={0.6} />
            </mesh>
          ))}
        </group>
      )}
    </group>
  );
}

// GLB Avatar wrapper với game-style enhancements
function GameStyleGLBAvatar({ 
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
            const mesh = child as THREE.Mesh;
            // Apply toon shading cho game look
            if (mesh.material) {
              const material = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
              if (material && 'color' in material) {
                mesh.material = new THREE.MeshToonMaterial({
                  color: (material as any).color || '#ffffff',
                  map: 'map' in material ? (material as any).map : null
                });
              }
            }
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });
      }
    }, [scene]);

    useFrame((state) => {
      const time = state.clock.elapsedTime;
      if (avatarRef.current) {
        // Game-style floating animation
        avatarRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.06;
        
        if (isSpeaking) {
          // Engaging speaking animation
          avatarRef.current.rotation.y = Math.sin(time * 2.5) * 0.12;
          avatarRef.current.rotation.x = Math.sin(time * 2) * 0.03;
          avatarRef.current.scale.setScalar(scale * (1 + Math.sin(time * 4) * 0.02));
        } else if (isListening) {
          // Attentive listening pose
          avatarRef.current.rotation.y = Math.sin(time * 1.2) * 0.06;
          avatarRef.current.rotation.x = -0.02 + Math.sin(time * 1.5) * 0.02;
        } else {
          // Calm idle animation
          avatarRef.current.rotation.y = Math.sin(time * 0.8) * 0.04;
          avatarRef.current.rotation.x = Math.sin(time * 0.6) * 0.01;
          avatarRef.current.scale.setScalar(scale);
        }
      }
    });

    return (
      <group ref={avatarRef} position={position} scale={scale}>
        <primitive object={scene} />
        
        {/* Game-style status effects */}
        {isListening && (
          <group position={[0, 2.5, 0]}>
            <mesh>
              <torusGeometry args={[0.45, 0.025, 8, 24]} />
              <meshBasicMaterial color="#10b981" transparent opacity={0.7} />
            </mesh>
          </group>
        )}
        
        {isSpeaking && (
          <group position={[0, 2.5, 0]}>
            <mesh>
              <torusGeometry args={[0.45, 0.025, 8, 24]} />
              <meshBasicMaterial color="#3b82f6" transparent opacity={0.7} />
            </mesh>
          </group>
        )}
      </group>
    );
  } catch (error) {
    console.warn('Failed to load GLB model, using game-style counselor avatar:', error);
    return (
      <GameStyleCounselorAvatar 
        position={position} 
        scale={scale} 
        isListening={isListening}
        isSpeaking={isSpeaking}
        character={character}
      />
    );
  }
}

interface GameStyleAvatarProps {
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
}: GameStyleAvatarProps) {
  return (
    <Suspense fallback={
      <GameStyleCounselorAvatar 
        position={position} 
        scale={scale} 
        isListening={isListening}
        isSpeaking={isSpeaking}
        character={character}
      />
    }>
      <GameStyleGLBAvatar 
        position={position} 
        scale={scale} 
        isListening={isListening}
        isSpeaking={isSpeaking}
        character={character}
      />
    </Suspense>
  );
}

// Preload models
AVAILABLE_CHARACTERS.forEach(character => {
  try {
    useGLTF.preload(character.modelPath);
  } catch (error) {
    console.warn(`Could not preload model for ${character.name}:`, error);
  }
});