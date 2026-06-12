/**
 * ⚙️ CONFIG SUPABASE — colle ici les 2 valeurs de ton projet.
 * (Project Settings → API)
 *
 * La clé "anon public" est conçue pour être publique : sans danger dans le repo.
 * On n'utilise que le temps réel (broadcast/presence), pas de table sensible.
 */
export const SUPABASE_URL = "https://xhpjzfdypsxxrxxwusjm.supabase.co";
export const SUPABASE_ANON_KEY = "sb_publishable_apk2ryIAdlgknTCbOnbGPw_gykIYtM4";

export function isSupabaseConfigured(): boolean {
  return (
    SUPABASE_URL.startsWith("https://") &&
    (SUPABASE_ANON_KEY.startsWith("ey") || SUPABASE_ANON_KEY.startsWith("sb_"))
  );
}
