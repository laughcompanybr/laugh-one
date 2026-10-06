import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const COOKIE_VERSION = "2026-10-01";
const STORAGE_KEY = "laugh-one-cookie-consent";

type Preferences = { analytics: boolean; marketing: boolean; preferences: boolean };

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [prefs, setPrefs] = useState<Preferences>({ analytics: false, marketing: false, preferences: false });

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) setVisible(true);
  }, []);

  const save = async (preferences: Preferences) => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...preferences, necessary: true, version: COOKIE_VERSION }));
    setVisible(false);
    const { data: sessionData } = await supabase.auth.getSession();
    if (sessionData.session?.user) {
      await supabase.rpc("record_cookie_consent", {
        p_consent_version: COOKIE_VERSION,
        p_analytics: preferences.analytics,
        p_marketing: preferences.marketing,
        p_preferences: preferences.preferences,
        p_user_agent: navigator.userAgent,
      });
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[100] border-t border-white/10 bg-black/95 p-4 shadow-2xl backdrop-blur-xl">
      <div className="mx-auto max-w-5xl space-y-4">
        <div>
          <p className="font-semibold text-white">Cookies e privacidade</p>
          <p className="mt-1 text-sm text-white/70">
            Usamos cookies estritamente necessários para o funcionamento do Laugh One. Cookies analíticos,
            de preferências e marketing somente serão utilizados se você autorizar. Saiba mais na{" "}
            <Link to={"/cookies" as never} className="text-gold hover:underline">Política de Cookies</Link>.
          </p>
        </div>

        {showPreferences && (
          <div className="grid gap-3 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 md:grid-cols-3">
            <label className="flex gap-2"><input type="checkbox" checked={prefs.preferences} onChange={(e) => setPrefs({ ...prefs, preferences: e.target.checked })} /> Preferências</label>
            <label className="flex gap-2"><input type="checkbox" checked={prefs.analytics} onChange={(e) => setPrefs({ ...prefs, analytics: e.target.checked })} /> Analíticos</label>
            <label className="flex gap-2"><input type="checkbox" checked={prefs.marketing} onChange={(e) => setPrefs({ ...prefs, marketing: e.target.checked })} /> Marketing</label>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="border-white/20 text-white hover:bg-white/10" onClick={() => void save({ analytics: false, marketing: false, preferences: false })}>Recusar não essenciais</Button>
          <Button variant="ghost" className="text-white/70 hover:text-white" onClick={() => setShowPreferences((v) => !v)}>Personalizar</Button>
          {showPreferences ? (
            <Button className="bg-gold text-black hover:bg-gold/90" onClick={() => void save(prefs)}>Salvar preferências</Button>
          ) : (
            <Button className="bg-gold text-black hover:bg-gold/90" onClick={() => void save({ analytics: true, marketing: true, preferences: true })}>Aceitar todos</Button>
          )}
        </div>
      </div>
    </div>
  );
}
