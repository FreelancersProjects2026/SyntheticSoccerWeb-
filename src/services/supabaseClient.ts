import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl: string = import.meta.env.VITE_SUPABASE_URL
const supabaseKey: string = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY in .env.local')
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseKey)
