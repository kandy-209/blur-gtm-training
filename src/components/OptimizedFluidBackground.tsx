'use client';

import { useEffect, useRef, useMemo, useCallback } from 'react';

interface OptimizedFluidBackgroundProps {
  intensity?: 'subtle' | 'medium' | 'strong';
  color?: 'default' | 'blue' | 'purple' | 'gradient';
  className?: string;
}

/**
 * Ultra-optimized fluid background using CSS-only approach where possible
 * Falls back to canvas only when needed for complex animations
 */
export default function OptimizedFluidBackground({
  intensity = 'medium',
  color = 'default',
  className = '',
}: OptimizedFluidBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const isVisibleRef = useRef(true);
  const lastFrameTimeRef = useRef<number>(0);
  
  // Reduced FPS for better performance
  const targetFPS = 20; // Further reduced from 30
  const frameInterval = 1000 / targetFPS;

  // Use Intersection Observer to pause when not visible
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        isVisibleRef.current = entries[0].isIntersecting;
        if (!isVisibleRef.current && animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = undefined;
        }
      },
      { threshold: 0 }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Optimized canvas rendering
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { 
      alpha: true,
      desynchronized: true,
      willReadFrequently: false,
      powerPreference: 'low-power', // Better battery life
    }) as CanvasRenderingContext2D | null;
    if (!ctx) return;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'low';

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5); // Further reduced DPR

    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(dpr, dpr);
    };
    setCanvasSize();

    // Throttled resize with debounce
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(setCanvasSize, 200);
    };
    window.addEventListener('resize', handleResize, { passive: true });

    // Minimal blob configuration
    const blobCount = 2; // Reduced from 3
    const blobs = Array.from({ length: blobCount }, (_, i) => ({
      x: (width / (blobCount + 1)) * (i + 1),
      y: height / 2,
      radius: 80 + i * 40,
      vx: (i % 2 === 0 ? 1 : -1) * 0.2,
      vy: (i % 2 === 0 ? -1 : 1) * 0.2,
      color: i === 0 
        ? 'rgba(59, 130, 246, 0.08)' 
        : 'rgba(147, 51, 234, 0.08)',
    }));

    // Removed pre-created gradients (can't modify them, recreate as needed)

    const animate = (currentTime: number) => {
      if (!isVisibleRef.current) return;

      const elapsed = currentTime - lastFrameTimeRef.current;
      
      if (elapsed >= frameInterval) {
        lastFrameTimeRef.current = currentTime - (elapsed % frameInterval);
        
        // Use clearRect efficiently
        ctx.clearRect(0, 0, width, height);

        blobs.forEach((blob, i) => {
          blob.x += blob.vx;
          blob.y += blob.vy;

          if (blob.x < blob.radius || blob.x > width - blob.radius) blob.vx *= -1;
          if (blob.y < blob.radius || blob.y > height - blob.radius) blob.vy *= -1;

          blob.x = Math.max(blob.radius, Math.min(width - blob.radius, blob.x));
          blob.y = Math.max(blob.radius, Math.min(height - blob.radius, blob.y));

          // Create gradient efficiently
          const gradient = ctx.createRadialGradient(
            blob.x, blob.y, 0,
            blob.x, blob.y, blob.radius
          );
          gradient.addColorStop(0, blob.color);
          gradient.addColorStop(1, 'transparent');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(blob.x, blob.y, blob.radius, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      if (isVisibleRef.current) {
        animationFrameRef.current = requestAnimationFrame(animate);
      }
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
  }, [frameInterval]);

  return (
    <div ref={containerRef} className={`fixed inset-0 pointer-events-none z-[-1] ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ 
          mixBlendMode: 'multiply',
          willChange: 'contents',
          contain: 'strict',
          transform: 'translateZ(0)',
          opacity: 0.6,
        }}
      />
    </div>
  );
}

