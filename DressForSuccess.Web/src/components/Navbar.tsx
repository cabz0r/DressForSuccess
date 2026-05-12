import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

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
          {user ? (
            <>
              <Link to="/volunteer/dashboard" className="nav-link">My Dashboard</Link>
              <Link to="/volunteer/bookings" className="nav-link">Bookings</Link>
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

