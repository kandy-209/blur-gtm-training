'use client';

import { Suspense, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import CursorLogo3D from './CursorLogo3D';
import WaterEffect from './WaterEffect';
import WaterParticles from './WaterParticles';
import { GLOBAL_GL } from '@/app/gl';

interface WebGLCanvasProps {
  className?: string;
  showLogo?: boolean;
}

export default function WebGLCanvas({ className = '', showLogo = true }: WebGLCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const gl = canvasRef.current.getContext('webgl') || canvasRef.current.getContext('webgl2');
      if (gl) {
        GLOBAL_GL.gl = gl as WebGLRenderingContext;
        GLOBAL_GL.canvas = canvasRef.current;
      }
    }
  }, []);

  return (
    <div className={`absolute inset-0 w-full h-full ${className}`}>
      <Canvas
        ref={canvasRef}
        gl={{ antialias: true, alpha: true }}
        dpr={[1, 2]}
        className="w-full h-full"
      >
        <Suspense fallback={null}>
          {/* Lighting */}
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />

          {/* Camera */}
          <PerspectiveCamera
            makeDefault
            position={[0, 2, 8]}
            fov={60}
          />

          {/* Water Effect */}
          <WaterEffect position={[0, -2, 0]} size={30} />

          {/* Water Particles */}
          <WaterParticles count={200} speed={0.3} />

          {/* Cursor Logo */}
          {showLogo && (
            <CursorLogo3D
              position={[0, 1, 0]}
              rotationSpeed={0.3}
              scale={1.5}
            />
          )}
        </Suspense>
      </Canvas>
    </div>
  );
}

// Particle field for background effects
function ParticleField() {
  const particlesRef = useRef<Points>(null);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  const particleCount = 100;
  const positions = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20;
    }
    return positions;
  }, []);

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#000000" transparent opacity={0.3} />
    </points>
  );
}

