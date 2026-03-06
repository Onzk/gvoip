import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function pingHost(ip: string): Promise<{ reachable: boolean; latency: number }> {
  const start = Date.now();
  try {
    // Use TCP connect as a proxy for ping (Deno doesn't support ICMP)
    const conn = await Deno.connect({ hostname: ip, port: 5060, transport: "tcp" });
    const latency = Date.now() - start;
    conn.close();
    return { reachable: true, latency };
  } catch {
    // Try HTTP as fallback for web-based services
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      await fetch(`http://${ip}`, { signal: controller.signal, method: "HEAD" });
      clearTimeout(timeout);
      return { reachable: true, latency: Date.now() - start };
    } catch {
      return { reachable: false, latency: Date.now() - start };
    }
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const results: { type: string; id: string; ip: string; reachable: boolean; latency: number }[] = [];

  // Ping all IPBX
  const { data: ipbxList } = await supabase.from("ipbx").select("id, ip_address, status");
  if (ipbxList) {
    for (const ipbx of ipbxList) {
      if (!ipbx.ip_address) continue;
      const ping = await pingHost(ipbx.ip_address);
      const newStatus = ping.reachable ? "online" : "offline";
      results.push({ type: "ipbx", id: ipbx.id, ip: ipbx.ip_address, ...ping });

      if (ipbx.status !== newStatus || ping.reachable) {
        await supabase.from("ipbx").update({
          status: newStatus,
          last_ping: new Date().toISOString(),
          ping_latency: ping.latency,
        }).eq("id", ipbx.id);
      }
    }
  }

  // Ping all SIP Trunks (remote_ip)
  const { data: trunkList } = await supabase.from("sip_trunks").select("id, remote_ip, ip_address, status");
  if (trunkList) {
    for (const trunk of trunkList) {
      const targetIp = trunk.remote_ip || trunk.ip_address;
      if (!targetIp) continue;
      const ping = await pingHost(targetIp);
      const newStatus = ping.reachable ? "up" : "down";
      results.push({ type: "trunk", id: trunk.id, ip: targetIp, ...ping });

      await supabase.from("sip_trunks").update({
        status: newStatus,
        latency: ping.latency,
        last_check: new Date().toISOString(),
        failed_attempts: ping.reachable ? 0 : (trunk.status === "down" ? undefined : 1),
      }).eq("id", trunk.id);
    }
  }

  return new Response(JSON.stringify({ ok: true, checked: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
