import { supabase } from './client'
import type { Session, User } from '@supabase/supabase-js'

export type AuthState = {
  session: Session | null
  user: User | null
}

export async function getSession(): Promise<AuthState> {
  const { data } = await supabase.auth.getSession()
  return {
    session: data.session,
    user: data.session?.user ?? null,
  }
}

export function onAuthStateChange(callback: (state: AuthState) => void) {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback({ session, user: session?.user ?? null })
  })
  return data.subscription
}
