-- Create a security definer function to assign role from invite
-- This bypasses RLS to allow new users to get their role assigned
CREATE OR REPLACE FUNCTION public.assign_role_from_invite(
  _user_id uuid,
  _invite_code text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _invite record;
BEGIN
  -- Find the invite
  SELECT * INTO _invite
  FROM public.contributor_invites
  WHERE invite_code = _invite_code
    AND status = 'pending'
    AND expires_at > now();
  
  -- If no valid invite found, return false
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Insert the user role
  INSERT INTO public.user_roles (user_id, role, assigned_city_id)
  VALUES (_user_id, _invite.role, _invite.assigned_city_id)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Update invite status
  UPDATE public.contributor_invites
  SET status = 'accepted'
  WHERE id = _invite.id;
  
  RETURN true;
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.assign_role_from_invite(uuid, text) TO authenticated;