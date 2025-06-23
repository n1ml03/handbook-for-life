import { cva } from "class-variance-authority"

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/85 hover:shadow-xs light:shadow-sm light:hover:shadow-md light:border light:border-primary/20",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-xs light:shadow-sm light:hover:shadow-md light:border light:border-secondary/30",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/85 hover:shadow-xs light:shadow-sm light:hover:shadow-md",
        outline: "text-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-xs light:border-border light:hover:bg-accent/60 light:hover:shadow-sm",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
) 