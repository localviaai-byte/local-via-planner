-- Create contributor_invites table for managing contributor invitations
CREATE TABLE public.contributor_invites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  role app_role NOT NULL DEFAULT 'local_contributor',
  assigned_city_id uuid REFERENCES public.cities(id) ON DELETE SET NULL,
  permissions text[] DEFAULT '{}',
  invite_code text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL
);

-- Create activity_logs table for tracking admin actions
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  user_email text,
  action_type text NOT NULL CHECK (action_type IN ('create', 'update', 'delete', 'link')),
  entity_type text NOT NULL,
  entity_id uuid,
  details jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_contributor_invites_email ON public.contributor_invites(email);
CREATE INDEX idx_contributor_invites_code ON public.contributor_invites(invite_code);
CREATE INDEX idx_contributor_invites_status ON public.contributor_invites(status);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_entity_type ON public.activity_logs(entity_type);
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);

-- Enable RLS on both tables
ALTER TABLE public.contributor_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for contributor_invites
CREATE POLICY "Admins can manage invites"
  ON public.contributor_invites FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can view their own invites by email"
  ON public.contributor_invites FOR SELECT
  USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- RLS policies for activity_logs
CREATE POLICY "Admins and editors can view logs"
  ON public.activity_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'editor'));

CREATE POLICY "Authenticated users can insert logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create helper function for logging activities
CREATE OR REPLACE FUNCTION public.log_activity(
  _action_type text,
  _entity_type text,
  _entity_id uuid DEFAULT NULL,
  _details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.activity_logs (user_id, user_email, action_type, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    (SELECT email FROM auth.users WHERE id = auth.uid()),
    _action_type,
    _entity_type,
    _entity_id,
    _details
  );
END;
$$;