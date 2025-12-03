import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 overflow-hidden focus-ring-glow",
  {
    variants: {
      variant: {
        default: "btn-premium text-white",
        liquid: "btn-liquid-interactive text-white",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md hover:shadow-red-500/20 focus-visible:ring-red-500",
        outline:
          "border-2 border-gray-300 bg-white/80 backdrop-blur-sm hover:bg-white hover:border-gray-900 hover:shadow-glow transition-all glass-ultra",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200 shadow-sm hover:shadow-md shadow-depth-1",
        ghost: "hover:bg-gray-100/80 hover:text-gray-900 backdrop-blur-sm",
        link: "text-black underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-11 rounded-xl px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }

