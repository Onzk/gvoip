import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast({ title: "Erreur de connexion", description: "Email ou mot de passe incorrect", variant: "destructive" });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/GVOIP.png" alt="" className="w-20 h-20 mx-auto" />
          <h1 className="text-3xl font-bold text-foreground tracking-wide mt-3">G<span className="text-primary">VoIP</span></h1>
          <p className="text-sm text-muted-foreground mt-1">Supervision NOC</p>
        </div>
        <div className="noc-card p-6 border border-border rounded-lg">
          <h2 className="text-lg font-semibold text-foreground mb-1">Connexion</h2>
          <p className="text-sm text-muted-foreground mb-6">Acces reserve aux utilisateurs autorises</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@gvoip.com" required className="mt-1" /></div>
            <div><Label htmlFor="password">Mot de passe</Label><Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required minLength={6} className="mt-1" /></div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Se connecter
            </Button>
          </form>
        </div>
        <p className="text-center text-xs text-muted-foreground mt-4">Contactez votre administrateur pour obtenir un acces.</p>
      </div>
    </div>
  );
};

export default Auth;
