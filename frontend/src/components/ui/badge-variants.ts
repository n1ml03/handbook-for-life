import { cva } from "class-variance-authority"

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/85 hover:shadow-xs light:shadow-md light:hover:shadow-lg light:border light:border-primary/40",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80 hover:shadow-xs light:shadow-md light:hover:shadow-lg light:border light:border-secondary/50",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/85 hover:shadow-xs light:shadow-md light:hover:shadow-lg light:border light:border-destructive/30",
        outline: "text-foreground hover:bg-accent hover:text-accent-foreground hover:shadow-xs light:border-border/80 light:hover:bg-accent/70 light:hover:shadow-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
) 