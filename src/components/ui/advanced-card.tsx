import * as React from "react"
import { cn } from "@/lib/utils"

interface AdvancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  depth?: 1 | 2 | 3 | 4 | 5
  accent?: "blue" | "purple" | "success" | "warning" | "error" | null
  hover?: boolean
  liquid?: boolean
}

const AdvancedCard = React.forwardRef<HTMLDivElement, AdvancedCardProps>(
  ({ className, depth = 2, accent = null, hover = true, liquid = false, ...props }, ref) => {
    const depthClasses = {
      1: "card-depth-1",
      2: "card-depth-2",
      3: "card-depth-3",
      4: "card-depth-4",
      5: "card-depth-5",
    }

    const accentClasses = {
      blue: "card-accent-blue",
      purple: "card-accent-purple",
      success: "card-accent-blue", // Using blue as base, can be customized
      warning: "card-accent-blue",
      error: "card-accent-blue",
    }

    return (
      <div
        ref={ref}
        className={cn(
          "card-premium",
          depthClasses[depth],
          accent && accentClasses[accent],
          hover && "hover-lift",
          liquid && "animate-liquid-wave",
          className
        )}
        {...props}
      />
    )
  }
)
AdvancedCard.displayName = "AdvancedCard"

const AdvancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6 pb-4", className)}
    {...props}
  />
))
AdvancedCardHeader.displayName = "AdvancedCardHeader"

const AdvancedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-tight tracking-tight",
      className
    )}
    {...props}
  />
))
AdvancedCardTitle.displayName = "AdvancedCardTitle"

const AdvancedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
AdvancedCardDescription.displayName = "AdvancedCardDescription"

const AdvancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
AdvancedCardContent.displayName = "AdvancedCardContent"

const AdvancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
AdvancedCardFooter.displayName = "AdvancedCardFooter"

export { 
  AdvancedCard, 
  AdvancedCardHeader, 
  AdvancedCardFooter, 
  AdvancedCardTitle, 
  AdvancedCardDescription, 
  AdvancedCardContent 
}

