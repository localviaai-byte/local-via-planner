
-- Add partner roles to app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'referral_partner';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'affiliate_partner';

-- Partner type enum
CREATE TYPE public.partner_type AS ENUM ('referral', 'affiliate');

-- Partner status enum  
CREATE TYPE public.partner_status AS ENUM ('pending', 'active', 'suspended', 'cancelled');

-- Partners table
CREATE TABLE public.partners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  partner_type public.partner_type NOT NULL,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  logo_url TEXT,
  website_url TEXT,
  description TEXT,
  city_id UUID REFERENCES public.cities(id),
  status public.partner_status NOT NULL DEFAULT 'pending',
  -- Referral specific
  referral_code TEXT UNIQUE,
  commission_percent NUMERIC(5,2) DEFAULT 10.00,
  discount_percent NUMERIC(5,2) DEFAULT 5.00,
  -- Affiliate specific
  linked_place_id UUID REFERENCES public.places(id),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status TEXT DEFAULT 'none',
  subscription_started_at TIMESTAMP WITH TIME ZONE,
  subscription_ends_at TIMESTAMP WITH TIME ZONE,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID
);

-- Referral clicks tracking
CREATE TABLE public.referral_clicks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  ip_hash TEXT,
  user_agent TEXT,
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Referral conversions (when a click leads to a plan creation/booking)
CREATE TABLE public.referral_conversions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner_id UUID NOT NULL REFERENCES public.partners(id) ON DELETE CASCADE,
  click_id UUID REFERENCES public.referral_clicks(id),
  trip_plan_id UUID REFERENCES public.trip_plans(id),
  conversion_type TEXT NOT NULL DEFAULT 'plan_created',
  revenue_cents INTEGER DEFAULT 0,
  commission_cents INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Partner invites (reuse similar pattern to contributor_invites)
CREATE TABLE public.partner_invites (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  partner_type public.partner_type NOT NULL,
  company_name TEXT,
  city_id UUID REFERENCES public.cities(id),
  linked_place_id UUID REFERENCES public.places(id),
  invite_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending',
  created_by UUID NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_invites ENABLE ROW LEVEL SECURITY;

-- Partners policies
CREATE POLICY "Partners can view their own data"
ON public.partners FOR SELECT
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'editor'::app_role));

CREATE POLICY "Admins can manage all partners"
ON public.partners FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Partners can update their own profile"
ON public.partners FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Referral clicks policies
CREATE POLICY "Anyone can insert clicks"
ON public.referral_clicks FOR INSERT
WITH CHECK (true);

CREATE POLICY "Partners can view their own clicks"
ON public.referral_clicks FOR SELECT
USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

-- Referral conversions policies
CREATE POLICY "Partners can view their own conversions"
ON public.referral_conversions FOR SELECT
USING (partner_id IN (SELECT id FROM public.partners WHERE user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage conversions"
ON public.referral_conversions FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Partner invites policies
CREATE POLICY "Admins can manage partner invites"
ON public.partner_invites FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view invite by code"
ON public.partner_invites FOR SELECT
USING (true);

-- Indexes
CREATE INDEX idx_partners_user_id ON public.partners(user_id);
CREATE INDEX idx_partners_referral_code ON public.partners(referral_code);
CREATE INDEX idx_partners_linked_place ON public.partners(linked_place_id);
CREATE INDEX idx_referral_clicks_partner ON public.referral_clicks(partner_id);
CREATE INDEX idx_referral_clicks_code ON public.referral_clicks(referral_code);
CREATE INDEX idx_referral_conversions_partner ON public.referral_conversions(partner_id);
CREATE INDEX idx_partner_invites_code ON public.partner_invites(invite_code);

-- Function to assign partner role from invite
CREATE OR REPLACE FUNCTION public.assign_partner_from_invite(_user_id UUID, _invite_code TEXT)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invite RECORD;
  _role_name app_role;
BEGIN
  SELECT * INTO _invite
  FROM public.partner_invites
  WHERE invite_code = _invite_code
    AND status = 'pending'
    AND expires_at > now();
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Determine role based on partner type
  IF _invite.partner_type = 'referral' THEN
    _role_name := 'referral_partner';
  ELSE
    _role_name := 'affiliate_partner';
  END IF;
  
  -- Insert user role
  INSERT INTO public.user_roles (user_id, role, assigned_city_id)
  VALUES (_user_id, _role_name, _invite.city_id)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Create partner record
  INSERT INTO public.partners (user_id, partner_type, company_name, contact_email, city_id, linked_place_id, status, referral_code)
  VALUES (
    _user_id,
    _invite.partner_type,
    COALESCE(_invite.company_name, ''),
    (SELECT email FROM auth.users WHERE id = _user_id),
    _invite.city_id,
    _invite.linked_place_id,
    'active',
    CASE WHEN _invite.partner_type = 'referral' THEN 
      UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8))
    ELSE NULL END
  );
  
  -- Update invite
  UPDATE public.partner_invites SET status = 'accepted' WHERE id = _invite.id;
  
  RETURN true;
END;
$$;
