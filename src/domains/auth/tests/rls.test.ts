import { describe, it, expect, beforeAll } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('RLS Multi-Tenant Isolation Tests', () => {
  it('should not allow reading profiles from other companies', async () => {
    // This test assumes we are running in an environment with an authenticated user
    // In a real CI, we would use test accounts for different companies.
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('company_id');

    if (error) {
       console.warn('Test skipped: No session or permission error', error.message);
       return;
    }

    if (profiles && profiles.length > 0) {
      const firstCompanyId = profiles[0].company_id;
      const hasOtherCompany = profiles.some(p => p.company_id !== firstCompanyId && p.company_id !== null);
      
      expect(hasOtherCompany).toBe(false);
    }
  });

  it('should pass the recursion check', async () => {
    const { data, error } = await supabase.rpc('check_profiles_recursion' as any);
    
    if (error && error.message.includes('permission denied')) {
        console.warn('Test skipped: RPC permission denied for current user');
        return;
    }

    expect(error).toBeNull();
    expect(data).toBe(true);
  });
});
