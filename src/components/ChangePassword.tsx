import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const ChangePassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast({ title: "Erreur", description: "Minimum 8 caracteres", variant: "destructive" }); return;
    }
    if (newPassword !== confirm) {
      toast({ title: "Erreur", description: "Les mots de passe ne correspondent pas", variant: "destructive" }); return;
    }
    setLoading(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        toast({ title: "Erreur", description: "Session expirée, reconnectez-vous", variant: "destructive" });
        setLoading(false);
        return;
      }
      // Mettre à jour le profil AVANT updateUser pour eviter le race condition
      await supabase.from("profiles").update({ force_password_change: false }).eq("user_id", user.id);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        // Rollback si echec
        await supabase.from("profiles").update({ force_password_change: true }).eq("user_id", user.id);
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
        setLoading(false);
        return;
      }
      toast({ title: "Mot de passe mis a jour", description: "Bienvenue !" });
      setTimeout(() => window.location.reload(), 800);
    } catch(e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/GVOIP.png" alt="" className="w-20 h-20 mx-auto" />
          <h1 className="text-3xl font-bold text-foreground tracking-wide mt-3">
            G<span className="text-primary">VoIP</span>
          </h1>
          
        </div>
        <div className="noc-card p-6 border border-border rounded-lg">
          <h2 className="text-lg font-semibold text-foreground mb-1">Changement de mot de passe</h2>
          <p className="text-sm text-muted-foreground mb-6">Vous devez definir un nouveau mot de passe avant de continuer.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="np">Nouveau mot de passe</Label>
              <Input id="np" type="password" value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 caracteres" minLength={8} required className="mt-1" />
            </div>
            <div>
              <Label htmlFor="cp">Confirmer</Label>
              <Input id="cp" type="password" value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Confirmer le mot de passe" required className="mt-1" />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Valider et acceder
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
