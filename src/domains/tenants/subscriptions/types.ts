/**
 * Laugh One SaaS Subscription Management
 * 
 * This file defines the core architecture for the SaaS multi-tenant subscription system.
 * It provides interfaces for payment providers and centralizes the logic for
 * subscription lifecycle (trial, active, overdue, suspended, etc.).
 */

export type SubscriptionStatus = 
  | 'trial'
  | 'active'
  | 'pending'
  | 'overdue'
  | 'suspended'
  | 'canceled'
  | 'expired';

export type BillingFrequency = 'monthly' | 'yearly';

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price_monthly: number;
  price_yearly: number;
  trial_days: number;
  max_users: number;
  max_clients: number;
  max_products: number;
  storage_gb: number;
  max_uploads: number;
  modules: string[];
  integrations: string[];
  support_tier: 'standard' | 'priority' | '24/7';
  active: boolean;
}

export interface Subscription {
  id: string;
  company_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  start_date: string;
  renewal_date: string;
  expiry_date: string | null;
  canceled_at: string | null;
  is_trial: boolean;
  gateway: string | null;
  amount: number;
  currency: string;
  frequency: BillingFrequency;
}

/**
 * Payment Provider Interface
 * New gateways (Stripe, Mercado Pago, Asaas, etc.) must implement this interface.
 */
export interface PaymentProvider {
  name: string;
  createSubscription(params: {
    companyId: string;
    planId: string;
    frequency: BillingFrequency;
    couponCode?: string;
  }): Promise<{ gatewayId: string; checkoutUrl: string }>;
  
  cancelSubscription(gatewayId: string): Promise<void>;
  
  handleWebhook(payload: any): Promise<void>;
}

/**
 * Usage Limits Interface
 */
export interface CompanyUsage {
  users_count: number;
  clients_count: number;
  products_count: number;
  storage_bytes: number;
  uploads_count: number;
}
