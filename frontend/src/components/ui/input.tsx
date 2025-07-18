import { forwardRef, type InputHTMLAttributes } from "react"

import { cn } from "@/services/utils"

export type InputProps = InputHTMLAttributes<HTMLInputElement>

const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input({ className, type, ...props }, ref) {
    return (
      <input
        type={type}
        className={cn(
<<<<<<< Updated upstream
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200",
          // Light mode enhancements
          "light:bg-input light:border-border light:placeholder:text-muted-foreground/70 light:focus-visible:border-ring light:hover:border-border/80 light:shadow-sm light:focus-visible:shadow-md",
=======
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1.5 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors duration-200",
          // Light mode enhancements - Flat design
          "light:bg-input light:border-border/80 light:placeholder:text-muted-foreground/70 light:focus-visible:border-ring light:hover:border-border",
>>>>>>> Stashed changes
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input } 