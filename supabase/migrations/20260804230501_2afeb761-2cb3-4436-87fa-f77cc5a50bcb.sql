-- ============ MFA BACKUP CODES ============
CREATE TABLE IF NOT EXISTS public.mfa_backup_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code_hash TEXT NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mfa_backup_codes TO authenticated;
GRANT ALL ON public.mfa_backup_codes TO service_role;
ALTER TABLE public.mfa_backup_codes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mfa_backup_codes_owner_all" ON public.mfa_backup_codes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
