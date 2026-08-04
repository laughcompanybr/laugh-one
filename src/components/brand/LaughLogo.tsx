import { Laugh } from "lucide-react";

interface LaughLogoProps {
  size?: number;
  className?: string;
  showWordmark?: boolean;
}

export function LaughLogo({ size = 36, className, showWordmark = true }: LaughLogoProps) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <div 
        className="flex items-center justify-center rounded-xl bg-primary shadow-lg"
        style={{ width: size, height: size }}
      >
        <Laugh className="text-primary-foreground" style={{ width: size * 0.6, height: size * 0.6 }} />
      </div>
      {showWordmark && (
        <div className="flex flex-col">
          <span className="font-display text-lg font-bold tracking-tight text-foreground leading-none">Laugh One</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">Company</span>
        </div>
      )}
    </div>
  );
}
