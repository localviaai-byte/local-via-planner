import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary CTA - Terracotta, warm and inviting
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-soft rounded-2xl",
        // Destructive
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-2xl",
        // Outline - subtle border, no harsh lines
        outline: "border border-border bg-card hover:bg-secondary hover:border-primary/30 rounded-2xl",
        // Secondary - muted background
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-2xl",
        // Ghost - minimal
        ghost: "hover:bg-secondary hover:text-foreground rounded-xl",
        // Link style
        link: "text-primary underline-offset-4 hover:underline",
        // Hero CTA - Terracotta gradient, elevated
        hero: "bg-gradient-hero text-primary-foreground shadow-card hover:shadow-elevated rounded-2xl",
        // Wine variant for night/social features
        wine: "bg-wine text-white hover:bg-wine/90 shadow-soft rounded-2xl",
      },
      size: {
        default: "h-12 px-6 py-3",
        sm: "h-10 rounded-xl px-4 text-sm",
        lg: "h-14 rounded-2xl px-8 text-base",
        icon: "h-11 w-11 rounded-xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
