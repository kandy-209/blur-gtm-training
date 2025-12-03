'use client';

import * as React from "react"
import { cn } from "@/lib/utils"

interface LiquidProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: number
  max?: number
  showLabel?: boolean
  variant?: "default" | "blue" | "purple" | "success" | "warning" | "error"
}

const LiquidProgress = React.forwardRef<HTMLDivElement, LiquidProgressProps>(
  ({ className, value = 0, max = 100, showLabel = false, variant = "default", ...props }, ref) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
    
    const variantClasses = {
      default: "bg-gradient-to-r from-gray-600 via-gray-700 to-gray-600",
      blue: "bg-gradient-to-r from-blue-500 via-blue-600 to-blue-500",
      purple: "bg-gradient-to-r from-purple-500 via-purple-600 to-purple-500",
      success: "bg-gradient-to-r from-green-500 via-green-600 to-green-500",
      warning: "bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500",
      error: "bg-gradient-to-r from-red-500 via-red-600 to-red-500",
    }

    return (
      <div ref={ref} className={cn("relative w-full", className)} {...props}>
        <div className="liquid-progress h-2 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out animate-gradient-shift",
              variantClasses[variant]
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
        {showLabel && (
          <div className="mt-1 text-xs text-gray-600 text-right">
            {Math.round(percentage)}%
          </div>
        )}
      </div>
    )
  }
)
LiquidProgress.displayName = "LiquidProgress"

export { LiquidProgress }


