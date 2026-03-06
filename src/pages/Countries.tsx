import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Globe, Plus, Pencil, Trash2, BarChart3, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Country {
  id: string;
  name: string;
  code: string;
  timezone: string;
  created_at: string;
}

// Convertit un code pays (FR, TG...) en emoji drapeau
const getFlagEmoji = (code: string) => {
  if (!code || code.length < 2) return "🌍";
  const chars = code.toUpperCase().slice(0, 2).split("");
  return chars.map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join("");
};

const Countries = () => {
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Country | null>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({ name: "", code: "", timezone: "UTC" });

  const fetchCountries = async () => {
    if (isAdmin) {
      const { data, error } = await supabase.from("countries").select("*").order("name");
      if (!error && data) setCountries(data as Country[]);
    } else if (user) {
      // Charger seulement les pays assignés
      const { data: ucData } = await supabase.from("user_countries")
        .select("country_id").eq("user_id", user.id);
      const ids = ucData?.map((uc: any) => uc.country_id) || [];
      if (ids.length > 0) {
        const { data } = await supabase.from("countries")
          .select("*").in("id", ids).order("name");
        if (data) setCountries(data as Country[]);
      } else {
        setCountries([]);
      }
    }
    setLoading(false);
  };

  useEffect(() => { fetchCountries(); }, [isAdmin, user]);

  const handleSave = async () => {
    if (editing) {
      const { error } = await supabase.from("countries").update(form).eq("id", editing.id);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    } else {
      const { error } = await supabase.from("countries").insert(form);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    }
    toast({ title: editing ? "Pays modifié" : "Pays ajouté" });
    setOpen(false);
    setEditing(null);
    setForm({ name: "", code: "", timezone: "UTC" });
    fetchCountries();
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("countries").delete().eq("id", id);
    if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Pays supprimé" });
    fetchCountries();
  };

  const openEdit = (c: Country) => {
    setEditing(c);
    setForm({ name: c.name, code: c.code, timezone: c.timezone });
    setOpen(true);
  };

  const filteredCountries = countries.filter((c) => {
    const q = search.toLowerCase();
    return (
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Pays</h1>
          <p className="text-sm text-muted-foreground">Gestion des pays et zones géographiques</p>
        </div>
        {isAdmin && (
          <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) { setEditing(null); setForm({ name: "", code: "", timezone: "UTC" }); } }}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus size={16} className="mr-1" /> Ajouter</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editing ? "Modifier le pays" : "Ajouter un pays"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div><Label>Nom</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="France" className="mt-1" /></div>
                <div>
                  <Label>Code pays (ISO 3166-1)</Label>
                  <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="FR" maxLength={3} className="mt-1" />
                  {form.code.length >= 2 && (
                    <p className="text-2xl mt-1">{getFlagEmoji(form.code)}</p>
                  )}
                </div>
                <div><Label>Fuseau horaire</Label><Input value={form.timezone} onChange={(e) => setForm({ ...form, timezone: e.target.value })} placeholder="Europe/Paris" className="mt-1" /></div>
                <Button onClick={handleSave} className="w-full">{editing ? "Modifier" : "Ajouter"}</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher…"
          className="pl-9 h-9"
        />
      </div>

      <div className="grid gap-3">
        {loading ? (
          <p className="text-muted-foreground text-sm">Chargement...</p>
        ) : countries.length === 0 ? (
          <div className="noc-card p-8 text-center border border-border">
            <Globe className="mx-auto text-muted-foreground mb-2" size={32} />
            <p className="text-muted-foreground">Aucun pays configuré</p>
          </div>
        ) : filteredCountries.length === 0 ? (
          <div className="noc-card p-8 text-center border border-border">
            <Globe className="mx-auto text-muted-foreground mb-2" size={32} />
            <p className="text-muted-foreground">Aucun pays trouvé</p>
          </div>
        ) : (
          filteredCountries.map((c) => (
            <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="noc-card p-4 border border-border flex items-center justify-between cursor-pointer hover:ring-2 hover:ring-primary transition-all" onClick={() => window.location.href=`/countries/${c.id}`}>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-2xl flex items-center justify-center w-10 h-10">
                  {getFlagEmoji(c.code)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{c.name}</p>
                  <p className="text-xs text-muted-foreground font-mono">{c.code} · {c.timezone}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={`/countries/${c.id}`}>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><BarChart3 size={14} className="text-primary" /></Button>
                </Link>
                {isAdmin && (
                  <>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Pencil size={14} /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(c.id)}><Trash2 size={14} /></Button>
                  </>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default Countries;
