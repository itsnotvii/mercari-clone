import { supabase } from './supabase'

export async function signUp(email: string, password: string, username: string) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error

  await supabase.from('profiles').insert({
    id: data.user!.id,
    username,
  })

  return data
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}
