import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Box, Plane } from '@react-three/drei';
import * as THREE from 'three';

interface VirtualRoomProps {
  isListening: boolean;
  isSpeaking: boolean;
}

function Avatar({ isListening, isSpeaking }: { isListening: boolean; isSpeaking: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHover] = useState(false);

  useFrame((state) => {
    if (meshRef.current) {
      // Gentle breathing animation
      meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.02;

      // Slight head movement when speaking
      if (isSpeaking) {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 4) * 0.1;
      }

      // Active listening animation
      if (isListening) {
        meshRef.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.05;
      }
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Avatar body */}
      <Box
        ref={meshRef}
        args={[0.8, 1.6, 0.4]}
        position={[0, 0.8, 0]}
        onPointerOver={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      >
        <meshStandardMaterial
          color={hovered ? '#4F46E5' : '#6366F1'}
          roughness={0.3}
          metalness={0.1}
        />
      </Box>

      {/* Avatar head */}
      <Box
        args={[0.6, 0.6, 0.6]}
        position={[0, 1.9, 0]}
      >
        <meshStandardMaterial
          color={isSpeaking ? '#F59E0B' : '#10B981'}
          roughness={0.2}
          metalness={0.1}
        />
      </Box>

      {/* Status indicator */}
      <Text
        position={[0, 2.8, 0]}
        fontSize={0.2}
        color={isListening ? '#EF4444' : isSpeaking ? '#F59E0B' : '#10B981'}
        anchorX="center"
        anchorY="middle"
      >
        {isListening ? 'Listening...' : isSpeaking ? 'Speaking...' : 'Ready to help'}
      </Text>
    </group>
  );
}

function Room() {
  return (
    <group>
      {/* Floor */}
      <Plane
        args={[10, 10]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      >
        <meshStandardMaterial color="#F8FAFC" roughness={0.8} />
      </Plane>

      {/* Back wall */}
      <Plane
        args={[10, 6]}
        position={[0, 3, -5]}
      >
        <meshStandardMaterial color="#E2E8F0" roughness={0.9} />
      </Plane>

      {/* Left wall */}
      <Plane
        args={[10, 6]}
        rotation={[0, Math.PI / 2, 0]}
        position={[-5, 3, 0]}
      >
        <meshStandardMaterial color="#F1F5F9" roughness={0.9} />
      </Plane>

      {/* Right wall */}
      <Plane
        args={[10, 6]}
        rotation={[0, -Math.PI / 2, 0]}
        position={[5, 3, 0]}
      >
        <meshStandardMaterial color="#F1F5F9" roughness={0.9} />
      </Plane>

      {/* Desk */}
      <Box
        args={[2, 0.1, 1]}
        position={[0, 0.8, 1.5]}
      >
        <meshStandardMaterial color="#8B5CF6" roughness={0.4} metalness={0.2} />
      </Box>

      {/* Chair */}
      <Box
        args={[0.8, 0.1, 0.8]}
        position={[0, 0.5, 2.8]}
      >
        <meshStandardMaterial color="#6366F1" roughness={0.6} />
      </Box>

      <Box
        args={[0.8, 1, 0.1]}
        position={[0, 1, 3.2]}
      >
        <meshStandardMaterial color="#6366F1" roughness={0.6} />
      </Box>
    </group>
  );
}

export default function VirtualRoom({ isListening, isSpeaking }: VirtualRoomProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 2, 5], fov: 75 }}
        shadows
        className="bg-gradient-to-b from-blue-50 to-indigo-100"
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <pointLight position={[-2, 4, 2]} intensity={0.5} color="#F59E0B" />

        <Room />
        <Avatar isListening={isListening} isSpeaking={isSpeaking} />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          maxPolarAngle={Math.PI / 2.2}
          minDistance={3}
          maxDistance={8}
        />

        <Environment preset="city" />
      </Canvas>
    </div>
  );
}