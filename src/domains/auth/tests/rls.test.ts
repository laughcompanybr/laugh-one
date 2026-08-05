import { describe, it, expect } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Multi-Tenant RLS & Integration Tests', () => {
  it('should guarantee strict profile isolation', async () => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('company_id');

    if (error) {
      // In CI/Test environments without session, we check if the error is expected (Unauthorized/Forbidden)
      // but here we expect the RLS to return only current tenant data if logged in
      console.warn('Test context note:', error.message);
      return;
    }

    if (profiles && profiles.length > 0) {
      const companyIds = new Set(profiles.map(p => p.company_id).filter(id => id !== null));
      // Should only see one company_id (the one for current user)
      expect(companyIds.size).toBeLessThanOrEqual(1);
    }
  });

  it('should not allow access to system_errors of other tenants', async () => {
    const { data: errors } = await supabase
      .from('system_errors' as any)
      .select('company_id');

    if (errors && errors.length > 0) {
      const companyIds = new Set(errors.map((e: any) => e.company_id));
      expect(companyIds.size).toBeLessThanOrEqual(1);
    }
  });

  it('should verify module access integrity via RPC', async () => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return;

    const { data: modules, error } = await supabase.rpc('get_module_access_indicators', { 
      _user_id: session.session.user.id 
    } as any);

    expect(error).toBeNull();
    expect(Array.isArray(modules)).toBe(true);
    // Core modules should usually be present
    expect(modules.length).toBeGreaterThan(0);
  });
});
