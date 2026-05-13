import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getUnreadCount } from '../api'

const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (!user) return
    getUnreadCount(user.id).then(r => setUnread(r.data.count)).catch(() => {})
    const interval = setInterval(() => {
      getUnreadCount(user.id).then(r => setUnread(r.data.count)).catch(() => {})
    }, 15000)
    return () => clearInterval(interval)
  }, [user])

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="logo-icon">👗</div>
          <span>Dress for Success</span>
        </Link>
        <div className="navbar-links">
          <Link to="/store" className="nav-link">Store</Link>
          <Link to="/outfit-builder" className="nav-link">👗 Outfit Builder</Link>
          <Link to="/insights" className="nav-link">📊 Insights</Link>
          {user ? (
            <>
              <Link to="/volunteer/dashboard" className="nav-link">My Dashboard</Link>
              <Link to="/volunteer/bookings" className="nav-link">Bookings</Link>
              <Link to="/volunteer/notifications" className="nav-link" style={{ position: 'relative' }}>
                🔔
                {unread > 0 && (
                  <span style={{
                    position: 'absolute', top: -2, right: -6,
                    background: 'var(--danger)', color: 'white',
                    borderRadius: '50%', width: 18, height: 18,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.65rem', fontWeight: 700
                  }}>{unread}</span>
                )}
              </Link>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Hi, {user.firstName}</span>
              <button className="nav-btn outline" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/volunteer/login" className="nav-btn outline">Volunteer Login</Link>
              <Link to="/client-services" className="nav-btn">Client Services</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar

