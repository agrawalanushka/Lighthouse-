import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client — safe to import from "use client" components.
// Uses @supabase/ssr's createBrowserClient (not plain @supabase/supabase-js)
// so that sign-in/sign-up sessions are written to cookies, not just
// localStorage. This is what lets the server client in
// lib/supabase-server.ts read the logged-in user via auth.getUser().
//
// Same API as the old client (auth.signInWithPassword, .from(), etc.) —
// no changes needed in any component that already imports this.
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
