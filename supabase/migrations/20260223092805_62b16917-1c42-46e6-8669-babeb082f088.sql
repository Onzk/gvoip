
-- 1. Role enum and user_roles table
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 2. Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Countries table
CREATE TABLE public.countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.countries ENABLE ROW LEVEL SECURITY;

-- 4. User-Country assignments
CREATE TABLE public.user_countries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  country_id UUID REFERENCES public.countries(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, country_id)
);
ALTER TABLE public.user_countries ENABLE ROW LEVEL SECURITY;

-- 5. IPBX table
CREATE TABLE public.ipbx (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'Asterisk',
  country_id UUID REFERENCES public.countries(id) ON DELETE CASCADE NOT NULL,
  ami_user TEXT,
  ami_password TEXT,
  status TEXT NOT NULL DEFAULT 'offline',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ipbx ENABLE ROW LEVEL SECURITY;

-- 6. SIP Trunks
CREATE TABLE public.sip_trunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  provider TEXT,
  ip_address TEXT,
  ipbx_id UUID REFERENCES public.ipbx(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'down',
  latency INTEGER DEFAULT 0,
  uptime NUMERIC(5,2) DEFAULT 0,
  failed_attempts INTEGER DEFAULT 0,
  channels INTEGER DEFAULT 0,
  max_channels INTEGER DEFAULT 30,
  last_check TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.sip_trunks ENABLE ROW LEVEL SECURITY;

-- 7. Extensions
CREATE TABLE public.extensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number TEXT NOT NULL,
  name TEXT NOT NULL,
  ipbx_id UUID REFERENCES public.ipbx(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'unregistered',
  ip_address TEXT,
  user_agent TEXT,
  last_registration TEXT,
  calls_today INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.extensions ENABLE ROW LEVEL SECURITY;

-- 8. Calls (CDR)
CREATE TABLE public.calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ipbx_id UUID REFERENCES public.ipbx(id) ON DELETE CASCADE NOT NULL,
  caller TEXT NOT NULL,
  caller_name TEXT,
  callee TEXT NOT NULL,
  callee_name TEXT,
  duration INTEGER DEFAULT 0,
  codec TEXT,
  trunk_name TEXT,
  status TEXT NOT NULL DEFAULT 'ringing',
  mos NUMERIC(3,1) DEFAULT 0,
  jitter NUMERIC(5,1) DEFAULT 0,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;

-- 9. Alerts
CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ipbx_id UUID REFERENCES public.ipbx(id) ON DELETE SET NULL,
  country_id UUID REFERENCES public.countries(id) ON DELETE SET NULL,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT,
  source TEXT,
  acknowledged BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;

-- 10. Helper functions (security definer)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin')
$$;

CREATE OR REPLACE FUNCTION public.user_can_access_country(_country_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin() OR EXISTS (
    SELECT 1 FROM public.user_countries
    WHERE user_id = auth.uid() AND country_id = _country_id
  )
$$;

CREATE OR REPLACE FUNCTION public.user_can_access_ipbx(_ipbx_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin() OR EXISTS (
    SELECT 1 FROM public.ipbx i
    JOIN public.user_countries uc ON uc.country_id = i.country_id
    WHERE i.id = _ipbx_id AND uc.user_id = auth.uid()
  )
$$;

-- 11. Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  
  -- Default role: user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 12. Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_countries_updated_at BEFORE UPDATE ON public.countries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_ipbx_updated_at BEFORE UPDATE ON public.ipbx FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sip_trunks_updated_at BEFORE UPDATE ON public.sip_trunks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_extensions_updated_at BEFORE UPDATE ON public.extensions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 13. RLS Policies

-- user_roles
CREATE POLICY "Anyone can read roles" ON public.user_roles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- profiles
CREATE POLICY "Profiles readable by authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "System inserts profiles" ON public.profiles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- countries
CREATE POLICY "Admins manage countries" ON public.countries FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Users see assigned countries" ON public.countries FOR SELECT TO authenticated USING (public.user_can_access_country(id));

-- user_countries
CREATE POLICY "Admins manage user_countries" ON public.user_countries FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Users see own assignments" ON public.user_countries FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ipbx (exclude ami credentials from general access via column security or views)
CREATE POLICY "Admins manage ipbx" ON public.ipbx FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Users see accessible ipbx" ON public.ipbx FOR SELECT TO authenticated USING (public.user_can_access_ipbx(id));

-- sip_trunks
CREATE POLICY "Admins manage sip_trunks" ON public.sip_trunks FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Users see accessible sip_trunks" ON public.sip_trunks FOR SELECT TO authenticated USING (public.user_can_access_ipbx(ipbx_id));

-- extensions
CREATE POLICY "Admins manage extensions" ON public.extensions FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Users see accessible extensions" ON public.extensions FOR SELECT TO authenticated USING (public.user_can_access_ipbx(ipbx_id));

-- calls
CREATE POLICY "Admins manage calls" ON public.calls FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Users see accessible calls" ON public.calls FOR SELECT TO authenticated USING (public.user_can_access_ipbx(ipbx_id));

-- alerts
CREATE POLICY "Admins manage alerts" ON public.alerts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Users see accessible alerts" ON public.alerts FOR SELECT TO authenticated 
  USING (
    (ipbx_id IS NOT NULL AND public.user_can_access_ipbx(ipbx_id))
    OR (country_id IS NOT NULL AND public.user_can_access_country(country_id))
  );
