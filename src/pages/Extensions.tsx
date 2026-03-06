import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { StatusBadge } from "@/components/noc/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Phone, Plus, Pencil, Trash2, Monitor, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Extension {
  id: string;
  ipbx_id: string;
  number: string;
  name: string;
  status: string;
  ip_address: string | null;
  user_agent: string | null;
  last_registration: string | null;
  calls_today: number | null;
  ipbx?: { name: string };
}

interface IPBX {
  id: string;
  name: string;
}

const Extensions = () => {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [ipbxList, setIpbxList] = useState<IPBX[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Extension | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({
    number: "", name: "", ipbx_id: "", status: "unregistered",
    ip_address: "", user_agent: "",
  });

  const fetchData = async () => {
    const [extRes, ipbxRes] = await Promise.all([
      supabase.from("extensions").select("*, ipbx(name)").order("number"),
      supabase.from("ipbx").select("id, name").order("name"),
    ]);
    if (extRes.data) setExtensions(extRes.data as Extension[]);
    if (ipbxRes.data) setIpbxList(ipbxRes.data as IPBX[]);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setForm({ number: "", name: "", ipbx_id: "", status: "unregistered", ip_address: "", user_agent: "" });
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.number || !form.name || !form.ipbx_id) {
      toast({ title: "Champs requis", description: "Numéro, nom et IPBX sont obligatoires.", variant: "destructive" });
      return;
    }
    const payload = {
      number: form.number,
      name: form.name,
      ipbx_id: form.ipbx_id,
      status: form.status,
      ip_address: form.ip_address || null,
      user_agent: form.user_agent || null,
    };
    if (editing) {
      const { error } = await supabase.from("extensions").update(payload).eq("id", editing.id);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Extension modifiée" });
    } else {
      const { error } = await supabase.from("extensions").insert(payload);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Extension créée" });
    }
    setOpen(false);
    resetForm();
    fetchData();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("extensions").delete().eq("id", id);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Extension supprimée" });
    setDeleteConfirm(null);
    fetchData();
  };

  const openEdit = (ext: Extension) => {
    setEditing(ext);
    setForm({
      number: ext.number,
      name: ext.name,
      ipbx_id: ext.ipbx_id,
      status: ext.status,
      ip_address: ext.ip_address || "",
      user_agent: ext.user_agent || "",
    });
    setOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Extensions</h1>
          <p className="text-sm text-muted-foreground">Gestion des postes téléphoniques SIP</p>
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
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editing ? "Modifier l'extension" : "Nouvelle extension"}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-2">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Numéro *</Label>
                      <Input value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="1001" className="mt-1" />
                    </div>
                    <div>
                      <Label>Nom *</Label>
                      <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jean Dupont" className="mt-1" />
                    </div>
                  </div>
                  <div>
                    <Label>IPBX *</Label>
                    <Select value={form.ipbx_id} onValueChange={(v) => setForm({ ...form, ipbx_id: v })}>
                      <SelectTrigger className="mt-1"><SelectValue placeholder="Sélectionner un IPBX" /></SelectTrigger>
                      <SelectContent>{ipbxList.map((i) => <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Statut</Label>
                    <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="registered">Enregistré</SelectItem>
                        <SelectItem value="unregistered">Hors ligne</SelectItem>
                        <SelectItem value="ringing">Sonne</SelectItem>
                        <SelectItem value="busy">Occupé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Adresse IP</Label>
                      <Input value={form.ip_address} onChange={(e) => setForm({ ...form, ip_address: e.target.value })} placeholder="192.168.1.50" className="mt-1" />
                    </div>
                    <div>
                      <Label>User Agent</Label>
                      <Input value={form.user_agent} onChange={(e) => setForm({ ...form, user_agent: e.target.value })} placeholder="Yealink T46U" className="mt-1" />
                    </div>
                  </div>
                  <Button onClick={handleSave} className="w-full">{editing ? "Modifier" : "Créer"}</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      <div className="noc-card border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Extension</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Utilisateur</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">IPBX</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Statut</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">IP</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">User Agent</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Appels</th>
                {isAdmin && <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={isAdmin ? 8 : 7} className="px-4 py-8 text-center text-muted-foreground">Chargement...</td></tr>
              ) : extensions.length === 0 ? (
                <tr><td colSpan={isAdmin ? 8 : 7} className="px-4 py-8 text-center text-muted-foreground">Aucune extension configurée</td></tr>
              ) : (
                extensions.map((ext, i) => (
                  <motion.tr
                    key={ext.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-border/50 hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Phone size={14} className="text-primary" />
                        <span className="font-mono font-bold text-foreground">{ext.number}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-foreground">{ext.name}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{ext.ipbx?.name || "—"}</td>
                    <td className="px-4 py-3"><StatusBadge status={ext.status as any} /></td>
                    <td className="px-4 py-3 font-mono text-muted-foreground text-xs">{ext.ip_address || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs flex items-center gap-1">
                      {ext.user_agent && <Monitor size={12} />}{ext.user_agent || "—"}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-semibold text-foreground">{ext.calls_today ?? 0}</td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(ext)}>
                            <Pencil size={13} />
                          </Button>
                          {deleteConfirm === ext.id ? (
                            <Button variant="destructive" size="sm" className="h-7 text-xs" onClick={() => handleDelete(ext.id)}>
                              Confirmer
                            </Button>
                          ) : (
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteConfirm(ext.id)}>
                              <Trash2 size={13} />
                            </Button>
                          )}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Extensions;
