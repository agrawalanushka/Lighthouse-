import "server-only";
import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Cookie-based server client — for use in API routes and server components only.
// Reads the logged-in user's session from cookies, so supabase.auth.getUser()
// and RLS policies (auth.uid() = user_id) work correctly per-request.
//
// Import this from API routes / server components, NEVER from "use client"
// files. lib/supabase.ts is the browser-safe client.
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // setAll called from a Server Component — safe to ignore
          // if you have middleware refreshing sessions.
        }
      },
    },
  });
}

// Service-role client — bypasses RLS. Use ONLY for trusted server-side work that
// must run without a user session, e.g. Pulse background digest generation and
// caching. Never expose SUPABASE_SERVICE_ROLE_KEY to the browser, and never use
// this to serve per-user data without checking ownership yourself.
export function createServiceRoleClient() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(supabaseUrl, serviceKey);
}
