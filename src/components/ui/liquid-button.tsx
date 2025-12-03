import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const liquidButtonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap rounded-xl font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden",
  {
    variants: {
      variant: {
        default: "btn-premium text-white",
        outline: "border-2 border-gray-300 bg-white/80 backdrop-blur-sm text-gray-900 hover:bg-white hover:border-gray-900 hover:shadow-glow",
        ghost: "bg-transparent text-gray-900 hover:bg-gray-100/50",
        liquid: "liquid-gradient text-white shadow-liquid",
        glass: "glass text-gray-900 hover:glass-strong",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 rounded-lg px-4 text-sm",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface LiquidButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof liquidButtonVariants> {
  asChild?: boolean
}

const LiquidButton = React.forwardRef<HTMLButtonElement, LiquidButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(liquidButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
LiquidButton.displayName = "LiquidButton"

export { LiquidButton, liquidButtonVariants }

