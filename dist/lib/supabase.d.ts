import { SupabaseClient } from "@supabase/supabase-js";
declare const supabaseAnon: SupabaseClient;
declare let supabaseAdmin: SupabaseClient;
export declare function createAuthClient(token: string): SupabaseClient;
export default supabaseAdmin;
export { supabaseAnon };
//# sourceMappingURL=supabase.d.ts.map