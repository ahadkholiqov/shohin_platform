import { useEffect } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { ADMIN_UNAUTHORIZED_EVENT, getAdminToken } from '../../api/client'

export default function RequireAdmin() {
  const navigate = useNavigate()
  const hasToken = getAdminToken().length > 0

  useEffect(() => {
    const onUnauthorized = () => navigate('/admin/login', { replace: true })
    window.addEventListener(ADMIN_UNAUTHORIZED_EVENT, onUnauthorized)
    return () => window.removeEventListener(ADMIN_UNAUTHORIZED_EVENT, onUnauthorized)
  }, [navigate])

  if (!hasToken) return <Navigate to="/admin/login" replace />

  return <Outlet />
}
