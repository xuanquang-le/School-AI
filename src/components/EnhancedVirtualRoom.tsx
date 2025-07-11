import React, { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Box, Plane, Sphere } from '@react-three/drei';
import { motion } from 'framer-motion';
import EnhancedMixamoAvatar from './EnhancedMixamoAvatar';
import { Character } from '../types/Character';
import { Volume2, VolumeX, Mic, MicOff } from 'lucide-react';

interface EnhancedVirtualRoomProps {
  character: Character;
  isListening: boolean;
  isSpeaking: boolean;
  onToggleSpeech: () => void;
  speechEnabled: boolean;
  onStartListening: () => void;
  onStopListening: () => void;
}

function Room({ character }: { character: Character }) {
  return (
    <group>
      {/* Floor with pattern */}
      <Plane
        args={[12, 12]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#f0f9ff" roughness={0.8} />
      </Plane>

      {/* Decorative floor pattern */}
      <Plane
        args={[8, 8]}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.01, 0]}
        receiveShadow
      >
        <meshStandardMaterial color={character.color} opacity={0.1} transparent />
      </Plane>

      {/* Back wall */}
      <Plane
        args={[12, 8]}
        position={[0, 4, -6]}
        receiveShadow
      >
        <meshStandardMaterial color="#e0f2fe" roughness={0.9} />
      </Plane>

      {/* Left wall */}
      <Plane
        args={[12, 8]}
        rotation={[0, Math.PI / 2, 0]}
        position={[-6, 4, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#f0f9ff" roughness={0.9} />
      </Plane>

      {/* Right wall */}
      <Plane
        args={[12, 8]}
        rotation={[0, -Math.PI / 2, 0]}
        position={[6, 4, 0]}
        receiveShadow
      >
        <meshStandardMaterial color="#f0f9ff" roughness={0.9} />
      </Plane>

      {/* Consultation desk */}
      <Box
        args={[3, 0.1, 1.5]}
        position={[0, 0.8, 2.5]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color="#8b5cf6" roughness={0.3} metalness={0.1} />
      </Box>

      {/* Desk legs */}
      <Box args={[0.1, 0.8, 0.1]} position={[-1.3, 0.4, 1.8]} castShadow>
        <meshStandardMaterial color="#2c3e50" />
      </Box>
      <Box args={[0.1, 0.8, 0.1]} position={[1.3, 0.4, 1.8]} castShadow>
        <meshStandardMaterial color="#2c3e50" />
      </Box>
      <Box args={[0.1, 0.8, 0.1]} position={[-1.3, 0.4, 3.2]} castShadow>
        <meshStandardMaterial color="#2c3e50" />
      </Box>
      <Box args={[0.1, 0.8, 0.1]} position={[1.3, 0.4, 3.2]} castShadow>
        <meshStandardMaterial color="#2c3e50" />
      </Box>

      {/* Consultation chairs */}
      <Box args={[0.8, 0.1, 0.8]} position={[0, 0.5, 4]} castShadow receiveShadow>
        <meshStandardMaterial color="#6366f1" roughness={0.6} />
      </Box>
      <Box args={[0.8, 1, 0.1]} position={[0, 1, 4.3]} castShadow receiveShadow>
        <meshStandardMaterial color="#6366f1" roughness={0.6} />
      </Box>

      {/* Client chair */}
      <Box args={[0.8, 0.1, 0.8]} position={[0, 0.5, 1]} castShadow receiveShadow>
        <meshStandardMaterial color="#10b981" roughness={0.6} />
      </Box>
      <Box args={[0.8, 1, 0.1]} position={[0, 1, 0.7]} castShadow receiveShadow>
        <meshStandardMaterial color="#10b981" roughness={0.6} />
      </Box>

      {/* Decorative elements */}
      <Sphere args={[0.1]} position={[-3, 1.5, -3]} castShadow>
        <meshStandardMaterial color="#F59E0B" />
      </Sphere>
      <Sphere args={[0.15]} position={[3, 1.8, -3]} castShadow>
        <meshStandardMaterial color="#10B981" />
      </Sphere>

      {/* Soft lighting orbs */}
      <Sphere args={[0.3]} position={[-4, 2, -4]}>
        <meshBasicMaterial color="#fbbf24" transparent opacity={0.3} />
      </Sphere>
      <Sphere args={[0.25]} position={[4, 2.5, -4]}>
        <meshBasicMaterial color="#a78bfa" transparent opacity={0.3} />
      </Sphere>
      
      {/* Bookshelf */}
      <Box args={[0.3, 2, 1.5]} position={[-5, 1, -2]} castShadow receiveShadow>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      {/* Books */}
      <Box args={[0.05, 0.2, 0.15]} position={[-4.9, 1.5, -2.3]} castShadow>
        <meshStandardMaterial color="#DC2626" />
      </Box>
      <Box args={[0.05, 0.25, 0.15]} position={[-4.9, 1.5, -2.1]} castShadow>
        <meshStandardMaterial color="#2563EB" />
      </Box>
      <Box args={[0.05, 0.18, 0.15]} position={[-4.9, 1.5, -1.9]} castShadow>
        <meshStandardMaterial color="#059669" />
      </Box>
      
      {/* Plant */}
      <Box args={[0.2, 0.3, 0.2]} position={[4.5, 0.15, -2]} castShadow receiveShadow>
        <meshStandardMaterial color="#8B4513" />
      </Box>
      <Sphere args={[0.3]} position={[4.5, 0.6, -2]} castShadow>
        <meshStandardMaterial color="#22C55E" />
      </Sphere>
      
      {/* Window frame */}
      <Box args={[0.1, 3, 2]} position={[5.9, 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial color="#FFFFFF" />
      </Box>
      
      {/* Ceiling light */}
      <Sphere args={[0.2]} position={[0, 5.5, 0]}>
        <meshBasicMaterial color="#FFFFFF" />
      </Sphere>

      {/* Ambient lighting spheres */}
      <Sphere args={[0.05]} position={[-3, 3, -3]}>
        <meshBasicMaterial color="#ffffff" />
      </Sphere>
      <Sphere args={[0.05]} position={[3, 3.5, -3]}>
        <meshBasicMaterial color="#ffffff" />
      </Sphere>
    </group>
  );
}

export default function EnhancedVirtualRoom({
  character,
  isListening,
  isSpeaking,
  onToggleSpeech,
  speechEnabled,
  onStartListening,
  onStopListening
}: EnhancedVirtualRoomProps) {
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowControls(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const getStatusText = () => {
    if (isListening) return 'Listening...';
    if (isSpeaking) return 'Speaking...';
    return `${character.name} is ready to help`;
  };

  const getStatusColor = () => {
    if (isListening) return '#EF4444';
    if (isSpeaking) return '#F59E0B';
    return character.color;
  };

  return (
    <div className="relative w-full h-full">
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
        <pointLight position={[2, 4, -2]} intensity={0.3} color={character.color} />

        <Room character={character} />
        
        {/* Character name and status */}
        <Text
          position={[0, 3.5, 0]}
          fontSize={0.3}
          color={character.color}
          anchorX="center"
          anchorY="middle"
          font="/fonts/Inter-Bold.woff"
        >
          {character.name}
        </Text>

        <Text
          position={[0, 3, 0]}
          fontSize={0.15}
          color={getStatusColor()}
          anchorX="center"
          anchorY="middle"
        >
          {getStatusText()}
        </Text>

        {/* Enhanced Avatar */}
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
          maxDistance={10}
          autoRotate={false}
        />

        <Environment preset="city" />
      </Canvas>

      {/* Floating Controls */}
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: showControls ? 1 : 0.3 }}
        onHoverStart={() => setShowControls(true)}
        onHoverEnd={() => setShowControls(false)}
        className="absolute bottom-6 right-6 flex flex-col space-y-3"
      >
        {/* Speech Toggle */}
        <motion.button
          onClick={onToggleSpeech}
          className={`p-4 rounded-full shadow-lg transition-all duration-200 ${
            speechEnabled
              ? 'bg-green-500 text-white hover:bg-green-600'
              : 'bg-gray-500 text-white hover:bg-gray-600'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {speechEnabled ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </motion.button>

        {/* Voice Input Toggle */}
        <motion.button
          onClick={isListening ? onStopListening : onStartListening}
          className={`p-4 rounded-full shadow-lg transition-all duration-200 ${
            isListening
              ? 'bg-red-500 text-white hover:bg-red-600'
              : 'bg-blue-500 text-white hover:bg-blue-600'
          }`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {isListening ? <MicOff size={24} /> : <Mic size={24} />}
        </motion.button>
      </motion.div>

      {/* Character Info Panel */}
      <motion.div
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        className="absolute top-6 left-6 bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg max-w-xs"
      >
        <div className="flex items-center space-x-3">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center text-2xl"
            style={{ backgroundColor: character.color }}
          >
            {character.avatar}
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{character.name}</h3>
            <p className="text-sm text-gray-600">{character.role}</p>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">{character.description}</p>
      </motion.div>
    </div>
  );
}