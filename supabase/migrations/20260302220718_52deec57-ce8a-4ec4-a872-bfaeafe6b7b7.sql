
-- Add inter-IPBX support and signaling IPs to sip_trunks
ALTER TABLE public.sip_trunks 
  ADD COLUMN IF NOT EXISTS remote_ipbx_id uuid REFERENCES public.ipbx(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS local_ip text,
  ADD COLUMN IF NOT EXISTS remote_ip text;

-- Add last_ping and ping-based status tracking to ipbx
ALTER TABLE public.ipbx
  ADD COLUMN IF NOT EXISTS last_ping timestamp with time zone,
  ADD COLUMN IF NOT EXISTS ping_latency integer DEFAULT 0;
