// @ts-nocheck - React Three Fiber types
'use client';
// @ts-nocheck

/// <reference types="@react-three/fiber" />

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh } from 'three';
import { Text } from '@react-three/drei';

interface CursorLogo3DProps {
  position?: [number, number, number];
  rotationSpeed?: number;
  scale?: number;
}

export default function CursorLogo3D({ 
  position = [0, 0, 0],
  rotationSpeed = 0.5,
  scale = 1
}: CursorLogo3DProps) {
  const groupRef = useRef<any>(null);

  // Animate rotation and floating
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed * 0.01;
      groupRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.1;
      groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    // @ts-ignore - React Three Fiber JSX elements
    <group ref={groupRef} position={position} scale={scale}>
      {/* Simplified Cursor shape - using box geometry */}
      <mesh position={[0, 0, 0]}>
        {/* Cursor arrow body */}
        <boxGeometry args={[0.2, 0.6, 0.1]} />
        <meshStandardMaterial
          color="#000000"
          metalness={0.8}
          roughness={0.2}
          emissive="#000000"
          emissiveIntensity={0.1}
        />
      </mesh>
      
      {/* Arrow tip */}
      <mesh position={[0, 0.35, 0]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.15, 0.15, 0.1]} />
        <meshStandardMaterial
          color="#000000"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Cursor text */}
      <Text
        position={[0, -0.6, 0.1]}
        fontSize={0.25}
        color="#000000"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#ffffff"
      >
        CURSOR
      </Text>
    </group>
  );
}
                                            