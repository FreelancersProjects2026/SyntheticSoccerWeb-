export type Cancha = {
  id: string
  nombre: string
  tipo: 'futbol5' | 'futbol7' | 'futbol11'
  slots_por_dia: number
  precio_por_slot: number
  estado: 'activa' | 'inactiva'
  descripcion: string | null
  imagen_url: string | null
  created_at: string
}
