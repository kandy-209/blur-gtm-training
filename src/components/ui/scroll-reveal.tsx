'use client';

import * as React from "react"
import { cn } from "@/lib/utils"

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  distance?: number
}

const ScrollReveal = React.forwardRef<HTMLDivElement, ScrollRevealProps>(
  ({ className, delay = 0, direction = 'up', distance = 20, children, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false)
    const elementRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setIsVisible(true)
            }, delay)
            observer.disconnect()
          }
        },
        {
          threshold: 0.1,
          rootMargin: '0px 0px -50px 0px',
        }
      )

      if (elementRef.current) {
        observer.observe(elementRef.current)
      }

      return () => {
        if (elementRef.current) {
          observer.unobserve(elementRef.current)
        }
      }
    }, [delay])

    const getTransform = () => {
      if (isVisible) {
        return 'translate(0, 0)'
      }
      switch (direction) {
        case 'up':
          return `translateY(${distance}px)`
        case 'down':
          return `translateY(-${distance}px)`
        case 'left':
          return `translateX(${distance}px)`
        case 'right':
          return `translateX(-${distance}px)`
        default:
          return `translateY(${distance}px)`
      }
    }

    const style: React.CSSProperties = {
      transform: getTransform(),
      opacity: isVisible ? 1 : 0,
      transition: 'transform 0.5s cubic-bezier(0.2, 0, 0, 1), opacity 0.5s cubic-bezier(0.2, 0, 0, 1)',
      willChange: 'transform, opacity',
    }

    return (
      <div
        ref={(node) => {
          if (typeof ref === 'function') {
            ref(node)
          } else if (ref) {
            ref.current = node
          }
          elementRef.current = node
        }}
        className={cn('transition-gentle', className)}
        style={style}
        {...props}
      >
        {children}
      </div>
    )
  }
)
ScrollReveal.displayName = "ScrollReveal"

export { ScrollReveal }

