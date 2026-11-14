import React from "react";
import { AlertTriangle, Info, ShieldAlert } from "lucide-react";

interface UncertaintyBannerProps {
  variant?: "demo" | "extrapolation" | "warning";
  title: string;
  message: string;
}

export const UncertaintyBanner: React.FC<UncertaintyBannerProps> = ({
  variant = "extrapolation",
  title,
  message,
}) => {
  const styles = {
    demo: {
      container:
        "border-brand-cyan/35 bg-brand-soft dark:bg-brand-cyan/10 text-brand-navy dark:text-brand-light-cyan",
      badge: "text-brand-blue dark:text-brand-light-cyan",
      Icon: Info,
    },
    extrapolation: {
      container:
        "border-brand-warning/35 bg-amber-500/10 text-amber-950 dark:text-amber-200",
      badge: "text-amber-800 dark:text-brand-flame-yellow",
      Icon: ShieldAlert,
    },
    warning: {
      container:
        "border-brand-flame-orange/35 bg-brand-flame-orange/10 text-amber-950 dark:text-orange-200",
      badge: "text-brand-flame-red dark:text-brand-flame-yellow",
      Icon: AlertTriangle,
    },
  }[variant];

  const { Icon } = styles;

  return (
    <div
      role="status"
      className={`rounded-2xl border p-4 flex items-start gap-3 ${styles.container}`}
    >
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${styles.badge}`} />
      <div className="space-y-0.5 text-xs">
        <div className={`font-bold uppercase tracking-wider ${styles.badge}`}>
          {title}
        </div>
        <p className="text-fg-secondary leading-relaxed">{message}</p>
      </div>
    </div>
  );
};
