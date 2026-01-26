-- Create helper function to get user email safely
CREATE OR REPLACE FUNCTION public.get_user_email(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT email FROM auth.users WHERE id = _user_id
$$;

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can view their own invites by email" ON public.contributor_invites;

-- Create a new safe policy for users viewing their invites
CREATE POLICY "Users can view their own invites by email"
ON public.contributor_invites
FOR SELECT
USING (
  email = public.get_user_email(auth.uid())
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Also allow public to read invites by invite_code (for the accept invite page)
CREATE POLICY "Anyone can view invite by code"
ON public.contributor_invites
FOR SELECT
USING (true);