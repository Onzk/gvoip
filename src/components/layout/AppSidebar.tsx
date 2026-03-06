import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutDashboard,
  Network,
  Phone,
  PhoneCall,
  Activity,
  Bell,
  Shield,
  Radio,
  Globe,
  Server,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const AppSidebar = () => {
  const location = useLocation();
  const { isAdmin, user, signOut, canView } = useAuth();

  const navItems = [
    { to: "/", icon: LayoutDashboard, label: "Dashboard", show: isAdmin || canView("dashboard") },
    { to: "/countries", icon: Globe, label: "Pays", show: canView("dashboard_country") },
    { to: "/ipbx", icon: Server, label: "IPBX", show: canView("settings") },
    { to: "/sip-trunks", icon: Network, label: "SIP Trunks", show: canView("sip_trunks") },
    { to: "/extensions", icon: Phone, label: "Extensions", show: canView("extensions") },
    { to: "/calls", icon: PhoneCall, label: "Appels", show: canView("cdr") },
    { to: "/quality", icon: Activity, label: "Qualite VoIP", show: canView("quality") },
    { to: "/alerts", icon: Bell, label: "Alertes", show: canView("alerts") },
    { to: "/users", icon: Users, label: "Utilisateurs", show: isAdmin },
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-60 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className=" rounded-xl bg-transparent">
<img src="/GVOIP.png" alt="" className="w-12 h-12 mx-auto"/>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-wide">G<span className="text-primary">VoIP</span></h1>

          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-thin">
        {navItems.filter((i) => i.show).map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-200",
                isActive
                  ? "bg-primary/10 text-primary shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-sidebar-border space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-glow" />
          <span className="text-[10px] text-muted-foreground">Système opérationnel</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={11} className="text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">
              {user?.email || "—"}
            </span>
          </div>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={signOut}>
            <LogOut size={12} />
          </Button>
        </div>
      </div>
    </aside>
  );
};

export { AppSidebar };
