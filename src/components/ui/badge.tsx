import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80 px-2.5 py-0.5",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 px-2.5 py-0.5",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80 px-2.5 py-0.5",
        outline: "text-foreground px-1.5 py-0.5",
        colored: "px-1.5 py-0.5", // Custom variant for color-coded badges
      },
      size: {
        default: "px-1.5 py-0.5 text-xs",
        sm: "px-1 py-0.5 text-[10px]",
        lg: "px-2.5 py-0.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "sm",
    },
  }
)

// Utility function to get badge color based on text content
export const getBadgeColorByText = (text: string): string => {
  const normalizedText = text.toLowerCase().trim();
  
  // Category-based colors
  if (normalizedText.includes('competitive') || normalizedText.includes('copilot')) {
    return 'bg-blue-100 text-blue-700 border-blue-200';
  }
  if (normalizedText.includes('security') || normalizedText.includes('privacy')) {
    return 'bg-red-100 text-red-700 border-red-200';
  }
  if (normalizedText.includes('pricing') || normalizedText.includes('value') || normalizedText.includes('cost')) {
    return 'bg-green-100 text-green-700 border-green-200';
  }
  if (normalizedText.includes('integration') || normalizedText.includes('complexity')) {
    return 'bg-purple-100 text-purple-700 border-purple-200';
  }
  if (normalizedText.includes('adoption') || normalizedText.includes('concern')) {
    return 'bg-orange-100 text-orange-700 border-orange-200';
  }
  if (normalizedText.includes('code') || normalizedText.includes('quality')) {
    return 'bg-indigo-100 text-indigo-700 border-indigo-200';
  }
  
  // Keyword-based colors
  if (normalizedText.includes('productivity') || normalizedText.includes('efficiency')) {
    return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  }
  if (normalizedText.includes('roi') || normalizedText.includes('return')) {
    return 'bg-teal-100 text-teal-700 border-teal-200';
  }
  if (normalizedText.includes('compliance') || normalizedText.includes('audit')) {
    return 'bg-rose-100 text-rose-700 border-rose-200';
  }
  if (normalizedText.includes('collaboration') || normalizedText.includes('team')) {
    return 'bg-cyan-100 text-cyan-700 border-cyan-200';
  }
  if (normalizedText.includes('enterprise') || normalizedText.includes('scale')) {
    return 'bg-violet-100 text-violet-700 border-violet-200';
  }
  if (normalizedText.includes('speed') || normalizedText.includes('performance')) {
    return 'bg-amber-100 text-amber-700 border-amber-200';
  }
  
  // Default color based on text hash for consistency
  const hash = normalizedText.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  const colors = [
    'bg-blue-100 text-blue-700 border-blue-200',
    'bg-purple-100 text-purple-700 border-purple-200',
    'bg-pink-100 text-pink-700 border-pink-200',
    'bg-indigo-100 text-indigo-700 border-indigo-200',
    'bg-teal-100 text-teal-700 border-teal-200',
    'bg-yellow-100 text-yellow-700 border-yellow-200',
  ];
  return colors[Math.abs(hash) % colors.length];
};

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  autoColor?: boolean; // Automatically color based on text content
}

function Badge({ className, variant, size, autoColor, children, ...props }: BadgeProps) {
  // Extract text from children for color detection
  let badgeText = '';
  if (typeof children === 'string') {
    badgeText = children;
  } else {
    const textNodes = React.Children.toArray(children)
      .filter(child => typeof child === 'string')
      .join(' ');
    badgeText = textNodes || '';
  }
  
  // Auto-apply colors if autoColor is true OR if variant is outline and text contains keywords
  const shouldAutoColor = autoColor || (variant === 'outline' && badgeText);
  const colorClasses = shouldAutoColor && badgeText ? getBadgeColorByText(badgeText) : '';
  
  return (
    <div 
      className={cn(
        badgeVariants({ variant, size }), 
        shouldAutoColor && colorClasses,
        className
      )} 
      {...props}
    >
      {children}
    </div>
  )
}

export { Badge, badgeVariants }

