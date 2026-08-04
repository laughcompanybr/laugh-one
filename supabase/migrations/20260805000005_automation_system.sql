-- 1. Automation Workflows table
CREATE TABLE IF NOT EXISTS public.automation_workflows (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    name text NOT NULL,
    description text,
    category text DEFAULT 'general',
    status text DEFAULT 'draft', -- draft, published, paused, archived
    trigger_config jsonb NOT NULL DEFAULT '{}'::jsonb, -- { type: 'client_created', conditions: [...] }
    steps jsonb NOT NULL DEFAULT '[]'::jsonb, -- Array of actions/conditions/waits
    created_by uuid REFERENCES auth.users(id),
    version integer DEFAULT 1,
    total_executions integer DEFAULT 0,
    last_executed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.automation_workflows TO authenticated;
GRANT ALL ON public.automation_workflows TO service_role;
ALTER TABLE public.automation_workflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their company workflows"
    ON public.automation_workflows FOR ALL TO authenticated 
    USING (company_id = public.get_user_company_id());

-- 2. Automation Executions (History)
CREATE TABLE IF NOT EXISTS public.automation_executions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    workflow_id uuid REFERENCES public.automation_workflows(id) ON DELETE CASCADE,
    company_id uuid REFERENCES public.companies(id) ON DELETE CASCADE,
    status text DEFAULT 'pending', -- pending, running, completed, failed
    trigger_payload jsonb DEFAULT '{}'::jsonb,
    results jsonb DEFAULT '[]'::jsonb,
    error_message text,
    execution_time_ms integer,
    started_at timestamptz DEFAULT now(),
    completed_at timestamptz
);

GRANT SELECT ON public.automation_executions TO authenticated;
GRANT ALL ON public.automation_executions TO service_role;
ALTER TABLE public.automation_executions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their company executions"
    ON public.automation_executions FOR SELECT TO authenticated 
    USING (company_id = public.get_user_company_id());

-- 3. Registering the Automation Module
INSERT INTO public.modules (id, name, description, icon, category, is_core)
VALUES ('automation', 'Automações', 'Crie fluxos de trabalho inteligentes para automatizar processos.', 'Zap', 'Produtividade', false)
ON CONFLICT (id) DO NOTHING;

-- 4. Automation Queue (for background processing simulations)
CREATE TABLE IF NOT EXISTS public.automation_queue (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id uuid REFERENCES public.automation_executions(id) ON DELETE CASCADE,
    status text DEFAULT 'queued',
    payload jsonb,
    next_step_index integer DEFAULT 0,
    scheduled_for timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

GRANT ALL ON public.automation_queue TO service_role;
