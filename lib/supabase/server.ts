import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export const createClient = () => {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Membaca cookie dari request server
        detectSessionInUrl: false,
        persistSession: true,
        storage: {
          getItem: (key) => cookies().get(key)?.value ?? null,
          setItem: (key, value) => cookies().set(key, value),
          removeItem: (key) => cookies().delete(key),
        },
      },
    }
  )
}
