import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import type { SubscriptionPricing } from "./types";

/** Preços públicos por período (mesmo plano, durações diferentes). */
export const getSubscriptionPricing = createServerFn({ method: "GET" }).handler(
  async (): Promise<SubscriptionPricing[]> => {
    const url =
      process.env["SUPABASE_URL"] ||
      process.env["VITE_SUPABASE_URL"] ||
      "https://khxlvybhhzcvbtktwidt.supabase.co";
    const key =
      process.env["SUPABASE_PUBLISHABLE_KEY"] ||
      process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ||
      "sb_publishable_Ud9ed0E_C9ykriZFIj7lqA_skx_ugHO";

    const supabasePublic = createClient<Database>(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input, init) => {
          const headers = new Headers(init?.headers);
          if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
            headers.delete("Authorization");
          }
          headers.set("apikey", key);
          return fetch(input, { ...init, headers });
        },
      },
    });

    const { data, error } = await supabasePublic
      .from("subscription_pricing")
      .select("period, label, months, days, price, savings_percent")
      .order("months", { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []) as SubscriptionPricing[];
  },
);

/** Assinatura da empresa do usuário autenticado. */
export const getMySubscription = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;

    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id, impersonated_company_id")
      .eq("id", userId)
      .maybeSingle();

    const companyId = profile?.impersonated_company_id ?? profile?.company_id;
    if (!companyId) return null;

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
  });
