DELETE FROM public.user_consent a
USING public.user_consent b
WHERE a.user_id = b.user_id
  AND a.consent_type = b.consent_type
  AND a.created_at < b.created_at;

ALTER TABLE public.user_consent
  ADD CONSTRAINT user_consent_user_id_consent_type_key UNIQUE (user_id, consent_type);