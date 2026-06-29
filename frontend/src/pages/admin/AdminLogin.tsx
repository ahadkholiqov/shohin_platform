import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, ApiError, setAdminToken } from '../../api/client'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!token.trim()) {
      setError('Введите токен')
      return
    }
    setLoading(true)
    setError('')
    try {
      await api.login(token.trim())
      setAdminToken(token.trim())
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? 'Неверный токен' : 'Ошибка входа')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="admin-login">
      <form className="admin-login-card" onSubmit={handleSubmit}>
        <div className="admin-login-logo">
          <div className="admin-login-mark">
            <svg viewBox="0 0 24 24">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          </div>
          <div>
            <div className="admin-login-title">ЖК Shohin Plaza</div>
            <div className="admin-login-subtitle">Панель администратора</div>
          </div>
        </div>

        <div className="admin-login-heading">Вход</div>
        <div className="admin-login-sub">Введите токен для доступа к панели</div>

        <div className="admin-field">
          <label htmlFor="admin-token">Токен администратора</label>
          <input
            id="admin-token"
            type="password"
            required
            autoComplete="off"
            placeholder="••••••••••••••••"
            value={token}
            onChange={(e) => {
              setToken(e.target.value)
              if (error) setError('')
            }}
          />
        </div>

        {error && <div className="admin-login-error">{error}</div>}

        <button type="submit" className="admin-btn-login" disabled={loading}>
          {loading ? 'Вход…' : 'Войти'}
        </button>

        <div className="admin-login-footer">Доступ только для администратора</div>
      </form>
    </div>
  )
}
