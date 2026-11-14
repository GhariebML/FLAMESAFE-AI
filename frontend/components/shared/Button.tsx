import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "flame" | "cyan";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  children: React.ReactNode;
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps["variant"]>, string> = {
  primary:
    "keep-white bg-brand-blue hover:bg-brand-intelligent text-white shadow-sm hover:shadow-md border border-transparent",
  cyan:
    "keep-white bg-brand-cyan hover:bg-brand-intelligent text-white shadow-sm hover:shadow-md border border-transparent",
  secondary:
    "bg-space-900 hover:bg-brand-soft dark:hover:bg-space-800 text-fg-primary border border-space-800 hover:border-brand-intelligent/50 shadow-sm",
  outline:
    "bg-transparent hover:bg-brand-soft/70 dark:hover:bg-space-800/80 text-brand-blue dark:text-brand-light-cyan border border-brand-blue/35 dark:border-brand-light-cyan/35",
  ghost:
    "bg-transparent hover:bg-space-800/60 text-fg-secondary hover:text-fg-primary border border-transparent",
  danger:
    "keep-white bg-brand-error hover:bg-red-700 text-white border border-transparent shadow-sm",
  flame:
    "keep-white bg-gradient-to-r from-brand-flame-orange to-brand-flame-red hover:brightness-105 text-white border border-transparent shadow-sm",
};

const SIZE_CLASSES: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "px-3 py-1.5 text-xs rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm rounded-xl gap-2",
  lg: "px-5 py-2.5 text-sm sm:text-base rounded-xl gap-2",
  icon: "p-2 rounded-xl",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  className,
  children,
  type = "button",
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-intelligent disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.99]",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin shrink-0" />}
      {children}
    </button>
  );
};

export const PrimaryButton: React.FC<Omit<ButtonProps, "variant">> = (props) => (
  <Button variant="primary" {...props} />
);

export const SecondaryButton: React.FC<Omit<ButtonProps, "variant">> = (props) => (
  <Button variant="secondary" {...props} />
);

export interface IconButtonProps extends Omit<ButtonProps, "size"> {
  label: string;
}

export const IconButton: React.FC<IconButtonProps> = ({
  label,
  variant = "ghost",
  className,
  children,
  ...props
}) => (
  <Button
    variant={variant}
    size="icon"
    aria-label={label}
    title={label}
    className={cn("h-9 w-9 shrink-0", className)}
    {...props}
  >
    {children}
  </Button>
);
