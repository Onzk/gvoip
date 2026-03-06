import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "up" | "down" | "degraded" | "registered" | "unregistered" | "ringing" | "busy" | "connected" | "failed" | "critical" | "warning" | "info";
  label?: string;
  pulse?: boolean;
  className?: string;
}

const statusConfig: Record<string, { bg: string; text: string; dot: string }> = {
  up: { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
  registered: { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
  connected: { bg: "bg-success/10", text: "text-success", dot: "bg-success" },
  down: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive" },
  unregistered: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive" },
  failed: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive" },
  critical: { bg: "bg-destructive/10", text: "text-destructive", dot: "bg-destructive" },
  degraded: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning" },
  warning: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning" },
  ringing: { bg: "bg-info/10", text: "text-info", dot: "bg-info" },
  busy: { bg: "bg-warning/10", text: "text-warning", dot: "bg-warning" },
  info: { bg: "bg-info/10", text: "text-info", dot: "bg-info" },
};

const statusLabels: Record<string, string> = {
  up: "UP",
  down: "DOWN",
  degraded: "DÉGRADÉ",
  registered: "Enregistré",
  unregistered: "Hors ligne",
  ringing: "Sonne",
  busy: "Occupé",
  connected: "Connecté",
  failed: "Échoué",
  critical: "Critique",
  warning: "Warning",
  info: "Info",
};

export const StatusBadge = ({ status, label, pulse = true, className }: StatusBadgeProps) => {
  const config = statusConfig[status] || statusConfig.info;
  const displayLabel = label || statusLabels[status] || status;

  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold font-mono uppercase tracking-wider", config.bg, config.text, className)}>
      <span className={cn("w-2 h-2 rounded-full", config.dot, pulse && (status === "down" || status === "critical") && "animate-pulse-glow")} />
      {displayLabel}
    </span>
  );
};
