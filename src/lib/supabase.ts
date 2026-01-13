import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Client pour le navigateur
let supabaseClient: SupabaseClient | null = null;

export const supabase = (() => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // Retourner un client mock pendant le build
    console.warn('Supabase URL ou clé non configurée');
    return null as unknown as SupabaseClient;
  }
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseClient;
})();

// Client pour les opérations serveur (avec service role)
export const createServerSupabaseClient = (): SupabaseClient => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  if (!supabaseUrl || !supabaseServiceKey) {
    console.warn('Supabase configuration manquante pour le serveur');
    return null as unknown as SupabaseClient;
  }

  return createClient(supabaseUrl, supabaseServiceKey);
};
