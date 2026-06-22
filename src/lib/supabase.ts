import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Request } from "express";

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
}

const supabaseAnon: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

let supabaseAdmin: SupabaseClient;

if (supabaseServiceKey) {
  supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
} else {
  supabaseAdmin = supabaseAnon;
}

export function createAuthClient(token: string): SupabaseClient {
  const client = createClient(supabaseUrl, supabaseAnonKey);
  client.auth.setSession({ access_token: token, refresh_token: "" });
  return client;
}

export function getAuthClientFromRequest(req: Request): SupabaseClient | null {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return null;
  const token = header.slice(7);
  return createAuthClient(token);
}

export default supabaseAdmin;
export { supabaseAnon };
export type { SupabaseClient };
