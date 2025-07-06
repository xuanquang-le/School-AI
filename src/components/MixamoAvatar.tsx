import { useEffect, useRef, useState } from 'react';
import { useGLTF, useAnimations } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MixamoAvatarProps {
    isListening: boolean;
    isSpeaking: boolean;
}

// Animation names from Mixamo
const ANIMATIONS = {
    IDLE: 'Armature|mixamo.com|Layer0',
    TALKING: 'Armature|mixamo.com|Layer0.001',
    LISTENING: 'Armature|mixamo.com|Layer0.002',
    THINKING: 'Armature|mixamo.com|Layer0.003',
    GREETING: 'Armature|mixamo.com|Layer0.004'
};

export function MixamoAvatar({ isListening, isSpeaking }: MixamoAvatarProps) {
    const group = useRef<THREE.Group | null>(null);
    const { scene, animations } = useGLTF('/char.glb');
    const { actions, mixer } = useAnimations(animations, scene);
    const [currentAnimation, setCurrentAnimation] = useState<string | null>(null);

    // Setup model
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

    // Handle animation transitions
    useEffect(() => {
        // Function to smoothly transition to a new animation
        const playAnimation = (animationName: string) => {
            if (currentAnimation === animationName) return;

            // Fade out current animation
            if (currentAnimation && actions[currentAnimation]) {
                actions[currentAnimation]
                    .fadeOut(0.5)
                    .stop();
            }

            // Fade in new animation
            if (actions[animationName]) {
                actions[animationName]
                    .reset()
                    .setEffectiveTimeScale(1)
                    .setEffectiveWeight(1)
                    .fadeIn(0.5)
                    .play();
                setCurrentAnimation(animationName);
            }
        };

        // Choose animation based on state
        if (isSpeaking) {
            playAnimation(ANIMATIONS.TALKING);
        } else if (isListening) {
            playAnimation(ANIMATIONS.LISTENING);
        } else {
            // Randomly switch between idle and thinking
            const idleAnims = [ANIMATIONS.IDLE, ANIMATIONS.THINKING];
            const randomIdle = idleAnims[Math.floor(Math.random() * idleAnims.length)];
            playAnimation(randomIdle);
        }

        // Cleanup function
        return () => {
            Object.values(actions).forEach(action => action?.stop());
        };
    }, [actions, isSpeaking, isListening, currentAnimation]);

    // Update animations
    useFrame((state, delta) => {
        mixer?.update(delta);

        // Add subtle movement when speaking or listening
        if (group.current) {
            if (isSpeaking) {
                group.current.rotation.y = Math.sin(state.clock.elapsedTime * 2) * 0.1;
            } else if (isListening) {
                group.current.position.y = Math.sin(state.clock.elapsedTime * 3) * 0.02;
            }
        }
    });

    return (
        <group ref={group} dispose={null} position={[0, 0, 0]}>
            <primitive object={scene} scale={1} />
        </group>
    );
}

useGLTF.preload('/char.glb'); 