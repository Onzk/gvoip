import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Lock, Mail, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState(true);
  const { toast } = useToast();

  useEffect(() => { setMounted(true); }, []);

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
    <div className={`min-h-screen flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-500 ${dark ? "bg-[#080808]" : "bg-slate-100"}`}>

      {/* Radial glow */}
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${dark ? "opacity-100" : "opacity-0"}`}
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(30,40,60,0.5) 0%, transparent 70%)" }} />
      <div className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${dark ? "opacity-0" : "opacity-100"}`}
        style={{ background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(59,130,246,0.06) 0%, transparent 70%)" }} />

      {/* Corner circuit — top left */}
      <div className={`absolute top-16 left-0 pointer-events-none transition-opacity duration-700 ${mounted ? "opacity-100" : "opacity-0"}`}>
        <svg width="160" height="48" viewBox="0 0 160 48" fill="none">
          <rect x="0" y="18" width="100" height="12" rx="2" fill={dark ? "#141414" : "#e2e8f0"} stroke={dark ? "#252525" : "#cbd5e1"} strokeWidth="1"/>
          <rect x="114" y="18" width="46" height="12" rx="2" fill={dark ? "#141414" : "#e2e8f0"} stroke={dark ? "#252525" : "#cbd5e1"} strokeWidth="1"/>
          <circle cx="114" cy="24" r="3.5" fill="#3b82f6" className="blink" style={{ filter: "drop-shadow(0 0 4px #3b82f6)" }}/>
          <line x1="100" y1="24" x2="114" y2="24" stroke={dark ? "#252525" : "#cbd5e1"} strokeWidth="1"/>
          {[16,26,36,46,56].map((x, i) => (
            <rect key={i} x={x} y="18" width="3" height="3" fill={dark ? "#2a2a2a" : "#94a3b8"}/>
          ))}
        </svg>
      </div>

      {/* Corner circuit — top right */}
      <div className={`absolute top-16 right-0 pointer-events-none transition-opacity duration-700 delay-100 ${mounted ? "opacity-100" : "opacity-0"}`}>
        <svg width="160" height="48" viewBox="0 0 160 48" fill="none">
          <rect x="60" y="18" width="100" height="12" rx="2" fill={dark ? "#141414" : "#e2e8f0"} stroke={dark ? "#252525" : "#cbd5e1"} strokeWidth="1"/>
          <rect x="0" y="18" width="46" height="12" rx="2" fill={dark ? "#141414" : "#e2e8f0"} stroke={dark ? "#252525" : "#cbd5e1"} strokeWidth="1"/>
          <circle cx="46" cy="24" r="3.5" fill="#3b82f6" style={{ filter: "drop-shadow(0 0 4px #3b82f6)" }}/>
          <line x1="46" y1="24" x2="60" y2="24" stroke={dark ? "#252525" : "#cbd5e1"} strokeWidth="1"/>
          {[84,94,104,114,124].map((x, i) => (
            <rect key={i} x={x} y="18" width="3" height="3" fill={dark ? "#2a2a2a" : "#94a3b8"}/>
          ))}
        </svg>
      </div>

      {/* Corner circuit — bottom left */}
      <div className={`absolute bottom-16 left-0 pointer-events-none transition-opacity duration-700 delay-200 ${mounted ? "opacity-100" : "opacity-0"}`}>
        <svg width="160" height="48" viewBox="0 0 160 48" fill="none">
          <rect x="0" y="18" width="100" height="12" rx="2" fill={dark ? "#141414" : "#e2e8f0"} stroke={dark ? "#252525" : "#cbd5e1"} strokeWidth="1"/>
          <rect x="114" y="18" width="46" height="12" rx="2" fill={dark ? "#141414" : "#e2e8f0"} stroke={dark ? "#252525" : "#cbd5e1"} strokeWidth="1"/>
          <circle cx="114" cy="24" r="3.5" fill="#3b82f6" className="blink" style={{ filter: "drop-shadow(0 0 4px #3b82f6)" }}/>
          <line x1="100" y1="24" x2="114" y2="24" stroke={dark ? "#252525" : "#cbd5e1"} strokeWidth="1"/>
          {[16,26,36,46,56].map((x, i) => (
            <rect key={i} x={x} y="18" width="3" height="3" fill={dark ? "#2a2a2a" : "#94a3b8"}/>
          ))}
        </svg>
      </div>

      {/* Corner circuit — bottom right */}
      <div className={`absolute bottom-16 right-0 pointer-events-none transition-opacity duration-700 delay-300 ${mounted ? "opacity-100" : "opacity-0"}`}>
        <svg width="160" height="48" viewBox="0 0 160 48" fill="none">
          <rect x="60" y="18" width="100" height="12" rx="2" fill={dark ? "#141414" : "#e2e8f0"} stroke={dark ? "#252525" : "#cbd5e1"} strokeWidth="1"/>
          <rect x="0" y="18" width="46" height="12" rx="2" fill={dark ? "#141414" : "#e2e8f0"} stroke={dark ? "#252525" : "#cbd5e1"} strokeWidth="1"/>
          <circle cx="46" cy="24" r="3.5" fill="#3b82f6" style={{ filter: "drop-shadow(0 0 4px #3b82f6)" }}/>
          <line x1="46" y1="24" x2="60" y2="24" stroke={dark ? "#252525" : "#cbd5e1"} strokeWidth="1"/>
          {[84,94,104,114,124].map((x, i) => (
            <rect key={i} x={x} y="18" width="3" height="3" fill={dark ? "#2a2a2a" : "#94a3b8"}/>
          ))}
        </svg>
      </div>

      {/* Diagonal lines */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity: dark ? 0.3 : 0.15 }}>
        <line x1="160" y1="22%" x2="36%" y2="42%" stroke={dark ? "#1e1e1e" : "#94a3b8"} strokeWidth="1"/>
        <line x1="calc(100% - 160px)" y1="22%" x2="64%" y2="42%" stroke={dark ? "#1e1e1e" : "#94a3b8"} strokeWidth="1"/>
        <line x1="160" y1="78%" x2="36%" y2="58%" stroke={dark ? "#1e1e1e" : "#94a3b8"} strokeWidth="1"/>
        <line x1="calc(100% - 160px)" y1="78%" x2="64%" y2="58%" stroke={dark ? "#1e1e1e" : "#94a3b8"} strokeWidth="1"/>
      </svg>

      {/* Card */}
      <div className={`relative w-full z-10 max-w-sm transition-all duration-500 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
        <div className={`relative rounded-2xl p-8 py-16 transition-all duration-500 ${
          dark
            ? "bg-gradient-to-b from-[#040404] to-[#101010] shadow-[0_24px_80px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.04)]"
            : "bg-white border border-slate-200 shadow-[0_8px_40px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.8)]"
        }`}>

          {/* Theme toggle button */}
          <button
            onClick={() => setDark(!dark)}
            className={`absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
              dark
                ? "bg-[#1a1a1a] border border-[#2a2a2a] text-slate-400 hover:text-yellow-400 hover:border-yellow-400/30 hover:bg-[#1f1f1f]"
                : "bg-slate-100 border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50"
            }`}
            aria-label="Toggle theme"
          >
            {dark
              ? <Sun size={14} />
              : <Moon size={14} />
            }
          </button>

          {/* Logo + heading */}
          <div className="flex flex-col items-center mb-7">
            <div className={`w-13 h-13 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 ${
              dark
                ? "bg-[#0d0d0d] border border-[#2a2a2a] shadow-[0_4px_16px_rgba(0,0,0,0.5)]"
                : "bg-white border border-slate-200 shadow-[0_4px_16px_rgba(0,0,0,0.06)]"
            }`} style={{ width: 52, height: 52 }}>
              <img src="/GVOIP.png" alt="GVoIP" className="w-9 h-9 object-contain" />
            </div>

            {/* Dot pattern */}
            <div className="flex items-center gap-3 mb-3">
              <span className="flex gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <span key={i} className={`w-[3px] h-[3px] rounded-full inline-block transition-colors duration-500 ${dark ? "bg-[#2a2a2a]" : "bg-slate-300"}`} />
                ))}
              </span>
              <span className="w-[52px]" />
              <span className="flex gap-1">
                {Array.from({ length: 7 }).map((_, i) => (
                  <span key={i} className={`w-[3px] h-[3px] rounded-full inline-block transition-colors duration-500 ${dark ? "bg-[#2a2a2a]" : "bg-slate-300"}`} />
                ))}
              </span>
            </div>

            <h1 className={`text-xl font-bold tracking-tight transition-colors duration-500 ${dark ? "text-[#f0f0f0]" : "text-slate-800"}`}>
              Connexion
            </h1>
            <p className={`text-[13px] mt-1 transition-colors duration-500 ${dark ? "text-[#555]" : "text-slate-400"}`}>
              Entrez vos informations d'identification.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {/* Email input */}
            <div className="relative">
              <Mail size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-500 ${dark ? "text-[#444]" : "text-slate-400"}`} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Adresse mail"
                required
                className={`w-full rounded-lg pl-9 pr-3 py-[11px] text-[14px] outline-none transition-all duration-200 focus:ring-1 ${
                  dark
                    ? "bg-[#0d0d0d] border border-[#272727] text-[#ccc] placeholder:text-[#3a3a3a] focus:border-indigo-500 focus:ring-indigo-500/20"
                    : "bg-slate-50 border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-400/20"
                }`}
              />
            </div>

            {/* Password input */}
            <div className="relative">
              <Lock size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-500 ${dark ? "text-[#444]" : "text-slate-400"}`} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                required
                minLength={6}
                className={`w-full rounded-lg pl-9 pr-3 py-[11px] text-[14px] outline-none transition-all duration-200 focus:ring-1 ${
                  dark
                    ? "bg-[#0d0d0d] border border-[#272727] text-[#ccc] placeholder:text-[#3a3a3a] focus:border-indigo-500 focus:ring-indigo-500/20"
                    : "bg-slate-50 border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-indigo-400/20"
                }`}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-1 rounded-lg py-[11px] text-[14px] font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 tracking-[0.01em] ${
                loading
                  ? "bg-indigo-700 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] cursor-pointer"
              }`}
            >
              {loading && <Loader2 size={14} className="animate-spin" />}
              Se connecter
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;