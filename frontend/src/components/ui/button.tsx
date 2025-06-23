import { forwardRef, type ButtonHTMLAttributes } from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/services/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 theme-sync transition-all duration-200 ease-out",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/85 active:bg-primary/95 shadow-sm hover:shadow-md light:shadow-sm light:hover:shadow-md light:border light:border-primary/20",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/85 active:bg-destructive/95 shadow-sm hover:shadow-md light:shadow-sm light:hover:shadow-md",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:bg-accent/80 shadow-sm hover:shadow-md hover:border-ring/50 light:border-border light:hover:border-accent-foreground/30 light:hover:bg-accent/80",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/75 active:bg-secondary/90 shadow-sm hover:shadow-md light:border light:border-secondary/30 light:hover:border-secondary/50",
        ghost: "hover:bg-accent hover:text-accent-foreground active:bg-accent/80 hover:shadow-sm light:hover:bg-accent/60 light:hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline focus:underline hover:text-primary/80 light:text-primary light:hover:text-primary/70",
        // Enhanced gaming variants with better light mode support
        neon: "bg-gradient-to-r from-accent-pink to-accent-purple text-white hover:from-accent-pink/80 hover:to-accent-purple/80 active:from-accent-pink/90 active:to-accent-purple/90 shadow-md hover:shadow-lg focus:shadow-lg hover:scale-105 transition-all duration-200 light:shadow-lg light:hover:shadow-xl",
        cyber: "bg-gradient-to-r from-accent-cyan to-accent-purple text-white hover:from-accent-cyan/80 hover:to-accent-purple/80 active:from-accent-cyan/90 active:to-accent-purple/90 shadow-md hover:shadow-lg focus:shadow-lg hover:scale-105 transition-all duration-200 light:text-white light:shadow-lg light:hover:shadow-xl",
        gold: "bg-gradient-to-r from-accent-gold to-accent-cyan text-white hover:from-accent-gold/80 hover:to-accent-cyan/80 active:from-accent-gold/90 active:to-accent-cyan/90 shadow-md hover:shadow-lg focus:shadow-lg hover:scale-105 transition-all duration-200 light:text-white light:shadow-lg light:hover:shadow-xl",
        // Modern glass variants for unified design
        modern: "modern-glass border border-border/30 hover:border-accent-cyan/50 text-foreground hover:text-accent-cyan backdrop-blur-sm hover:shadow-md transition-all duration-200",
        "modern-primary": "bg-accent-cyan text-white hover:bg-accent-cyan/90 shadow-lg hover:shadow-xl hover:shadow-accent-cyan/20 transition-all duration-200",
        "modern-secondary": "bg-accent-pink text-white hover:bg-accent-pink/90 shadow-lg hover:shadow-xl hover:shadow-accent-pink/20 transition-all duration-200",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm min-h-[40px]",
        sm: "h-8 rounded-md px-3 text-xs min-h-[32px]",
        lg: "h-12 rounded-md px-8 text-base min-h-[48px]",
        icon: "h-10 w-10 min-h-[40px] min-w-[40px]",
        xs: "h-7 rounded-md px-2 text-xs min-h-[28px]",
        compact: "h-8 px-3 text-sm min-h-[32px]",
        // Accessibility-focused sizes
        touch: "h-11 px-4 py-2 text-sm min-h-[44px]", // WCAG AA touch target
        "touch-icon": "h-11 w-11 min-h-[44px] min-w-[44px]", // WCAG AA touch target for icons
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button({ className, variant, size, asChild = false, ...props }, ref) {
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