import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getVolunteerBookings, Booking } from '../api'

const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    getVolunteerBookings(user.id).then(r => setBookings(r.data)).finally(() => setLoading(false))
  }, [user])

  const upcoming = bookings.filter(b => b.status === 'Scheduled' || b.status === 'Confirmed')
  const completed = bookings.filter(b => b.status === 'Completed')
  const cancelled = bookings.filter(b => b.status === 'Cancelled')

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.firstName}! 👋</h1>
          <p className="text-muted">Here's your volunteer activity overview</p>
        </div>
        <Link to="/volunteer/bookings" className="btn btn-primary">View All Bookings</Link>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-num">{bookings.length}</div>
          <div className="stat-label">Total Bookings Assigned</div>
        </div>
        <div className="stat-card" style={{ borderColor: '#f59e0b' }}>
          <div className="stat-num" style={{ color: '#f59e0b' }}>{upcoming.length}</div>
          <div className="stat-label">Upcoming Appointments</div>
        </div>
        <div className="stat-card" style={{ borderColor: '#10b981' }}>
          <div className="stat-num" style={{ color: '#10b981' }}>{completed.length}</div>
          <div className="stat-label">Completed Sessions</div>
        </div>
        <div className="stat-card" style={{ borderColor: '#ef4444' }}>
          <div className="stat-num" style={{ color: '#ef4444' }}>{cancelled.length}</div>
          <div className="stat-label">Cancellations</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>📅 Upcoming Appointments</h2>
        </div>
        <div className="card-body">
          {loading ? <div className="spinner" /> :
            upcoming.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>No upcoming appointments assigned to you yet.</p>
              </div>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Client</th><th>Date & Time</th><th>Service</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {upcoming.map(b => (
                      <tr key={b.id}>
                        <td><strong>{b.client.firstName} {b.client.lastName}</strong><br /><small className="text-muted">{b.client.phone}</small></td>
                        <td>{new Date(b.appointmentDate).toLocaleString()}</td>
                        <td>{b.serviceType}</td>
                        <td><span className={`badge badge-${b.status.toLowerCase()}`}>{b.status}</span></td>
                        <td><Link to="/volunteer/bookings" className="btn btn-sm btn-primary">Manage</Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}

export default VolunteerDashboard

