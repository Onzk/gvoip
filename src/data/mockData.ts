// Mock data for VoIP supervision platform

export interface SipTrunk {
  id: string;
  name: string;
  provider: string;
  ip: string;
  status: "up" | "down" | "degraded";
  latency: number;
  uptime: number;
  failedAttempts: number;
  lastCheck: string;
  channels: number;
  maxChannels: number;
}

export interface Extension {
  id: string;
  number: string;
  name: string;
  status: "registered" | "unregistered" | "ringing" | "busy";
  ip: string;
  userAgent: string;
  lastRegistration: string;
  callsToday: number;
}

export interface ActiveCall {
  id: string;
  caller: string;
  callerName: string;
  callee: string;
  calleeName: string;
  duration: number;
  codec: string;
  trunk: string;
  status: "ringing" | "connected" | "failed" | "busy";
  mos: number;
  jitter: number;
}

export interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  title: string;
  message: string;
  source: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface QualityMetric {
  time: string;
  mos: number;
  jitter: number;
  packetLoss: number;
  latency: number;
}

export const sipTrunks: SipTrunk[] = [
  { id: "t1", name: "SIP-ORANGE-01", provider: "Orange Business", ip: "194.2.137.40", status: "up", latency: 12, uptime: 99.97, failedAttempts: 0, lastCheck: "il y a 5s", channels: 23, maxChannels: 30 },
  { id: "t2", name: "SIP-SFR-01", provider: "SFR Business", ip: "93.17.128.12", status: "up", latency: 18, uptime: 99.85, failedAttempts: 2, lastCheck: "il y a 8s", channels: 15, maxChannels: 30 },
  { id: "t3", name: "SIP-FREE-01", provider: "Free Pro", ip: "212.27.38.253", status: "down", latency: 0, uptime: 94.2, failedAttempts: 47, lastCheck: "il y a 3s", channels: 0, maxChannels: 20 },
  { id: "t4", name: "SIP-OVH-01", provider: "OVH Telecom", ip: "91.121.128.50", status: "up", latency: 8, uptime: 99.99, failedAttempts: 0, lastCheck: "il y a 12s", channels: 8, maxChannels: 60 },
  { id: "t5", name: "SIP-BOUYGUES-01", provider: "Bouygues Telecom", ip: "194.158.122.10", status: "degraded", latency: 85, uptime: 98.5, failedAttempts: 5, lastCheck: "il y a 6s", channels: 12, maxChannels: 20 },
  { id: "t6", name: "SIP-TWILIO-01", provider: "Twilio", ip: "54.172.60.0", status: "up", latency: 45, uptime: 99.95, failedAttempts: 1, lastCheck: "il y a 4s", channels: 5, maxChannels: 100 },
];

export const extensions: Extension[] = [
  { id: "e1", number: "1001", name: "Jean Dupont", status: "registered", ip: "192.168.1.101", userAgent: "Yealink T46U", lastRegistration: "il y a 2 min", callsToday: 12 },
  { id: "e2", number: "1002", name: "Marie Martin", status: "busy", ip: "192.168.1.102", userAgent: "Grandstream GXP2170", lastRegistration: "il y a 1 min", callsToday: 8 },
  { id: "e3", number: "1003", name: "Pierre Bernard", status: "registered", ip: "192.168.1.103", userAgent: "Polycom VVX450", lastRegistration: "il y a 5 min", callsToday: 5 },
  { id: "e4", number: "1004", name: "Sophie Laurent", status: "unregistered", ip: "—", userAgent: "Cisco 7942G", lastRegistration: "il y a 3h", callsToday: 0 },
  { id: "e5", number: "1005", name: "Luc Moreau", status: "ringing", ip: "192.168.1.105", userAgent: "Yealink T54W", lastRegistration: "il y a 30s", callsToday: 15 },
  { id: "e6", number: "1006", name: "Claire Petit", status: "registered", ip: "192.168.1.106", userAgent: "Fanvil X6U", lastRegistration: "il y a 4 min", callsToday: 3 },
  { id: "e7", number: "1007", name: "Marc Durand", status: "registered", ip: "192.168.1.107", userAgent: "Snom D785", lastRegistration: "il y a 1 min", callsToday: 9 },
  { id: "e8", number: "1008", name: "Nathalie Roux", status: "unregistered", ip: "—", userAgent: "Yealink T46U", lastRegistration: "il y a 12h", callsToday: 0 },
];

export const activeCalls: ActiveCall[] = [
  { id: "c1", caller: "1001", callerName: "Jean Dupont", callee: "+33145789012", calleeName: "Client ABC", duration: 245, codec: "G.711a", trunk: "SIP-ORANGE-01", status: "connected", mos: 4.2, jitter: 3.2 },
  { id: "c2", caller: "+33698765432", callerName: "Appel entrant", callee: "1002", calleeName: "Marie Martin", duration: 120, codec: "G.729", trunk: "SIP-SFR-01", status: "connected", mos: 3.8, jitter: 8.1 },
  { id: "c3", caller: "1005", callerName: "Luc Moreau", callee: "+33155443322", calleeName: "Fournisseur XYZ", duration: 0, codec: "G.711u", trunk: "SIP-OVH-01", status: "ringing", mos: 0, jitter: 0 },
  { id: "c4", caller: "+33787654321", callerName: "Support Tech", callee: "1007", calleeName: "Marc Durand", duration: 532, codec: "Opus", trunk: "SIP-TWILIO-01", status: "connected", mos: 4.4, jitter: 1.5 },
  { id: "c5", caller: "1003", callerName: "Pierre Bernard", callee: "+33322334455", calleeName: "Partenaire DEF", duration: 67, codec: "G.711a", trunk: "SIP-BOUYGUES-01", status: "connected", mos: 3.1, jitter: 22.4 },
];

export const alerts: Alert[] = [
  { id: "a1", type: "critical", title: "Trunk DOWN", message: "SIP-FREE-01 ne répond plus aux OPTIONS ping depuis 15 minutes", source: "SIP Monitor", timestamp: "2026-02-20 14:32:15", acknowledged: false },
  { id: "a2", type: "warning", title: "Latence élevée", message: "SIP-BOUYGUES-01 latence à 85ms (seuil: 50ms)", source: "QoS Monitor", timestamp: "2026-02-20 14:28:00", acknowledged: false },
  { id: "a3", type: "warning", title: "Tentatives SIP suspectes", message: "47 tentatives REGISTER échouées depuis 185.234.72.x", source: "Security", timestamp: "2026-02-20 14:15:30", acknowledged: true },
  { id: "a4", type: "info", title: "Extension offline", message: "Extension 1004 (Sophie Laurent) non enregistrée depuis 3h", source: "Extension Monitor", timestamp: "2026-02-20 11:45:00", acknowledged: true },
  { id: "a5", type: "critical", title: "MOS critique", message: "Appel c5 MOS à 3.1 via SIP-BOUYGUES-01 — qualité dégradée", source: "QoS Monitor", timestamp: "2026-02-20 14:30:45", acknowledged: false },
  { id: "a6", type: "info", title: "Trunk rétabli", message: "SIP-OVH-01 rétabli après maintenance planifiée", source: "SIP Monitor", timestamp: "2026-02-20 09:12:00", acknowledged: true },
];

export const generateQualityData = (): QualityMetric[] => {
  const data: QualityMetric[] = [];
  for (let i = 24; i >= 0; i--) {
    const h = (14 - i + 24) % 24;
    data.push({
      time: `${h.toString().padStart(2, "0")}:00`,
      mos: 3.5 + Math.random() * 1.0,
      jitter: 2 + Math.random() * 20,
      packetLoss: Math.random() * 2,
      latency: 8 + Math.random() * 40,
    });
  }
  return data;
};

export const dashboardStats = {
  totalTrunks: sipTrunks.length,
  trunksUp: sipTrunks.filter(t => t.status === "up").length,
  trunksDown: sipTrunks.filter(t => t.status === "down").length,
  trunksDegraded: sipTrunks.filter(t => t.status === "degraded").length,
  totalExtensions: extensions.length,
  extensionsOnline: extensions.filter(e => e.status !== "unregistered").length,
  extensionsOffline: extensions.filter(e => e.status === "unregistered").length,
  activeCalls: activeCalls.length,
  inboundCalls: activeCalls.filter(c => c.caller.startsWith("+")).length,
  outboundCalls: activeCalls.filter(c => !c.caller.startsWith("+")).length,
  avgMos: 4.1,
  avgLatency: 22,
  avgJitter: 7.2,
  packetLoss: 0.3,
  totalCallsToday: 247,
  unacknowledgedAlerts: alerts.filter(a => !a.acknowledged).length,
};
