import React from "react";
import { cn } from "@/lib/utils";

interface LiquidGlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glowIntensity?: "sm" | "md" | "lg";
  shadowIntensity?: "sm" | "md" | "lg";
  blurIntensity?: "sm" | "md" | "lg";
  borderRadius?: string;
  draggable?: boolean;
}

export const LiquidGlassCard = React.forwardRef<HTMLDivElement, LiquidGlassCardProps>(
  ({ className, glowIntensity = "md", shadowIntensity = "md", blurIntensity = "md", borderRadius = "16px", draggable, children, ...props }, ref) => {
    
    const blurClasses = {
      sm: "backdrop-blur-md",
      md: "backdrop-blur-xl",
      lg: "backdrop-blur-2xl"
    };

    const shadowClasses = {
      sm: "shadow-[0_4px_16px_0_rgba(0,0,0,0.05)]",
      md: "shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]",
      lg: "shadow-[0_12px_48px_0_rgba(0,0,0,0.2)]"
    };

    const glowClasses = {
      sm: "after:shadow-[inset_0_0_10px_rgba(255,255,255,0.1)]",
      md: "after:shadow-[inset_0_0_20px_rgba(255,255,255,0.2)]",
      lg: "after:shadow-[inset_0_0_30px_rgba(255,255,255,0.3)]"
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative overflow-hidden border border-white/20 dark:border-white/10 bg-white/10 dark:bg-black/20",
          blurClasses[blurIntensity],
          shadowClasses[shadowIntensity],
          "after:absolute after:inset-0 after:rounded-inherit after:pointer-events-none",
          glowClasses[glowIntensity],
          className
        )}
        style={{ borderRadius }}
        draggable={draggable}
        {...props}
      >
        {children}
      </div>
    );
  }
);
LiquidGlassCard.displayName = "LiquidGlassCard";
