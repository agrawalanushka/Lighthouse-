import { createClient } from "@supabase/supabase-js";

// Server-only client — uses the service role key.
// Import this ONLY in API routes and server components, never in client components.
// Never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
export function createServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, serviceKey);
}
