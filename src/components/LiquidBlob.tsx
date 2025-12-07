'use client';

import { useEffect, useRef, useState, useMemo, useCallback } from 'react';

interface LiquidBlobProps {
  size?: number;
  color?: string;
  speed?: number;
  className?: string;
}

export default function LiquidBlob({
  size = 400,
  color = 'rgba(59, 130, 246, 0.1)',
  speed = 1,
  className = '',
}: LiquidBlobProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [points, setPoints] = useState<number[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef<number>(0);
  const targetFPS = 30; // Reduce to 30fps
  const frameInterval = 1000 / targetFPS;

  // Memoize initial points
  const initialPoints = useMemo(() => {
    const numPoints = 8;
    return Array.from({ length: numPoints }, (_, i) => {
      const angle = (i / numPoints) * Math.PI * 2;
      return {
        angle,
        radius: 0.5 + Math.random() * 0.2,
        speed: 0.01 + Math.random() * 0.02,
      };
    });
  }, []);

  useEffect(() => {
    if (points.length === 0) {
      setPoints(initialPoints.map((p) => p.radius));
    }

    const animate = (currentTime: number) => {
      const elapsed = currentTime - lastUpdateRef.current;
      
      if (elapsed >= frameInterval) {
        lastUpdateRef.current = currentTime - (elapsed % frameInterval);
        
        setPoints((prev) =>
          prev.map((radius, i) => {
            const point = initialPoints[i];
            const newRadius = Math.sin(currentTime * point.speed * speed * 0.001 + point.angle) * 0.1 + 0.5;
            return Math.max(0.3, Math.min(0.7, newRadius));
          })
        );
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastUpdateRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [speed, initialPoints, points.length]);

  // Memoize path generation
  const generatePath = useCallback(() => {
    if (points.length === 0) return '';

    const centerX = size / 2;
    const centerY = size / 2;
    const numPoints = points.length;

    const pathPoints = points.map((radius, i) => {
      const angle = (i / numPoints) * Math.PI * 2;
      const x = centerX + Math.cos(angle) * radius * (size / 2);
      const y = centerY + Math.sin(angle) * radius * (size / 2);
      return { x, y };
    });

    let path = `M ${pathPoints[0].x} ${pathPoints[0].y}`;
    for (let i = 0; i < pathPoints.length; i++) {
      const next = pathPoints[(i + 1) % pathPoints.length];
      const cp1x = pathPoints[i].x + (next.x - pathPoints[i].x) / 3;
      const cp1y = pathPoints[i].y + (next.y - pathPoints[i].y) / 3;
      const cp2x = pathPoints[i].x + (next.x - pathPoints[i].x) * 2 / 3;
      const cp2y = pathPoints[i].y + (next.y - pathPoints[i].y) * 2 / 3;
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${next.x} ${next.y}`;
    }
    path += ' Z';

    return path;
  }, [points, size]);

  const pathData = useMemo(() => generatePath(), [generatePath]);

  // Unique gradient ID to avoid conflicts
  const gradientId = useMemo(() => `blobGradient-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <svg
      ref={svgRef}
      width={size}
      height={size}
      className={`absolute ${className}`}
      style={{ 
        filter: 'blur(40px)',
        willChange: 'contents',
        contain: 'layout style paint',
        transform: 'translateZ(0)', // GPU acceleration
      }}
    >
      <defs>
        <radialGradient id={gradientId}>
          <stop offset="0%" stopColor={color} stopOpacity="0.8" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </radialGradient>
      </defs>
      <path
        ref={pathRef}
        d={pathData}
        fill={`url(#${gradientId})`}
        style={{
          transition: 'd 0.1s ease-out', // Faster transition
          willChange: 'd',
        }}
      />
    </svg>
  );
}

