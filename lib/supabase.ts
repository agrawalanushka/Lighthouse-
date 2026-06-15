import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Browser client — safe to import from "use client" components.
// Does NOT depend on next/headers.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
