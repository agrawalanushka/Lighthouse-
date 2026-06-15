import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Server client — for use in API routes and server components only.
// Reads the logged-in user's session from cookies, so
// supabase.auth.getUser() and RLS policies (auth.uid() = user_id)
// work correctly per-request.
//
// Import this from API routes / server components, NEVER from
// "use client" files. lib/supabase.ts is the browser-safe client.
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
