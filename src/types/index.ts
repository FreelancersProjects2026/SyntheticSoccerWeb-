export type Cancha = {
  id: string
  nombre: string
  tipo: 'futbol5' | 'futbol6' | 'futbol7' | 'futbol11'
  slots_por_dia: number
  precio_por_slot: number
  estado: 'activa' | 'inactiva'
  descripcion: string | null
  imagen_url: string | null
  created_at: string
}

export type Reserva = {
  id: string
  cancha_id: string
  usuario_id: string
  fecha: string
  slot_inicio: string
  estado: 'pendiente' | 'confirmada' | 'cancelada'
  created_at: string
}

export type ReservaConDetalles = Reserva & {
  canchas: { nombre: string }
  usuarios: { nombre: string }
}
