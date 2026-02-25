
-- Add contact fields to partner_invites
ALTER TABLE public.partner_invites
  ADD COLUMN contact_name text,
  ADD COLUMN contact_phone text;

-- Update the assign_partner_from_invite function to pass contact info
CREATE OR REPLACE FUNCTION public.assign_partner_from_invite(_user_id uuid, _invite_code text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  
  IF _invite.partner_type = 'referral' THEN
    _role_name := 'referral_partner';
  ELSE
    _role_name := 'affiliate_partner';
  END IF;
  
  INSERT INTO public.user_roles (user_id, role, assigned_city_id)
  VALUES (_user_id, _role_name, _invite.city_id)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  INSERT INTO public.partners (user_id, partner_type, company_name, contact_email, contact_name, contact_phone, city_id, linked_place_id, status, referral_code)
  VALUES (
    _user_id,
    _invite.partner_type,
    COALESCE(_invite.company_name, ''),
    (SELECT email FROM auth.users WHERE id = _user_id),
    _invite.contact_name,
    _invite.contact_phone,
    _invite.city_id,
    _invite.linked_place_id,
    'active',
    CASE WHEN _invite.partner_type = 'referral' THEN 
      UPPER(SUBSTRING(md5(random()::text) FROM 1 FOR 8))
    ELSE NULL END
  );
  
  UPDATE public.partner_invites SET status = 'accepted' WHERE id = _invite.id;
  
  RETURN true;
END;
$function$;
