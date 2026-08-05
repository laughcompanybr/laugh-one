import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import { checkSuperAdmin } from "./admin.server";
import { PLAN_NAME, calculateExpiry } from "@/domains/tenants/subscriptions/types";

const billingPeriodSchema = z.enum(["monthly", "quarterly", "semiannual", "yearly"]);

export const getPlatformStats = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await checkSuperAdmin(supabase, userId);

    const [companiesRes, activeRes, usersRes, activeSubsRes, expiredSubsRes, subsRes] =
      await Promise.all([
        supabase.from("companies").select("*", { count: "exact", head: true }),
        supabase.from("companies").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "active"),
        supabase.from("subscriptions").select("*", { count: "exact", head: true }).eq("status", "expired"),
        supabase.from("subscriptions").select("amount, billing_period").eq("status", "active"),
      ]);

    const monthsByPeriod: Record<string, number> = {
      monthly: 1,
      quarterly: 3,
      semiannual: 6,
      yearly: 12,
    };

    const mrr = (subsRes.data ?? []).reduce((total, sub: any) => {
      const months = monthsByPeriod[sub.billing_period] ?? 1;
      return total + Number(sub.amount ?? 0) / months;
    }, 0);

    return {
      totalCompanies: companiesRes.count || 0,
      activeCompanies: activeRes.count || 0,
      totalUsers: usersRes.count || 0,
      activeSubscriptions: activeSubsRes.count || 0,
      expiredSubscriptions: expiredSubsRes.count || 0,
      mrr: Math.round(mrr * 100) / 100,
      arr: Math.round(mrr * 12 * 100) / 100,
    };
  });

export const getCompanies = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await checkSuperAdmin(supabase, userId);

    const { data, error } = await supabase
      .from("companies")
      .select("*, subscriptions(id, plan_name, billing_period, status, expires_at)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  });

/** Lista todas as assinaturas da plataforma (plano único + período). */
export const getSubscriptions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await checkSuperAdmin(supabase, userId);

    const { data, error } = await supabase
      .from("subscriptions")
      .select("*, companies(id, name, slug)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  });

export const getSubscriptionPricingAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase, userId } = context;
    await checkSuperAdmin(supabase, userId);

    const { data, error } = await supabase
      .from("subscription_pricing")
      .select("*")
      .order("months", { ascending: true });

    if (error) throw error;
    return data || [];
  });

/** Cria/renova a assinadura do Plano Completo calculando a validade pelo período. */
export const upsertSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        companyId: z.string().uuid(),
        period: billingPeriodSchema,
        startDate: z.string().optional(),
        amount: z.number().nonnegative().optional(),
        notes: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await checkSuperAdmin(supabase, userId);

    const start = data.startDate ? new Date(data.startDate) : new Date();
    const expires = calculateExpiry(start, data.period);

    let amount = data.amount;
    if (amount === undefined) {
      const { data: pricing } = await supabase
        .from("subscription_pricing")
        .select("price")
        .eq("period", data.period)
        .maybeSingle();
      amount = Number(pricing?.price ?? 0);
    }

    // Uma empresa possui no máximo uma assinatura ativa.
    await supabase
      .from("subscriptions")
      .update({ status: "canceled", canceled_at: new Date().toISOString() })
      .eq("company_id", data.companyId)
      .eq("status", "active");

    const { data: created, error } = await supabase
      .from("subscriptions")
      .insert({
        company_id: data.companyId,
        user_id: userId,
        plan_name: PLAN_NAME,
        billing_period: data.period,
        start_date: start.toISOString(),
        expires_at: expires.toISOString(),
        status: "active",
        amount,
        notes: data.notes ?? null,
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from("platform_logs").insert({
      user_id: userId,
      company_id: data.companyId,
      action: "subscription_upsert",
      metadata: { period: data.period, expires_at: expires.toISOString(), amount },
    });

    return created;
  });

export const updateSubscription = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z
      .object({
        id: z.string().uuid(),
        status: z.enum(["active", "expired", "canceled", "suspended"]).optional(),
        expiresAt: z.string().optional(),
      })
      .parse(d),
  )
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await checkSuperAdmin(supabase, userId);

    const patch: Record<string, unknown> = {};
    if (data.status) {
      patch["status"] = data.status;
      if (data.status === "canceled") patch["canceled_at"] = new Date().toISOString();
    }
    if (data.expiresAt) patch["expires_at"] = data.expiresAt;

    const { error } = await supabase.from("subscriptions").update(patch).eq("id", data.id);
    if (error) throw error;

    await supabase.from("platform_logs").insert({
      user_id: userId,
      action: "subscription_update",
      metadata: { subscription_id: data.id, ...patch },
    });

    return { success: true };
  });

export const impersonateCompany = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ companyId: z.string().nullable() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await checkSuperAdmin(supabase, userId);

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ impersonated_company_id: data.companyId })
      .eq("id", userId);

    if (updateError) throw updateError;

    if (data.companyId) {
      await supabase.from("platform_logs").insert({
        user_id: userId,
        company_id: data.companyId,
        action: "impersonation_start",
        metadata: { target_company_id: data.companyId },
      });
    } else {
      await supabase.from("platform_logs").insert({
        user_id: userId,
        action: "impersonation_stop",
      });
    }

    return { success: true };
  });

export const updateCompanyStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ id: z.string(), status: z.string() }).parse(d))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    await checkSuperAdmin(supabase, userId);

    const { error } = await supabase
      .from("companies")
      .update({ status: data.status })
      .eq("id", data.id);

    if (error) throw error;
    return { success: true };
  });
