import { useEffect, useState } from "react";
import { useAllowedIpbx } from "@/hooks/useAllowedIpbx";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { StatusBadge } from "@/components/noc/StatusBadge";
import { Bell, CheckCircle, Search, RefreshCw, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  source: string;
  ipbx_id: string | null;
  acknowledged: boolean;
  acknowledged_at: string | null;
  created_at: string;
}

const Alerts = () => {
  const { applyFilter } = useAllowedIpbx();
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "info">("all");
  const [showAck, setShowAck] = useState(false);
  const [search, setSearch] = useState("");

  const fetchAlerts = async () => {
    setLoading(true);
    let query = applyFilter(supabase.from("alerts").select("*")).order("created_at", { ascending: false }).limit(200);
    if (!showAck) query = query.eq("acknowledged", false);
    if (filter !== "all") query = query.eq("type", filter);
    const { data } = await query;
    if (data) setAlerts(data as Alert[]);
    setLoading(false);
  };

  useEffect(() => { fetchAlerts(); }, [filter, showAck]);

  // Realtime
  useEffect(() => {
    const channel = supabase.channel("alerts-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "alerts" }, () => fetchAlerts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [filter, showAck]);

  const acknowledge = async (id: string) => {
    await supabase.from("alerts").update({
      acknowledged: true,
      acknowledged_by: user?.id,
      acknowledged_at: new Date().toISOString(),
    }).eq("id", id);
    toast({ title: "Alerte acquittee" });
    fetchAlerts();
  };

  const acknowledgeAll = async () => {
    const unacked = alerts.filter(a => !a.acknowledged).map(a => a.id);
    if (unacked.length === 0) return;
    await supabase.from("alerts").update({
      acknowledged: true,
      acknowledged_by: user?.id,
      acknowledged_at: new Date().toISOString(),
    }).in("id", unacked);
    toast({ title: `${unacked.length} alertes acquittees` });
    fetchAlerts();
  };

  const deleteAlert = async (id: string) => {
    await supabase.from("alerts").delete().eq("id", id);
    fetchAlerts();
  };

  const displayed = alerts.filter((a) => {
    const q = search.toLowerCase();
    return !q || a.title.toLowerCase().includes(q) || a.message.toLowerCase().includes(q) || a.source.toLowerCase().includes(q);
  });

  const unackedCount = alerts.filter(a => !a.acknowledged).length;

  const formatDate = (d: string) => new Date(d).toLocaleString("fr-FR", {
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit"
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-foreground">Journal des alertes</h1>
          <p className="text-sm text-muted-foreground">Incidents et notifications du reseau VoIP</p>
        </div>
        <div className="flex items-center gap-2">
          {unackedCount > 0 && (
            <Button variant="outline" size="sm" onClick={acknowledgeAll}>
              <CheckCircle size={13} className="mr-1 text-success" /> Tout acquitter ({unackedCount})
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={fetchAlerts} disabled={loading}>
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
          </Button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive font-mono text-sm font-semibold">
            <Bell size={16} />
            {unackedCount} non acquittees
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {(["all", "critical", "warning", "info"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              filter === f ? "bg-primary/20 text-primary" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
            }`}>
            {f === "all" ? "Toutes" : f}
          </button>
        ))}
        <button onClick={() => setShowAck(!showAck)}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
            showAck ? "bg-success/20 text-success" : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
          }`}>
          {showAck ? "Avec acquittees" : "Sans acquittees"}
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-9 h-9" />
      </div>

      <div className="space-y-2">
        {displayed.length === 0 ? (
          <div className="noc-card p-8 text-center border border-border">
            <Bell className="mx-auto text-muted-foreground mb-2" size={32} />
            <p className="text-muted-foreground">Aucune alerte</p>
          </div>
        ) : (
          displayed.map((alert, i) => (
            <motion.div key={alert.id}
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}
              className={`noc-card border p-4 flex items-start gap-4 ${
                !alert.acknowledged && alert.type === "critical" ? "border-destructive/40" :
                !alert.acknowledged && alert.type === "warning" ? "border-warning/30" : "border-border"
              } ${alert.acknowledged ? "opacity-60" : ""}`}>
              <StatusBadge status={alert.type} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-foreground">{alert.title}</h3>
                  {alert.acknowledged && <CheckCircle size={14} className="text-success" />}
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">{alert.message}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                  <span className="font-mono">{formatDate(alert.created_at)}</span>
                  <span>Source: {alert.source}</span>
                  {alert.acknowledged_at && <span>Acquittee: {formatDate(alert.acknowledged_at)}</span>}
                </div>
              </div>
              <div className="flex gap-1">
                {!alert.acknowledged && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-success" title="Acquitter"
                    onClick={() => acknowledge(alert.id)}>
                    <CheckCircle size={14} />
                  </Button>
                )}
                {isAdmin && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" title="Supprimer"
                    onClick={() => deleteAlert(alert.id)}>
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Alerts;
