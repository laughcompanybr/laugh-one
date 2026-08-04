ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS impersonated_company_id uuid REFERENCES public.companies(id);

-- Atualizar a função get_user_company_id para considerar impersonificação
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid AS $$
DECLARE
  v_company_id uuid;
  v_impersonated_id uuid;
BEGIN
  SELECT company_id, impersonated_company_id INTO v_company_id, v_impersonated_id
  FROM public.profiles
  WHERE id = auth.uid();
  
  -- Se houver impersonificação, retorna o ID da empresa alvo
  IF v_impersonated_id IS NOT NULL THEN
    RETURN v_impersonated_id;
  END IF;
  
  RETURN v_company_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
