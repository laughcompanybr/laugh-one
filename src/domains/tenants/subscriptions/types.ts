/**
 * Laugh One — Plano único + período de assinatura.
 *
 * Existe apenas UM plano ("Plano Completo") com acesso total à plataforma.
 * A única variação é o período de validade da assinatura.
 */

export const PLAN_NAME = "Plano Completo" as const;

export type BillingPeriod = "monthly" | "quarterly" | "semiannual" | "yearly";

export type SubscriptionStatus = "active" | "expired" | "canceled" | "suspended";

export const BILLING_PERIODS: BillingPeriod[] = [
  "monthly",
  "quarterly",
  "semiannual",
  "yearly",
];

export const PERIOD_LABELS: Record<BillingPeriod, string> = {
  monthly: "Mensal",
  quarterly: "Trimestral",
  semiannual: "Semestral",
  yearly: "Anual",
};

/** Duração de cada período, em dias. */
export const PERIOD_DAYS: Record<BillingPeriod, number> = {
  monthly: 30,
  quarterly: 90,
  semiannual: 180,
  yearly: 365,
};

export const PERIOD_MONTHS: Record<BillingPeriod, number> = {
  monthly: 1,
  quarterly: 3,
  semiannual: 6,
  yearly: 12,
};

export interface SubscriptionPricing {
  period: BillingPeriod;
  label: string;
  months: number;
  days: number;
  price: number;
  savings_percent: number;
}

export interface Subscription {
  id: string;
  company_id: string;
  user_id: string | null;
  plan_name: string;
  billing_period: BillingPeriod;
  start_date: string;
  expires_at: string;
  status: SubscriptionStatus;
  amount: number;
  currency: string;
  gateway: string | null;
  canceled_at: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Calcula a data de expiração a partir do início e do período contratado. */
export function calculateExpiry(startDate: Date, period: BillingPeriod): Date {
  const expires = new Date(startDate);
  expires.setDate(expires.getDate() + PERIOD_DAYS[period]);
  return expires;
}

/** Único critério de acesso: assinatura ativa e dentro da validade. */
export function isSubscriptionActive(
  subscription: Pick<Subscription, "status" | "expires_at"> | null | undefined,
): boolean {
  if (!subscription) return false;
  if (subscription.status !== "active") return false;
  return new Date(subscription.expires_at).getTime() > Date.now();
}

export function formatPrice(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
