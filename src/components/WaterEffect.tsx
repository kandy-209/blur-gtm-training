'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, ShaderMaterial, PlaneGeometry } from 'three';

interface WaterEffectProps {
  position?: [number, number, number];
  size?: number;
}

export default function WaterEffect({ 
  position = [0, 0, 0],
  size = 20
}: WaterEffectProps) {
  const meshRef = useRef<Mesh>(null);
  const materialRef = useRef<ShaderMaterial>(null);

  // Water shader
  const waterShader = useMemo(() => ({
    uniforms: {
      time: { value: 0 },
      resolution: { value: [window.innerWidth, window.innerHeight] },
    },
    vertexShader: `
      varying vec2 vUv;
      varying vec3 vPosition;
      
      void main() {
        vUv = uv;
        vPosition = position;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform float time;
      uniform vec2 resolution;
      varying vec2 vUv;
      varying vec3 vPosition;
      
      // Water effect using noise and sine waves
      float noise(vec2 p) {
        return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      }
      
      float smoothNoise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        
        float a = noise(i);
        float b = noise(i + vec2(1.0, 0.0));
        float c = noise(i + vec2(0.0, 1.0));
        float d = noise(i + vec2(1.0, 1.0));
        
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      
      float waterHeight(vec2 p) {
        float height = 0.0;
        height += smoothNoise(p * 2.0 + time * 0.5) * 0.5;
        height += smoothNoise(p * 4.0 + time * 0.3) * 0.25;
        height += smoothNoise(p * 8.0 + time * 0.2) * 0.125;
        return height;
      }
      
      void main() {
        vec2 uv = vUv;
        vec2 p = vPosition.xy * 0.1;
        
        // Water waves
        float wave = waterHeight(p + time * 0.1);
        wave += sin(p.x * 3.0 + time) * 0.1;
        wave += sin(p.y * 2.0 + time * 0.8) * 0.1;
        
        // Water color - dark blue/black for Cursor theme
        vec3 waterColor = vec3(0.0, 0.02, 0.05);
        vec3 foamColor = vec3(0.05, 0.05, 0.08);
        vec3 deepColor = vec3(0.0, 0.01, 0.03);
        
        // Foam effect
        float foam = smoothstep(0.3, 0.7, wave);
        vec3 color = mix(waterColor, foamColor, foam);
        
        // Depth variation
        float depth = smoothstep(-0.5, 0.5, vPosition.z);
        color = mix(deepColor, color, depth);
        
        // Add highlights
        float highlight = pow(wave, 2.0) * 0.3;
        color += vec3(highlight);
        
        // Transparency - more visible water
        float alpha = 0.4 + wave * 0.3;
        
        gl_FragColor = vec4(color, alpha);
      }
    `,
  }), []);

  // Animate water
  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.time.value = state.clock.elapsedTime;
    }
    
    // Gentle movement
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.05;
      meshRef.current.rotation.z = Math.cos(state.clock.elapsedTime * 0.15) * 0.03;
    }
  });

  return (
    // @ts-ignore - React Three Fiber types
    <mesh ref={meshRef} position={position} rotation={[-Math.PI / 2, 0, 0]}>
      {/* @ts-ignore - React Three Fiber types */}
      <planeGeometry args={[size, size, 64, 64]} />
      {/* @ts-ignore - React Three Fiber types */}
      <shaderMaterial
        ref={materialRef}
        {...waterShader}
        transparent
        side={2} // DoubleSide
      />
    </mesh>
  );
}

