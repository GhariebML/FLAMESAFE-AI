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
      container: "border-cyan-500/35 bg-cyan-500/10 text-cyan-900 dark:text-cyan-200",
      badge: "text-cyan-700 dark:text-cyan-400",
      Icon: Info,
    },
    extrapolation: {
      container: "border-amber-500/35 bg-amber-500/10 text-amber-900 dark:text-amber-200",
      badge: "text-amber-700 dark:text-amber-400",
      Icon: ShieldAlert,
    },
    warning: {
      container: "border-orange-500/40 bg-orange-500/10 text-orange-900 dark:text-orange-200",
      badge: "text-orange-700 dark:text-orange-400",
      Icon: AlertTriangle,
    },
  }[variant];

  const { Icon } = styles;

  return (
    <div
      role="status"
      className={`rounded-xl border p-3.5 flex items-start gap-3 ${styles.container}`}
    >
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${styles.badge}`} />
      <div className="space-y-0.5 text-xs">
        <div className={`font-semibold uppercase tracking-wider ${styles.badge}`}>
          {title}
        </div>
        <p className="text-fg-secondary leading-relaxed">{message}</p>
      </div>
    </div>
  );
};
