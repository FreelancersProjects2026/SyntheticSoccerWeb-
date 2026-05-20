import { supabase } from './client'
import type { Reserva, ReservaConDetalles } from '@/types'

export async function getSlotsTomados(canchaId: string, fecha: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('reservas')
    .select('slot_inicio')
    .eq('cancha_id', canchaId)
    .eq('fecha', fecha)
    .in('estado', ['pendiente', 'confirmada'])
  if (error) throw error
  return (data as { slot_inicio: string }[]).map((r) => r.slot_inicio)
}

export async function createReserva(
  values: Pick<Reserva, 'cancha_id' | 'usuario_id' | 'fecha' | 'slot_inicio'>,
): Promise<void> {
  const { error } = await supabase.from('reservas').insert(values)
  if (error) throw error
}

export async function getReservas(): Promise<ReservaConDetalles[]> {
  const { data, error } = await supabase
    .from('reservas')
    .select('*, canchas(nombre), usuarios(nombre)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as ReservaConDetalles[]
}

export async function getMisReservas(usuarioId: string): Promise<ReservaConDetalles[]> {
  const { data, error } = await supabase
    .from('reservas')
    .select('*, canchas(nombre), usuarios(nombre)')
    .eq('usuario_id', usuarioId)
    .order('created_at', { ascending: false })
    .limit(3)
  if (error) throw error
  return data as ReservaConDetalles[]
}

export async function updateReservaEstado(
  id: string,
  estado: 'confirmada' | 'cancelada',
): Promise<void> {
  const { error } = await supabase.from('reservas').update({ estado }).eq('id', id)
  if (error) throw error
}
