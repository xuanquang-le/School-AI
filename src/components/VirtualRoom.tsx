import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Box, Plane } from '@react-three/drei';
import EnhancedMixamoAvatar from './EnhancedMixamoAvatar';
import { Character } from '../types/Character';

interface VirtualRoomProps {
  character: Character;
  isListening: boolean;
  isSpeaking: boolean;
}

function Room() {
  return (
    <group>
      {/* Floor */}
      <Plane
        args={[10, 10]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#F8FAFC" roughness={0.8} />
      </Plane>

      {/* Back wall */}
      <Plane
        args={[10, 6]}
        position={[0, 3, -5]}
        receiveShadow
      >
        <meshStandardMaterial color="#E2E8F0" roughness={0.9} />
      </Plane>

      {/* Left wall */}
      <Plane
        args={[10, 6]}
        rotation={[0, Math.PI / 2, 0]}
        position={[-5, 3, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#F1F5F9" roughness={0.9} />
      </Plane>

      {/* Right wall */}
      <Plane
        args={[10, 6]}
        rotation={[0, -Math.PI / 2, 0]}
        position={[5, 3, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#F1F5F9" roughness={0.9} />
      </Plane>

      {/* Desk */}
      <Box
        args={[2, 0.1, 1]}
        position={[0, 0.8, 1.5]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#8B5CF6" roughness={0.4} metalness={0.2} />
      </Box>

      {/* Chair */}
      <Box
        args={[0.8, 0.1, 0.8]}
        position={[0, 0.5, 2.8]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#6366F1" roughness={0.6} />
      </Box>

      <Box
        args={[0.8, 1, 0.1]}
        position={[0, 1, 3.2]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#6366F1" roughness={0.6} />
      </Box>
    </group>
  );
}

export default function VirtualRoom({ character, isListening, isSpeaking }: VirtualRoomProps) {
  const getStatusText = () => {
    if (isListening) return 'Listening...';
    if (isSpeaking) return 'Speaking...';
    return `${character.name} is ready to help`;
  };

  const getStatusColor = () => {
    if (isListening) return '#EF4444';
    if (isSpeaking) return '#F59E0B';
    return '#10B981';
  };

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
        
        {/* Character name */}
        <Text
          position={[0, 3.5, 0]}
          fontSize={0.3}
          color={character.color}
          anchorX="center"
          anchorY="middle"
        >
          {character.name}
        </Text>

        {/* Status text */}
        <Text
          position={[0, 3, 0]}
          fontSize={0.15}
          color={getStatusColor()}
          anchorX="center"
          anchorY="middle"
        >
          {getStatusText()}
        </Text>

        {/* Enhanced Avatar with selected character */}
        <EnhancedMixamoAvatar 
          character={character}
          position={[0, 0, 0]} 
          scale={1} 
          isListening={isListening} 
          isSpeaking={isSpeaking} 
        />

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