import { useQuery, useMutation } from "@tanstack/react-query";
import { getImpersonationStatus, stopImpersonation } from "@/features/admin/impersonation.functions";
import { ShieldAlert, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function ImpersonationBanner() {
  const { data: status, isLoading } = useQuery({
    queryKey: ["impersonation-status"],
    queryFn: () => getImpersonationStatus(),
  });

  const stopMutation = useMutation({
    mutationFn: () => stopImpersonation(),
    onSuccess: () => {
      toast.success("Sessão de suporte encerrada.");
      window.location.href = "/admin/empresas";
    }
  });

  if (isLoading || !status) return null;

  return (
    <div className="bg-gold text-gold-foreground px-4 py-2 flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-300 sticky top-0 z-[60]">
      <div className="flex items-center gap-2 text-sm font-bold">
        <ShieldAlert className="size-4 animate-pulse" />
        Você está visualizando a plataforma como: <span className="underline decoration-2 underline-offset-2">{status.companyName}</span> (Modo Suporte)
      </div>
      <Button 
        variant="secondary" 
        size="sm" 
        className="h-7 text-xs font-bold gap-2"
        onClick={() => stopMutation.mutate()}
      >
        <LogOut className="size-3" />
        Encerrar Impersonificação
      </Button>
    </div>
  );
}
