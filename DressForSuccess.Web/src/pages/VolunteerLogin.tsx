import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { login as apiLogin } from '../api'
import { useAuth } from '../context/AuthContext'

const VolunteerLogin: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await apiLogin(email, password)
      login(res.data)
      navigate('/volunteer/dashboard')
    } catch {
      setError('Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-circle">⭐</div>
          <h2>Volunteer Login</h2>
          <p>Access your volunteer dashboard</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" type="email" value={email}
              onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-control" type="password" value={password}
              onChange={e => setPassword(e.target.value)} required placeholder="••••••••" />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}
            type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <hr className="divider" />
        <p className="text-center text-muted" style={{ fontSize: '0.9rem' }}>
          New volunteer? <Link to="/volunteer/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create an account</Link>
        </p>
        <p className="text-center mt-2">
          <Link to="/" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>← Back to home</Link>
        </p>
      </div>
    </div>
  )
}

export default VolunteerLogin

