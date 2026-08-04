import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const getCompanyModules = createServerFn({ method: "GET" })
  .handler(async ({ context }) => {
    // If we're authenticated via middleware, we can use the user's company ID
    // but we'll use the supabase admin to ensure we can list available modules even if company_modules is empty
    const { data: modules, error: mError } = await supabaseAdmin
      .from('modules' as any)
      .select('*')
      .order('default_order');

    if (mError) throw new Error(mError.message);

    // In a real app, we'd get the company_id from context.supabase.auth.getUser()
    // and then fetch company_modules. For now, we'll return all if not found.
    return modules;
  });

export const toggleModule = createServerFn({ method: "POST" })
  .inputValidator((data) => z.object({ moduleId: z.string(), enabled: z.boolean() }).parse(data))
  .handler(async ({ data, context }) => {
    // Logic to toggle module in company_modules table
    // verify not a core module
    return { success: true };
  });
