import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Lock, Mail } from "lucide-react";
import { useEffect, useState } from "react";

const CircuitCorner = ({ className }: { className: string }) => (
  <div className={`absolute ${className} w-36 h-20 pointer-events-none`}>
    <svg width="144" height="80" viewBox="0 0 144 80" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="34" width="60" height="12" rx="2" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1"/>
      <rect x="108" y="34" width="36" height="12" rx="2" fill="#1a1a1a" stroke="#2a2a2a" strokeWidth="1"/>
      <circle cx="108" cy="40" r="4" fill="#3b82f6" opacity="0.8"/>
      <line x1="60" y1="40" x2="108" y2="40" stroke="#2a2a2a" strokeWidth="1"/>
      <rect x="20" y="34" width="4" height="4" fill="#3b3b3b"/>
      <rect x="30" y="34" width="4" height="4" fill="#3b3b3b"/>
      <rect x="40" y="34" width="4" height="4" fill="#3b3b3b"/>
    </svg>
  </div>
);

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

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
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#080808", fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif" }}
    >
      {/* Subtle radial glow in center */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(30,40,60,0.4) 0%, transparent 70%)",
        }}
      />

      {/* Corner circuit decorations */}
      <div className="absolute top-16 left-0 pointer-events-none flex items-center" style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease" }}>
        <div style={{ width: 160, height: 48, position: "relative" }}>
          <svg width="160" height="48" viewBox="0 0 160 48" fill="none">
            <rect x="0" y="18" width="100" height="12" rx="2" fill="#141414" stroke="#252525" strokeWidth="1"/>
            <rect x="114" y="18" width="46" height="12" rx="2" fill="#141414" stroke="#252525" strokeWidth="1"/>
            <circle cx="114" cy="24" r="3.5" fill="#3b82f6" style={{ filter: "drop-shadow(0 0 4px #3b82f6)" }}/>
            <line x1="100" y1="24" x2="114" y2="24" stroke="#252525" strokeWidth="1"/>
            {[16,26,36,46,56].map((x, i) => (
              <rect key={i} x={x} y="18" width="3" height="3" fill="#2a2a2a"/>
            ))}
          </svg>
        </div>
      </div>

      <div className="absolute top-16 right-0 pointer-events-none flex items-center" style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease 0.1s" }}>
        <div style={{ width: 160, height: 48 }}>
          <svg width="160" height="48" viewBox="0 0 160 48" fill="none">
            <rect x="60" y="18" width="100" height="12" rx="2" fill="#141414" stroke="#252525" strokeWidth="1"/>
            <rect x="0" y="18" width="46" height="12" rx="2" fill="#141414" stroke="#252525" strokeWidth="1"/>
            <circle cx="46" cy="24" r="3.5" fill="#3b82f6" style={{ filter: "drop-shadow(0 0 4px #3b82f6)" }}/>
            <line x1="46" y1="24" x2="60" y2="24" stroke="#252525" strokeWidth="1"/>
            {[84,94,104,114,124].map((x, i) => (
              <rect key={i} x={x} y="18" width="3" height="3" fill="#2a2a2a"/>
            ))}
          </svg>
        </div>
      </div>

      <div className="absolute bottom-16 left-0 pointer-events-none" style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease 0.2s" }}>
        <svg width="160" height="48" viewBox="0 0 160 48" fill="none">
          <rect x="0" y="18" width="100" height="12" rx="2" fill="#141414" stroke="#252525" strokeWidth="1"/>
          <rect x="114" y="18" width="46" height="12" rx="2" fill="#141414" stroke="#252525" strokeWidth="1"/>
          <circle cx="114" cy="24" r="3.5" fill="#3b82f6" style={{ filter: "drop-shadow(0 0 4px #3b82f6)" }}/>
          <line x1="100" y1="24" x2="114" y2="24" stroke="#252525" strokeWidth="1"/>
          {[16,26,36,46,56].map((x, i) => (
            <rect key={i} x={x} y="18" width="3" height="3" fill="#2a2a2a"/>
          ))}
        </svg>
      </div>

      <div className="absolute bottom-16 right-0 pointer-events-none" style={{ opacity: mounted ? 1 : 0, transition: "opacity 0.8s ease 0.3s" }}>
        <svg width="160" height="48" viewBox="0 0 160 48" fill="none">
          <rect x="60" y="18" width="100" height="12" rx="2" fill="#141414" stroke="#252525" strokeWidth="1"/>
          <rect x="0" y="18" width="46" height="12" rx="2" fill="#141414" stroke="#252525" strokeWidth="1"/>
          <circle cx="46" cy="24" r="3.5" fill="#3b82f6" style={{ filter: "drop-shadow(0 0 4px #3b82f6)" }}/>
          <line x1="46" y1="24" x2="60" y2="24" stroke="#252525" strokeWidth="1"/>
          {[84,94,104,114,124].map((x, i) => (
            <rect key={i} x={x} y="18" width="3" height="3" fill="#2a2a2a"/>
          ))}
        </svg>
      </div>

      {/* Diagonal lines from corners to card */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: 0.3 }}>
        <line x1="160" y1="22%" x2="36%" y2="42%" stroke="#1e1e1e" strokeWidth="1"/>
        <line x1="calc(100% - 160px)" y1="22%" x2="64%" y2="42%" stroke="#1e1e1e" strokeWidth="1"/>
        <line x1="160" y1="78%" x2="36%" y2="58%" stroke="#1e1e1e" strokeWidth="1"/>
        <line x1="calc(100% - 160px)" y1="78%" x2="64%" y2="58%" stroke="#1e1e1e" strokeWidth="1"/>
      </svg>

      {/* Main card */}
      <div
        className="relative w-full z-10"
        style={{
          maxWidth: 360,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "opacity 0.6s ease 0.2s, transform 0.6s ease 0.2s",
        }}
      >
        <div
          style={{
            background: "linear-gradient(145deg, #141414 0%, #111111 100%)",
            border: "1px solid #222222",
            borderRadius: 16,
            padding: "36px 32px 32px",
            boxShadow: "0 24px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: 12,
                background: "#0d0d0d",
                border: "1px solid #2a2a2a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                boxShadow: "0 4px 16px rgba(0,0,0,0.5)",
              }}
            >
              <img src="/GVOIP.png" alt="GVoIP" style={{ width: 34, height: 34, objectFit: "contain" }} />
            </div>
            {/* Dot pattern flanking logo */}
            <div className="flex items-center gap-3 absolute" style={{ top: 48, left: "50%", transform: "translateX(-50%)", whiteSpace: "nowrap" }}>
              <span style={{ display: "flex", gap: 3 }}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <span key={i} style={{ width: 2.5, height: 2.5, borderRadius: "50%", background: "#2a2a2a", display: "inline-block" }} />
                ))}
              </span>
              <span style={{ width: 52 }} />
              <span style={{ display: "flex", gap: 3 }}>
                {Array.from({ length: 7 }).map((_, i) => (
                  <span key={i} style={{ width: 2.5, height: 2.5, borderRadius: "50%", background: "#2a2a2a", display: "inline-block" }} />
                ))}
              </span>
            </div>

            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#f0f0f0", letterSpacing: "-0.02em", marginTop: 4 }}>
              Connexion
            </h1>
            <p style={{ fontSize: 13, color: "#555", marginTop: 4 }}>
              Entrez vos informations d'identification.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Email */}
            <div style={{ position: "relative" }}>
              <Mail
                size={15}
                style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#444", zIndex: 1 }}
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Adresse mail"
                required
                style={{
                  width: "100%",
                  background: "#0d0d0d",
                  border: "1px solid #272727",
                  borderRadius: 8,
                  padding: "11px 14px 11px 36px",
                  fontSize: 14,
                  color: "#ccc",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#272727")}
              />
            </div>

            {/* Password */}
            <div style={{ position: "relative" }}>
              <Lock
                size={15}
                style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", color: "#444", zIndex: 1 }}
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                required
                minLength={6}
                style={{
                  width: "100%",
                  background: "#0d0d0d",
                  border: "1px solid #272727",
                  borderRadius: 8,
                  padding: "11px 14px 11px 36px",
                  fontSize: 14,
                  color: "#ccc",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 0.2s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#3b82f6")}
                onBlur={(e) => (e.target.style.borderColor = "#272727")}
              />
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: loading ? "#1d4ed8" : "#2563eb",
                border: "none",
                borderRadius: 8,
                padding: "12px",
                fontSize: 14,
                fontWeight: 600,
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 4,
                transition: "background 0.2s, transform 0.1s",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.background = "#1d4ed8"); }}
              onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.background = "#2563eb"); }}
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;