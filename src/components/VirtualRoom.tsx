// --- START OF FILE src/components/VirtualRoom.tsx ---
import React, { memo, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Text, Box, Plane } from '@react-three/drei';
import { useLanguage } from '../contexts/LanguageContext';
import EnhancedMixamoAvatar from './EnhancedMixamoAvatar';
import { Character } from '../types/Character';

interface VirtualRoomProps {
  character: Character;
  isListening: boolean;
  isSpeaking: boolean;
}

// Tách Room ra thành component riêng và nhận màu chủ đạo
function Room({ characterColor }: { characterColor: string }) {
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
      <Plane args={[10, 6]} position={[0, 3, -5]} receiveShadow>
        <meshStandardMaterial color="#E2E8F0" roughness={0.9} />
      </Plane>

      {/* Left wall */}
      <Plane args={[10, 6]} rotation={[0, Math.PI / 2, 0]} position={[-5, 3, 0]} receiveShadow>
        <meshStandardMaterial color="#F1F5F9" roughness={0.9} />
      </Plane>

      {/* Right wall */}
      <Plane args={[10, 6]} rotation={[0, -Math.PI / 2, 0]} position={[5, 3, 0]} receiveShadow>
        <meshStandardMaterial color="#F1F5F9" roughness={0.9} />
      </Plane>

      {/* Desk */}
      <Box args={[2, 0.1, 1]} position={[0, 0.8, 1.5]} castShadow receiveShadow>
        <meshStandardMaterial color="#8B5CF6" roughness={0.4} metalness={0.2} />
      </Box>

      {/* Chair */}
      <Box args={[0.8, 0.1, 0.8]} position={[0, 0.5, 2.8]} castShadow receiveShadow>
        <meshStandardMaterial color="#6366F1" roughness={0.6} />
      </Box>

      <Box args={[0.8, 1, 0.1]} position={[0, 1, 3.2]} castShadow receiveShadow>
        <meshStandardMaterial color="#6366F1" roughness={0.6} />
      </Box>

      {/* Ánh sáng động theo màu nhân vật */}
      <pointLight position={[-2, 4, 2]} intensity={0.5} color="#F59E0B" />
      <pointLight position={[2, 4, -2]} intensity={0.5} color={characterColor} />
    </group>
  );
}

// Dùng React.memo để chặn render thừa
const VirtualRoom = memo(function VirtualRoom({ character, isListening, isSpeaking }: VirtualRoomProps) {
  const { t } = useLanguage();
  const [dpr, setDpr] = useState(1);

  // Tối ưu DPR cho mobile (Chạy 1 lần khi mount)
  useEffect(() => {
    // Nếu màn hình nhỏ (mobile) -> dpr = 1 (ưu tiên hiệu năng)
    // Nếu màn hình lớn (desktop) -> dpr = 1.5 hoặc 2 (ưu tiên độ nét)
    const targetDpr = window.innerWidth < 768 ? 1 : Math.min(window.devicePixelRatio, 2);
    setDpr(targetDpr);
  }, []);
  
  const getStatusText = () => {
    if (isListening) return t('room.listening');
    if (isSpeaking) return t('room.speaking');
    return `${character.name} ${t('room.ready')}`;
  };

  const getStatusColor = () => {
    if (isListening) return '#EF4444';
    if (isSpeaking) return '#F59E0B';
    return '#10B981';
  };

  return (
    <div className="w-full h-full">
      <Canvas
        camera={{ position: [0, 2, 6], fov: 75 }}
        shadows
        // Tối ưu pixel ratio: Mobile = 1, Desktop = max 2
        dpr={dpr}
        className="bg-gradient-to-b from-blue-50 to-indigo-100"
      >
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={1024} // Giảm xuống 1024 cho nhẹ
          shadow-mapSize-height={1024}
        />

        <Room characterColor={character.color} />
        
        {/* Character name */}
        <Text
          position={[0, 3.5, 0]}
          fontSize={0.3}
          color={character.color}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.02}
          outlineColor="#ffffff"
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
          scale={1.8} 
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
}, (prevProps, nextProps) => {
  // Custom comparision function cho React.memo
  // Chỉ render lại khi các props quan trọng thay đổi
  return (
    prevProps.character.id === nextProps.character.id &&
    prevProps.isListening === nextProps.isListening &&
    prevProps.isSpeaking === nextProps.isSpeaking
  );
});

export default VirtualRoom;