import React, { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getVolunteerNotifications, markNotificationRead, markAllRead, AppNotification } from '../api'

const eventIcon: Record<string, string> = {
  BookingAssigned: '📋',
  BookingCancelled: '❌',
  BookingCompleted: '✅',
  BookingReminder: '⏰'
}

const eventColor: Record<string, string> = {
  BookingAssigned: '#dbeafe',
  BookingCancelled: '#fee2e2',
  BookingCompleted: '#d1fae5',
  BookingReminder: '#fef3c7'
}

const typeIcon: Record<string, string> = {
  Email: '📧',
  SMS: '📱'
}

const Notifications: React.FC = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unread' | 'BookingAssigned' | 'BookingCancelled'>('all')
  const [expanded, setExpanded] = useState<number | null>(null)

  const load = async () => {
    if (!user) return
    const res = await getVolunteerNotifications(user.id)
    setNotifications(res.data)
    setLoading(false)
  }

  useEffect(() => { load() }, [user])

  const handleMarkRead = async (id: number) => {
    await markNotificationRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
  }

  const handleMarkAllRead = async () => {
    if (!user) return
    await markAllRead(user.id)
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  const filtered = notifications.filter(n => {
    if (filter === 'unread') return !n.isRead
    if (filter === 'BookingAssigned') return n.event === 'BookingAssigned'
    if (filter === 'BookingCancelled') return n.event === 'BookingCancelled'
    return true
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>🔔 Notifications</h1>
          <p className="text-muted">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="btn btn-primary btn-sm" onClick={handleMarkAllRead}>
            ✓ Mark All Read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="tabs">
        {([
          { key: 'all', label: `All (${notifications.length})` },
          { key: 'unread', label: `Unread (${unreadCount})` },
          { key: 'BookingAssigned', label: '📋 Assigned' },
          { key: 'BookingCancelled', label: '❌ Cancelled' },
        ] as const).map(t => (
          <button key={t.key} className={`tab-btn ${filter === t.key ? 'active' : ''}`}
            onClick={() => setFilter(t.key as any)}>
            {t.label}
          </button>
        ))}
      </div>

      {loading ? <div className="spinner" /> : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔕</div>
          <p>No notifications in this category.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filtered.map(n => (
            <div key={n.id}
              style={{
                background: n.isRead ? 'white' : eventColor[n.event] || '#f3f4f6',
                borderRadius: 'var(--radius)',
                padding: '1.25rem',
                boxShadow: n.isRead ? 'none' : 'var(--shadow)',
                border: n.isRead ? '1px solid var(--border)' : '2px solid ' + (n.event === 'BookingCancelled' ? '#fca5a5' : '#93c5fd'),
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              onClick={() => {
                setExpanded(expanded === n.id ? null : n.id)
                if (!n.isRead) handleMarkRead(n.id)
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem' }}>{eventIcon[n.event] || '📨'}</span>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '0.95rem' }}>{n.subject}</strong>
                      {!n.isRead && (
                        <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }} />
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      <span>{typeIcon[n.type] || '📨'} {n.type}</span>
                      <span>To: {n.recipient}</span>
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {n.isSent && (
                    <span className="badge badge-completed" style={{ fontSize: '0.7rem' }}>✓ Sent</span>
                  )}
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    {expanded === n.id ? '▲' : '▼'}
                  </span>
                </div>
              </div>

              {expanded === n.id && (
                <div style={{
                  marginTop: '1rem', padding: '1rem',
                  background: 'white', borderRadius: '8px',
                  border: '1px solid var(--border)',
                  whiteSpace: 'pre-wrap', fontSize: '0.88rem',
                  lineHeight: 1.7, color: 'var(--text)'
                }}>
                  {n.body}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Mock delivery info */}
      <div className="card" style={{ marginTop: '2rem' }}>
        <div className="card-body" style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>📡 Notification Delivery (Mock)</h3>
          <p className="text-muted" style={{ fontSize: '0.88rem' }}>
            In production, emails are sent via SMTP/SendGrid and SMS via Twilio.
            This prototype logs all notifications for review. All shown as "Sent" for demonstration.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Notifications

