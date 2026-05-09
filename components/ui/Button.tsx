import * as React from "react"
import { cn } from "@/lib/cn"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium",
          "transition-all duration-150",
          // Focus — gold ring
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 focus-visible:ring-offset-cream",
          // Tap scale
          "active:scale-[0.97]",
          // Disabled
          "disabled:pointer-events-none disabled:opacity-50",
          // Variants
          variant === 'default' && "bg-coral text-cream hover:bg-coral/90 h-10 px-4 py-2 shadow-sm font-sans",
          variant === 'ghost'   && "bg-transparent text-ocean hover:bg-ocean/5 h-10 px-4 py-2",
          variant === 'outline' && "border border-ocean/20 text-ocean hover:bg-ocean/5 h-10 px-4 py-2",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
