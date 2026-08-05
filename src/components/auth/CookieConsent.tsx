import { useState, useEffect } from "react";
import { useServerFn } from "@tanstack/react-start";
import { getConsent, saveConsent } from "@/domains/auth/services/consent.functions";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export function CookieConsent() {
  const queryClient = useQueryClient();
  const getConsentFn = useServerFn(getConsent);
  const saveConsentFn = useServerFn(saveConsent);

  const { data: consent, isLoading } = useQuery({
    queryKey: ["user-consent"],
    queryFn: () => getConsentFn({}), // Pass empty object if no input is expected but middleware exists
  });

  const mutation = useMutation({
    mutationFn: (granted: boolean) => saveConsentFn({ data: { granted } }), // Fix type for useServerFn
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user-consent"] }),
  });

  if (isLoading || consent) return null;

  return (
    <div className="fixed bottom-6 left-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500">
      <div className="mx-auto max-w-4xl rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-xl md:flex md:items-center md:justify-between md:gap-8">
        <div className="space-y-1">
          <p className="font-semibold text-white">Privacidade e LGPD</p>
          <p className="text-sm text-white/60">
            Utilizamos cookies para melhorar sua experiência e analisar o tráfego em conformidade com a LGPD. 
            Ao continuar, você concorda com nossa política de dados.
          </p>
        </div>
        <div className="mt-4 flex shrink-0 gap-3 md:mt-0">
          <Button 
            variant="ghost" 
            className="text-white/60 hover:text-white"
            onClick={() => mutation.mutate(false)}
          >
            Recusar
          </Button>
          <Button 
            className="bg-gold hover:bg-gold/90 text-black font-bold"
            onClick={() => mutation.mutate(true)}
          >
            Aceitar Cookies
          </Button>
        </div>
      </div>
    </div>
  );
}
