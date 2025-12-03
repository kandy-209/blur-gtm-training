'use client';

import * as React from "react"
import { cn } from "@/lib/utils"

interface AnimatedGradientProps extends React.HTMLAttributes<HTMLDivElement> {
  colors?: string[]
  duration?: number
  direction?: 'horizontal' | 'vertical' | 'diagonal'
  intensity?: 'subtle' | 'medium' | 'strong'
}

const AnimatedGradient = React.forwardRef<HTMLDivElement, AnimatedGradientProps>(
  ({ 
    className, 
    colors = ['rgba(59, 130, 246, 0.1)', 'rgba(147, 51, 234, 0.1)', 'rgba(59, 130, 246, 0.1)'],
    duration = 8,
    direction = 'diagonal',
    intensity = 'subtle',
    children,
    ...props 
  }, ref) => {
    const intensityMap = {
      subtle: 0.1,
      medium: 0.2,
      strong: 0.3,
    }

    const opacity = intensityMap[intensity]
    const adjustedColors = colors.map(color => {
      // Extract RGB and apply intensity
      const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
      if (match) {
        const [, r, g, b, a] = match
        return `rgba(${r}, ${g}, ${b}, ${opacity})`
      }
      return color
    })

    const directionMap = {
      horizontal: '90deg',
      vertical: '180deg',
      diagonal: '135deg',
    }

    const gradientStyle: React.CSSProperties = {
      background: `linear-gradient(${directionMap[direction]}, ${adjustedColors.join(', ')})`,
      backgroundSize: '400% 400%',
      animation: `gradient-shift ${duration}s ease infinite`,
    }

    return (
      <div
        ref={ref}
        className={cn(
          'animate-gradient-shift',
          className
        )}
        style={gradientStyle}
        {...props}
      >
        {children}
      </div>
    )
  }
)
AnimatedGradient.displayName = "AnimatedGradient"

export { AnimatedGradient }


