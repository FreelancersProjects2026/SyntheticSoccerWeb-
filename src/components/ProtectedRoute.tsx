import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

type Props = {
  children: React.ReactNode
  requiredRole?: 'admin' | 'user'
}

export default function ProtectedRoute({ children, requiredRole }: Props) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F9F9F8]">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#072f1a]/20 border-t-[#072f1a]" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  if (requiredRole && profile?.rol !== requiredRole) return <Navigate to="/" replace />

  return <>{children}</>
}
