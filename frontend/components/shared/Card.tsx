import React from "react";
import { cn } from "@/lib/utils/cn";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  interactive?: boolean;
  float?: boolean;
  floatDelay?: 0 | 1 | 2 | 3;
  tone?: "default" | "soft" | "accent";
}

const FLOAT_DELAY_CLASS: Record<0 | 1 | 2 | 3, string> = {
  0: "zero-g-delay-0",
  1: "zero-g-delay-1",
  2: "zero-g-delay-2",
  3: "zero-g-delay-3",
};

export const Card: React.FC<CardProps> = ({
  children,
  className,
  glow = false,
  interactive = false,
  float = false,
  floatDelay = 0,
  tone = "default",
  ...props
}) => {
  const toneStyles = {
    default:
      "bg-[#081226]/90 dark:bg-[#081226]/90 backdrop-blur-md border-[#1E3A6E]/80 shadow-[0_12px_36px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(57,185,235,0.14)]",
    soft:
      "bg-[#0A162E]/85 dark:bg-[#0A162E]/85 backdrop-blur-md border-[#1E3A6E]/70 shadow-[0_10px_30px_rgba(0,0,0,0.4)]",
    accent:
      "bg-gradient-to-br from-[#0B1938]/95 via-[#081226]/90 to-[#050B18]/95 backdrop-blur-md border-[#39B9EB]/40 shadow-[0_14px_40px_rgba(0,0,0,0.5)]",
  }[tone];

  return (
    <div
      className={cn(
        "min-w-0 rounded-2xl border p-5 sm:p-6 shadow-panel transition-all duration-300 ease-out card-space-sheen",
        "hover:border-brand-intelligent/45 dark:hover:border-brand-cyan/45 hover:shadow-elevated hover:-translate-y-0.5",
        toneStyles,
        glow && "border-brand-intelligent/35 dark:border-brand-cyan/35 shadow-elevated",
        interactive &&
          "hover:border-brand-intelligent/60 dark:hover:border-brand-cyan/60 hover:-translate-y-1 cursor-pointer",
        float && cn("animate-zero-g", FLOAT_DELAY_CLASS[floatDelay]),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const ScientificCard: React.FC<CardProps> = (props) => <Card {...props} />;
