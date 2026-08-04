import { supabase } from "@/integrations/supabase/client";
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/**
 * Backend utility to check if a company has exceeded its plan limits.
 * This should be used in server functions before performing write operations.
 */
export const checkPlanLimits = async (companyId: string, resource: 'users' | 'clients' | 'products' | 'storage' | 'uploads') => {
  // Logic to fetch current usage and plan limits
  // If exceeded, throw an error or return false
  return true; 
};

/**
 * Validates the current subscription status of a company.
 * Returns true if the company is allowed to perform operations.
 */
export const validateSubscription = async (companyId: string) => {
  const { data: company, error } = await supabase
    .from('companies')
    .select('is_blocked, plan_id')
    .eq('id', companyId)
    .single();

  if (error || !company) return false;
  if (company.is_blocked) return false;
  
  // Additional logic for subscription expiry check
  return true;
};

export const getCompanyUsage = createServerFn({ method: "GET" })
  .inputValidator(z.object({ companyId: z.string() }))
  .handler(async ({ data }) => {
    // In a real implementation, this would aggregate counts from clients, users, products tables
    // and compare against the company's plan limits.
    return {
      users: { current: 3, limit: 5, percent: 60 },
      clients: { current: 45, limit: 100, percent: 45 },
      products: { current: 12, limit: 50, percent: 24 },
      storage: { current: 250 * 1024 * 1024, limit: 1024 * 1024 * 1024, percent: 25 },
    };
  });
