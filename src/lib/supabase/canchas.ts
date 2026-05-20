import { supabase } from './client'
import type { Cancha } from '@/types'

export async function getCanchas(): Promise<Cancha[]> {
  const { data, error } = await supabase
    .from('canchas')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as Cancha[]
}

export async function createCancha(
  values: Omit<Cancha, 'id' | 'created_at'>,
): Promise<Cancha> {
  const { data, error } = await supabase
    .from('canchas')
    .insert(values)
    .select()
    .single()
  if (error) throw error
  return data as Cancha
}

export async function updateCancha(
  id: string,
  values: Partial<Omit<Cancha, 'id' | 'created_at'>>,
): Promise<Cancha> {
  const { data, error } = await supabase
    .from('canchas')
    .update(values)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data as Cancha
}

export async function uploadCanchaImage(file: File): Promise<string> {
  const ext = file.name.split('.').pop() ?? 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage
    .from('canchas-images')
    .upload(path, file, { upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('canchas-images').getPublicUrl(path)
  return data.publicUrl
}
