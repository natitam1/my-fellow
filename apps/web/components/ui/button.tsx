"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold overflow-hidden transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 cursor-pointer select-none",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_4px_14px_rgba(255,103,25,0.35)] hover:shadow-[0_6px_20px_rgba(255,103,25,0.45)] hover:bg-primary/95 active:scale-[0.98]",
        destructive:
          "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]",
        outline:
          "border border-border/80 bg-background text-foreground shadow-xs hover:bg-accent/60 hover:text-accent-foreground active:scale-[0.98]",
        secondary:
          "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 active:scale-[0.98]",
        ghost: "hover:bg-accent/70 hover:text-accent-foreground active:scale-[0.98]",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-6 py-2.5 text-sm",
        sm: "h-9 rounded-full px-4 text-xs",
        lg: "h-13 rounded-full px-8 text-base",
        icon: "h-10 w-10 rounded-full p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

interface Ripple {
  x: number;
  y: number;
  size: number;
  id: number;
}

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, onClick, children, ...props }, ref) => {
    const [ripples, setRipples] = React.useState<Ripple[]>([]);

    const createRipple = (event: React.MouseEvent<HTMLButtonElement>) => {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      const diameter = Math.max(rect.width, rect.height) * 1.5;
      const radius = diameter / 2;

      const newRipple: Ripple = {
        x: event.clientX - rect.left - radius,
        y: event.clientY - rect.top - radius,
        size: diameter,
        id: Date.now() + Math.random(),
      };

      setRipples((prev) => [...prev, newRipple]);
    };

    const handleAnimationEnd = (id: number) => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    };

    if (asChild) {
      const Comp = Slot;
      return (
        <Comp
          className={cn(buttonVariants({ variant, size, className }))}
          ref={ref}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, className }))}
        onClick={(e) => {
          createRipple(e);
          onClick?.(e);
        }}
        {...props}
      >
        {children}
        {/* Material Ripple effect container */}
        <span className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              onAnimationEnd={() => handleAnimationEnd(ripple.id)}
              className="absolute rounded-full bg-white/30 dark:bg-white/20 animate-ping opacity-75 duration-700"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: ripple.size,
                height: ripple.size,
                animationDuration: "600ms",
                animationIterationCount: 1,
                transformOrigin: "center center",
              }}
            />
          ))}
        </span>
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
