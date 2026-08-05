import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getMySubscription } from "./subscriptions.functions";
import { isSubscriptionActive, type Subscription } from "./types";
import { useHasSession } from "@/hooks/use-session";

/**
 * Único controle de acesso do produto: "o usuário possui assinatura ativa?".
 * Não existe verificação por tipo de plano.
 */
export function useSubscription() {
  const hasSession = useHasSession();
  const fetchSubscription = useServerFn(getMySubscription);

  const query = useQuery({
    queryKey: ["my-subscription"],
    queryFn: () => fetchSubscription(),
    enabled: hasSession,
    retry: false,
    staleTime: 60_000,
  });

  const subscription = (query.data ?? null) as Subscription | null;

  return {
    subscription,
    isLoading: query.isLoading,
    hasActiveSubscription: isSubscriptionActive(subscription),
    expiresAt: subscription ? new Date(subscription.expires_at) : null,
  };
}
