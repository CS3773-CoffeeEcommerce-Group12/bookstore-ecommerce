import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Frontend client (safe: uses anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Optional: admin client for server-only code (DO NOT import in client components)
// Use only in server routes / server actions:
export const getAdminClient = () => {
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient(supabaseUrl, serviceRole)
}
