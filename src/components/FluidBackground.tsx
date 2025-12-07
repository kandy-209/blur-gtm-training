'use client';

import { useEffect, useRef, useMemo } from 'react';

interface FluidBackgroundProps {
  intensity?: 'subtle' | 'medium' | 'strong';
  color?: 'default' | 'blue' | 'purple' | 'gradient';
  className?: string;
}

export default function FluidBackground({
  intensity = 'medium',
  color = 'default',
  className = '',
}: FluidBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const blobsRef = useRef<Array<{
    x: number;
    y: number;
    radius: number;
    vx: number;
    vy: number;
    color: string;
  }>>([]);
  const lastFrameTimeRef = useRef<number>(0);
  const targetFPS = 30; // Reduce to 30fps for better performance
  const frameInterval = 1000 / targetFPS;

  // Memoize color config
  const colorConfig = useMemo(() => ({
    default: {
      primary: 'rgba(0, 0, 0, 0.03)',
      secondary: 'rgba(0, 0, 0, 0.02)',
      accent: 'rgba(0, 0, 0, 0.015)',
    },
    blue: {
      primary: 'rgba(59, 130, 246, 0.08)',
      secondary: 'rgba(59, 130, 246, 0.05)',
      accent: 'rgba(59, 130, 246, 0.03)',
    },
    purple: {
      primary: 'rgba(147, 51, 234, 0.08)',
      secondary: 'rgba(147, 51, 234, 0.05)',
      accent: 'rgba(147, 51, 234, 0.03)',
    },
    gradient: {
      primary: 'rgba(59, 130, 246, 0.06)',
      secondary: 'rgba(147, 51, 234, 0.06)',
      accent: 'rgba(59, 130, 246, 0.04)',
    },
  }), []);

  const intensityMultiplier = useMemo(() => ({
    subtle: 0.5,
    medium: 1,
    strong: 1.5,
  }[intensity]), [intensity]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { 
      alpha: true,
      desynchronized: true, // Better performance
      willReadFrequently: false 
    });
    if (!ctx) return;

    // Optimize canvas rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'low'; // Better performance

    // Set canvas size with device pixel ratio optimization
    const setCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // Cap at 2x for performance
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      ctx.scale(dpr, dpr);
    };
    setCanvasSize();

    // Throttled resize handler
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(setCanvasSize, 150);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Color configuration
    const colorConfig = {
      default: {
        primary: 'rgba(0, 0, 0, 0.03)',
        secondary: 'rgba(0, 0, 0, 0.02)',
        accent: 'rgba(0, 0, 0, 0.015)',
      },
      blue: {
        primary: 'rgba(59, 130, 246, 0.08)',
        secondary: 'rgba(59, 130, 246, 0.05)',
        accent: 'rgba(59, 130, 246, 0.03)',
      },
      purple: {
        primary: 'rgba(147, 51, 234, 0.08)',
        secondary: 'rgba(147, 51, 234, 0.05)',
        accent: 'rgba(147, 51, 234, 0.03)',
      },
      gradient: {
        primary: 'rgba(59, 130, 246, 0.06)',
        secondary: 'rgba(147, 51, 234, 0.06)',
        accent: 'rgba(59, 130, 246, 0.04)',
      },
    };

    const colors = colorConfig[color];
    const width = canvas.width / (window.devicePixelRatio || 1);
    const height = canvas.height / (window.devicePixelRatio || 1);

    // Initialize blobs only once
    if (blobsRef.current.length === 0) {
      const blobCount = 3;
      blobsRef.current = Array.from({ length: blobCount }, (_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: (50 + Math.random() * 100) * intensityMultiplier,
        vx: (Math.random() - 0.5) * 0.3, // Slower for better performance
        vy: (Math.random() - 0.5) * 0.3,
        color: i === 0 ? colors.primary : i === 1 ? colors.secondary : colors.accent,
      }));
    }

    // Optimized animation loop with frame rate limiting
    const animate = (currentTime: number) => {
      const elapsed = currentTime - lastFrameTimeRef.current;
      
      if (elapsed >= frameInterval) {
        lastFrameTimeRef.current = currentTime - (elapsed % frameInterval);
        
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const w = width * dpr;
        const h = height * dpr;
        
        // Use clearRect efficiently
        ctx.clearRect(0, 0, w, h);

        // Update and draw blobs (optimized)
        blobsRef.current.forEach((blob) => {
          // Update position
          blob.x += blob.vx;
          blob.y += blob.vy;

          // Bounce off edges
          if (blob.x < 0 || blob.x > width) blob.vx *= -1;
          if (blob.y < 0 || blob.y > height) blob.vy *= -1;

          // Keep in bounds
          blob.x = Math.max(0, Math.min(width, blob.x));
          blob.y = Math.max(0, Math.min(height, blob.y));

          // Reuse gradient creation (more efficient)
          const gradient = ctx.createRadialGradient(
            blob.x * dpr,
            blob.y * dpr,
            0,
            blob.x * dpr,
            blob.y * dpr,
            blob.radius * dpr
          );
          gradient.addColorStop(0, blob.color);
          gradient.addColorStop(1, 'transparent');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(blob.x * dpr, blob.y * dpr, blob.radius * dpr, 0, Math.PI * 2);
          ctx.fill();
        });

        // Single composite operation
        ctx.globalCompositeOperation = 'screen';
        blobsRef.current.forEach((blob) => {
          const gradient = ctx.createRadialGradient(
            blob.x * dpr,
            blob.y * dpr,
            0,
            blob.x * dpr,
            blob.y * dpr,
            blob.radius * 1.2 * dpr
          );
          gradient.addColorStop(0, blob.color);
          gradient.addColorStop(1, 'transparent');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(blob.x * dpr, blob.y * dpr, blob.radius * 1.2 * dpr, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.globalCompositeOperation = 'source-over';
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastFrameTimeRef.current = performance.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      clearTimeout(resizeTimeout);
    };
  }, [intensity, color, colorConfig, intensityMultiplier]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
      style={{ 
        mixBlendMode: 'multiply',
        willChange: 'contents', // GPU acceleration hint
        contain: 'layout style paint', // CSS containment for performance
      }}
    />
  );
}

