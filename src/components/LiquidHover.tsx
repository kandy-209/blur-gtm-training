'use client';

import { useRef, useEffect, useState } from 'react';

interface LiquidHoverProps {
  children: React.ReactNode;
  intensity?: 'subtle' | 'medium' | 'strong';
  className?: string;
}

export default function LiquidHover({
  children,
  intensity = 'medium',
  className = '',
}: LiquidHoverProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const intensityValues = {
    subtle: { blur: 40, opacity: 0.15 },
    medium: { blur: 60, opacity: 0.25 },
    strong: { blur: 80, opacity: 0.35 },
  };

  const { blur, opacity } = intensityValues[intensity];

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    };

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      style={{ userSelect: 'none' }}
    >
      {children}
      {isHovered && (
        <div
          className="pointer-events-none absolute inset-0 rounded-inherit transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle ${blur * 2}px at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, ${opacity}) 0%, rgba(147, 51, 234, ${opacity * 0.6}) 50%, transparent 70%)`,
            filter: `blur(${blur}px)`,
            opacity: isHovered ? 1 : 0,
            mixBlendMode: 'multiply',
            zIndex: 1,
          }}
        />
      )}
    </div>
  );
}

