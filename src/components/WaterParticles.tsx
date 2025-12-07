// @ts-nocheck - React Three Fiber types
'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Points, BufferGeometry, BufferAttribute, PointsMaterial } from 'three';

interface WaterParticlesProps {
  count?: number;
  speed?: number;
}

export default function WaterParticles({ 
  count = 200,
  speed = 0.5
}: WaterParticlesProps) {
  const pointsRef = useRef<Points>(null);

  // Create particle positions
  const { positions, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    
    for (let i = 0; i < count; i++) {
      // Random positions in a sphere
      const radius = Math.random() * 15 + 5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      
      // Random velocities
      velocities[i * 3] = (Math.random() - 0.5) * speed;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * speed;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * speed;
    }
    
    return { positions, velocities };
  }, [count, speed]);

  const velocitiesRef = useRef<Float32Array>(velocities);

  // Animate particles like water droplets
  useFrame((state) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
      const velocities = velocitiesRef.current;
      
      for (let i = 0; i < count; i++) {
        // Update positions
        positions[i * 3] += velocities[i * 3] * 0.01;
        positions[i * 3 + 1] += velocities[i * 3 + 1] * 0.01;
        positions[i * 3 + 2] += velocities[i * 3 + 2] * 0.01;
        
        // Bounce off boundaries
        const radius = Math.sqrt(
          positions[i * 3] ** 2 + 
          positions[i * 3 + 1] ** 2 + 
          positions[i * 3 + 2] ** 2
        );
        
        if (radius > 20) {
          velocities[i * 3] *= -0.8;
          velocities[i * 3 + 1] *= -0.8;
          velocities[i * 3 + 2] *= -0.8;
        }
        
        // Add some wave motion
        positions[i * 3 + 1] += Math.sin(state.clock.elapsedTime + i) * 0.01;
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
      
      // Rotate slowly
      pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    // @ts-ignore - React Three Fiber types
    <points ref={pointsRef}>
      {/* @ts-ignore - React Three Fiber types */}
      <bufferGeometry>
        {/* @ts-ignore - React Three Fiber types */}
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      {/* @ts-ignore - React Three Fiber types */}
      <pointsMaterial
        size={0.1}
        color="#000000"
        transparent
        opacity={0.4}
        sizeAttenuation={true}
      />
    </points>
  );
}

