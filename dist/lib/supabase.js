"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabaseAnon = void 0;
exports.createAuthClient = createAuthClient;
const supabase_js_1 = require("@supabase/supabase-js");
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";
if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY environment variables");
}
const supabaseAnon = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false,
    },
});
exports.supabaseAnon = supabaseAnon;
let supabaseAdmin;
if (supabaseServiceKey) {
    supabaseAdmin = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}
else {
    supabaseAdmin = supabaseAnon;
}
function createAuthClient(token) {
    const client = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
    client.auth.setSession({ access_token: token, refresh_token: "" });
    return client;
}
exports.default = supabaseAdmin;
//# sourceMappingURL=supabase.js.map