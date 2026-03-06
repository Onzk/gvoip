import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  variant?: "default" | "success" | "destructive" | "warning" | "primary";
  className?: string;
}

const variantStyles = {
  default: "border-border",
  success: "border-success/30",
  destructive: "border-destructive/30",
  warning: "border-warning/30",
  primary: "border-primary/30",
};

const iconVariant = {
  default: "text-muted-foreground",
  success: "text-success",
  destructive: "text-destructive",
  warning: "text-warning",
  primary: "text-primary",
};

export const KPICard = ({ title, value, subtitle, icon: Icon, variant = "default", className }: KPICardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("noc-card p-4 border", variantStyles[variant], className)}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold font-mono tracking-tight text-foreground">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
        <div className={cn("p-2 rounded-lg bg-muted/50", iconVariant[variant])}>
          <Icon size={20} />
        </div>
      </div>
    </motion.div>
  );
};
