-- 1. Create Companies Table (if it was dropped or needs update)
-- We need to ensure companies table has all necessary visual fields
CREATE TABLE IF NOT EXISTS public.companies (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    display_name text,
    slug text UNIQUE NOT NULL,
    logo_url text,
    logo_reduced_url text,
    favicon_url text,
    mobile_icon_url text,
    
    -- Branding Colors
    primary_color text DEFAULT '#1a1a1a',
    secondary_color text DEFAULT '#f3f4f6',
    accent_color text DEFAULT '#d4af37', -- Gold default
    success_color text DEFAULT '#10b981',
    warning_color text DEFAULT '#f59e0b',
    error_color text DEFAULT '#ef4444',
    
    -- UI Colors
    sidebar_color text DEFAULT '#ffffff',
    navbar_color text DEFAULT '#ffffff',
    button_color text DEFAULT '#1a1a1a',
    card_color text DEFAULT '#ffffff',
    chart_colors jsonb DEFAULT '["#1a1a1a", "#d4af37", "#10b981", "#f59e0b", "#ef4444"]'::jsonb,
    
    -- Typography
    primary_font text DEFAULT 'Inter',
    secondary_font text DEFAULT 'Inter',
    
    -- Login Customization
    login_background_url text,
    login_welcome_message text,
    login_title text,
    login_subtitle text,
    login_footer text,
    login_button_color text,
    login_field_color text,
    login_link_color text,
    
    -- Dashboard Customization
    dash_banner_url text,
    dash_welcome_message text,
    dash_widgets jsonb DEFAULT '[]'::jsonb,
    dash_card_order jsonb DEFAULT '[]'::jsonb,
    
    -- Sidebar Customization
    sidebar_width integer DEFAULT 280,
    sidebar_logo_position text DEFAULT 'top', -- top, center
    sidebar_menu_active_color text,
    sidebar_hover_color text,
    
    -- Navbar Customization
    navbar_height integer DEFAULT 64,
    
    -- Settings
    theme_mode text DEFAULT 'light', -- light, dark, system
    border_radius text DEFAULT '0.5rem',
    shadow_intensity text DEFAULT 'medium', -- low, medium, high
    
    plan_id uuid REFERENCES public.plans(id),
    is_blocked boolean DEFAULT false,
    block_reason text,
    storage_used_bytes bigint DEFAULT 0,
    
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

GRANT SELECT ON public.companies TO authenticated;
GRANT ALL ON public.companies TO service_role;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Add company_id back to business tables for multi-tenancy if missing
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' 
    AND table_name IN ('clients', 'orders', 'products', 'financial_transactions', 'expenses', 'suppliers', 'employees', 'goals', 'profiles')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS company_id uuid REFERENCES public.companies(id)', t);
    END LOOP;
END $$;

-- RLS for companies
CREATE POLICY "Users can view their own company"
    ON public.companies
    FOR SELECT
    TO authenticated
    USING (id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()));

CREATE POLICY "Admins can update their own company"
    ON public.companies
    FOR UPDATE
    TO authenticated
    USING (id = (SELECT company_id FROM public.profiles WHERE id = auth.uid()) 
           AND public.has_role(auth.uid(), 'admin'));

-- Helper function to get current company ID (consistent across the app)
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid AS $$
    SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;
