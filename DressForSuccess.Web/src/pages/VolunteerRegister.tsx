import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { register } from '../api'
import { useAuth } from '../context/AuthContext'

const VolunteerRegister: React.FC = () => {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirm: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return }
    setError(''); setLoading(true)
    try {
      const res = await register({ firstName: form.firstName, lastName: form.lastName, email: form.email, phone: form.phone, password: form.password })
      login(res.data)
      navigate('/volunteer/dashboard')
    } catch (err: any) {
      setError(err?.response?.data || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: 480 }}>
        <div className="auth-logo">
          <div className="logo-circle">🌟</div>
          <h2>Create Volunteer Account</h2>
          <p>Join our team and make a difference</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input className="form-control" value={form.firstName} onChange={set('firstName')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input className="form-control" value={form.lastName} onChange={set('lastName')} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input className="form-control" type="email" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-control" type="tel" value={form.phone} onChange={set('phone')} required />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-control" type="password" value={form.password} onChange={set('password')} required minLength={6} />
            </div>
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input className="form-control" type="password" value={form.confirm} onChange={set('confirm')} required />
            </div>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <hr className="divider" />
        <p className="text-center text-muted" style={{ fontSize: '0.9rem' }}>
          Already have an account? <Link to="/volunteer/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}

export default VolunteerRegister

