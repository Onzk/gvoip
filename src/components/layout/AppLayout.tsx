import { AppSidebar } from "./AppSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout = ({ children }: AppLayoutProps) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background noc-grid-bg">
      <AppSidebar />
      <div className="ml-60">
        {/* Top bar */}
        <header className="sticky top-0 z-30 h-11 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-end px-6 gap-4">
          <ThemeToggle />
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock size={13} />
            <span className="text-[11px] font-mono">
              {time.toLocaleDateString("fr-FR")} {time.toLocaleTimeString("fr-FR")}
            </span>
          </div>
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-glow" />
        </header>

        {/* Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
