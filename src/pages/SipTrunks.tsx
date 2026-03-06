import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { StatusBadge } from "@/components/noc/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Network, Plus, Pencil, Trash2, Clock, AlertTriangle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface SipTrunk {
  id: string;
  ipbx_id: string;
  remote_ipbx_id: string | null;
  name: string;
  status: string;
  provider: string | null;
  ip_address: string | null;
  local_ip: string | null;
  remote_ip: string | null;
  channels: number | null;
  max_channels: number | null;
  latency: number | null;
  uptime: number | null;
  failed_attempts: number | null;
  last_check: string | null;
  ipbx?: { name: string };
  remote_ipbx?: { name: string };
}

interface IPBX {
  id: string;
  name: string;
}

const SipTrunks = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [trunks, setTrunks] = useState<SipTrunk[]>([]);
  const [ipbxList, setIpbxList] = useState<IPBX[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SipTrunk | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "", ipbx_id: "", remote_ipbx_id: "", provider: "", local_ip: "", remote_ip: "",
    channels: "0", max_channels: "30", status: "down",
  });

  const fetchData = async () => {
    const [trunkRes, ipbxRes] = await Promise.all([
      supabase.from("sip_trunks")
        .select("*, ipbx:ipbx!sip_trunks_ipbx_id_fkey(name), remote_ipbx:ipbx!sip_trunks_remote_ipbx_id_fkey(name)")
        .order("name"),
      supabase.from("ipbx").select("id, name").order("name"),
    ]);
    if (trunkRes.data) setTrunks(trunkRes.data as unknown as SipTrunk[]);
    if (ipbxRes.data) setIpbxList(ipbxRes.data as IPBX[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ name: "", ipbx_id: "", remote_ipbx_id: "", provider: "", local_ip: "", remote_ip: "", channels: "0", max_channels: "30", status: "down" });
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.name || !form.ipbx_id) {
      toast({ title: "Champs requis", description: "Nom et IPBX sont obligatoires.", variant: "destructive" });
      return;
    }
    const payload = {
      name: form.name,
      ipbx_id: form.ipbx_id,
      remote_ipbx_id: form.remote_ipbx_id || null,
      provider: form.provider || null,
      ip_address: form.remote_ip || null,
      local_ip: form.local_ip || null,
      remote_ip: form.remote_ip || null,
      channels: parseInt(form.channels) || 0,
      max_channels: parseInt(form.max_channels) || 30,
      status: form.status,
    };
    if (editing) {
      const { error } = await supabase.from("sip_trunks").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Trunk modifié" });
    } else {
      const { error } = await supabase.from("sip_trunks").insert(payload);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Trunk créé" });
    }
    setOpen(false);
    resetForm();
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("sip_trunks").delete().eq("id", id);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Trunk supprimé" });
    setDeleteConfirm(null);
    fetchData();
  };

  const openEdit = (trunk: SipTrunk) => {
    setEditing(trunk);
    setForm({
      name: trunk.name,
      ipbx_id: trunk.ipbx_id,
      remote_ipbx_id: trunk.remote_ipbx_id || "",
      provider: trunk.provider || "",
      local_ip: trunk.local_ip || trunk.ip_address || "",
      remote_ip: trunk.remote_ip || "",
      channels: String(trunk.channels ?? 0),
      max_channels: String(trunk.max_channels ?? 30),
      status: trunk.status,
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">SIP Trunks</h1>
          <p className="text-sm text-muted-foreground">Gestion des trunks SIP et connectivité opérateurs / inter-IPBX</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => { setLoading(true); fetchData(); }}>
            <RefreshCw size={14} className="mr-1" /> Sync
          </Button>
          {isAdmin && (
            <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) resetForm(); }}>
              <DialogTrigger asChild>
                <Button size="sm"><Plus size={14} className="mr-1" /> Ajouter</Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editing ? "Modifier le trunk" : "Nouveau SIP Trunk"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div>
                    <Label>Nom *</Label>
                    <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Trunk-Orange-01" className="mt-1" />
                  </div>
                  <div>
                    <Label>IPBX local *</Label>
                    <Select value={form.ipbx_id} onValueChange={(v) => setForm({ ...form, ipbx_id: v })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner l'IPBX source" /></SelectTrigger>
                      <SelectContent>{ipbxList.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>IPBX distant (inter-IPBX)</Label>
                    <Select value={form.remote_ipbx_id || "none"} onValueChange={(v) => setForm({ ...form, remote_ipbx_id: v === "none" ? "" : v })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Optionnel — trunk opérateur" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Aucun (opérateur)</SelectItem>
                        {ipbxList.filter(i => i.id !== form.ipbx_id).map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Fournisseur</Label>
                    <Input value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} placeholder="Orange, OVH..." className="mt-1" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>IP signalisation locale</Label>
                      <Input value={form.local_ip} onChange={(e) => setForm({ ...form, local_ip: e.target.value })} placeholder="10.0.0.1" className="mt-1" />
                    </div>
                    <div>
                      <Label>IP signalisation distante</Label>
                      <Input value={form.remote_ip} onChange={(e) => setForm({ ...form, remote_ip: e.target.value })} placeholder="10.0.0.2" className="mt-1" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Canaux actifs</Label>
                      <Input type="number" value={form.channels} onChange={(e) => setForm({ ...form, channels: e.target.value })} className="mt-1" />
                    </div>
                    <div>
                      <Label>Canaux max</Label>
                      <Input type="number" value={form.max_channels} onChange={(e) => setForm({ ...form, max_channels: e.target.value })} className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label>Statut</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="up">UP</SelectItem>
                        <SelectItem value="down">DOWN</SelectItem>
                        <SelectItem value="degraded">Dégradé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleSave} className="w-full">{editing ? "Modifier" : "Créer"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <p className="text-muted-foreground text-sm text-center py-8">Chargement...</p>
        ) : trunks.length === 0 ? (
          <div className="noc-card p-8 text-center border border-border">
            <Network className="mx-auto text-muted-foreground mb-2" size={32} />
            <p className="text-muted-foreground">Aucun SIP Trunk configuré</p>
          </div>
        ) : (
          trunks.map((trunk, i) => (
            <motion.div
              key={trunk.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`noc-card border p-5 ${
                trunk.status === "down" ? "border-destructive/40 noc-glow-destructive" :
                trunk.status === "degraded" ? "border-warning/40 noc-glow-warning" :
                "border-border"
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    trunk.status === "up" ? "bg-success/10" :
                    trunk.status === "down" ? "bg-destructive/10" : "bg-warning/10"
                  }`}>
                    <Network size={22} className={
                      trunk.status === "up" ? "text-success" :
                      trunk.status === "down" ? "text-destructive" : "text-warning"
                    } />
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-mono font-bold text-foreground">{trunk.name}</h3>
                      <StatusBadge status={trunk.status as any} />
                      {trunk.remote_ipbx?.name && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-mono">Inter-IPBX</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {trunk.provider || "—"} · {trunk.ipbx?.name || "—"}
                      {trunk.remote_ipbx?.name ? ` ↔ ${trunk.remote_ipbx.name}` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {trunk.local_ip || "—"} → {trunk.remote_ip || "—"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Latence</p>
                      <p className={`text-lg font-mono font-bold ${
                        !trunk.latency ? "text-muted-foreground" :
                        trunk.latency > 50 ? "text-warning" : "text-success"
                      }`}>{trunk.latency ? `${trunk.latency}ms` : "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Uptime</p>
                      <p className={`text-lg font-mono font-bold ${
                        (trunk.uptime ?? 0) >= 99.9 ? "text-success" :
                        (trunk.uptime ?? 0) >= 99 ? "text-warning" : "text-destructive"
                      }`}>{trunk.uptime ?? 0}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Canaux</p>
                      <p className="text-lg font-mono font-bold text-foreground">
                        {trunk.channels ?? 0}<span className="text-muted-foreground text-sm">/{trunk.max_channels ?? 30}</span>
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase">Échecs</p>
                      <p className={`text-lg font-mono font-bold ${
                        (trunk.failed_attempts ?? 0) > 10 ? "text-destructive" :
                        (trunk.failed_attempts ?? 0) > 0 ? "text-warning" : "text-success"
                      }`}>{trunk.failed_attempts ?? 0}</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <div className="flex flex-col gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(trunk)}>
                        <Pencil size={13} />
                      </Button>
                      {deleteConfirm === trunk.id ? (
                        <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={() => handleDelete(trunk.id)}>
                          OK
                        </Button>
                      ) : (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteConfirm(trunk.id)}>
                          <Trash2 size={13} />
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock size={12} /> Dernier check: {trunk.last_check || "—"}</span>
                {(trunk.failed_attempts ?? 0) > 10 && (
                  <span className="flex items-center gap-1 text-destructive"><AlertTriangle size={12} /> Vérification nécessaire</span>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default SipTrunks;
