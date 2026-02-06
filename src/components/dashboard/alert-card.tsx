import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info, CheckCircle } from "lucide-react";

interface AlertCardProps {
  type: "danger" | "warning" | "info" | "success";
  title: string;
  description?: string;
  className?: string;
}

const alertStyles = {
  danger: {
    bg: "bg-destructive/5 border-destructive/20",
    icon: AlertCircle,
    iconColor: "text-destructive",
    dot: "bg-destructive",
  },
  warning: {
    bg: "bg-warning/5 border-warning/20",
    icon: AlertTriangle,
    iconColor: "text-warning",
    dot: "bg-warning",
  },
  info: {
    bg: "bg-primary/5 border-primary/20",
    icon: Info,
    iconColor: "text-primary",
    dot: "bg-primary",
  },
  success: {
    bg: "bg-success/5 border-success/20",
    icon: CheckCircle,
    iconColor: "text-success",
    dot: "bg-success",
  },
};

export function AlertCard({ type, title, description, className }: AlertCardProps) {
  const styles = alertStyles[type];
  const Icon = styles.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border transition-all duration-200 hover:shadow-sm",
        styles.bg,
        className
      )}
    >
      <div className="relative shrink-0">
        <Icon className={cn("h-5 w-5", styles.iconColor)} />
        <span className={cn("absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full animate-pulse", styles.dot)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );
}
