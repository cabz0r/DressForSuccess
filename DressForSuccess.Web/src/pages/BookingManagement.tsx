import React, { useEffect, useState } from 'react'
import { getBookings, getVolunteers, assignVolunteer, completeBooking, cancelBooking, Booking, Volunteer } from '../api'

const statusBadge = (s: string) => <span className={`badge badge-${s.toLowerCase().replace(' ', '')}`}>{s}</span>

const BookingManagement: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming')
  const [modal, setModal] = useState<{ type: string; booking: Booking } | null>(null)
  const [actionData, setActionData] = useState({ volunteerId: '', notes: '', reason: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [unassignedOnly, setUnassignedOnly] = useState(false)

  const load = async () => {
    const [b, v] = await Promise.all([getBookings(), getVolunteers()])
    setBookings(b.data); setVolunteers(v.data); setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = bookings.filter(b => {
    if (tab === 'all') return true
    if (tab === 'upcoming') return b.status === 'Scheduled' || b.status === 'Confirmed'
    if (tab === 'completed') return b.status === 'Completed'
    if (tab === 'cancelled') return b.status === 'Cancelled' || b.status === 'NoShow'
    return true
  }).filter(b => !unassignedOnly || !b.volunteerId)

  const handleAssign = async () => {
    if (!modal || !actionData.volunteerId) return
    setSaving(true)
    await assignVolunteer(modal.booking.id, Number(actionData.volunteerId))
    setMsg('Volunteer assigned successfully!'); setModal(null)
    await load(); setSaving(false)
  }

  const handleComplete = async () => {
    if (!modal) return
    setSaving(true)
    await completeBooking(modal.booking.id, actionData.notes)
    setMsg('Booking marked as completed!'); setModal(null)
    await load(); setSaving(false)
  }

  const handleCancel = async () => {
    if (!modal) return
    setSaving(true)
    await cancelBooking(modal.booking.id, actionData.reason)
    setMsg('Booking cancelled.'); setModal(null)
    await load(); setSaving(false)
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>📋 Booking Management</h1>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}

      <div className="tabs">
        {(['upcoming', 'all', 'completed', 'cancelled'] as const).map(t => (
          <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.9rem', cursor: 'pointer' }}>
        <input type="checkbox" checked={unassignedOnly} onChange={e => setUnassignedOnly(e.target.checked)}
          style={{ width: 18, height: 18, accentColor: 'var(--primary)', cursor: 'pointer' }} />
        Show only unassigned bookings
      </label>

      <div className="card">
        <div className="card-body">
          {loading ? <div className="spinner" /> : filtered.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">📭</div><p>No bookings in this category.</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Client</th><th>Date & Time</th><th>Service</th><th>Assigned Volunteer</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id}>
                      <td>
                        <strong>{b.client.firstName} {b.client.lastName}</strong>
                        <br /><small className="text-muted">{b.client.email}</small>
                      </td>
                      <td>{new Date(b.appointmentDate).toLocaleString()}</td>
                      <td>{b.serviceType}</td>
                      <td>{b.volunteer ? `${b.volunteer.firstName} ${b.volunteer.lastName}` : <span className="text-muted">Unassigned</span>}</td>
                      <td>{statusBadge(b.status)}</td>
                      <td>
                        <div className="flex gap-1">
                          {(b.status === 'Scheduled' || b.status === 'Confirmed') && (
                            <>
                              <button className="btn btn-sm btn-primary"
                                onClick={() => { setModal({ type: 'assign', booking: b }); setActionData({ volunteerId: '', notes: '', reason: '' }) }}>
                                Assign
                              </button>
                              <button className="btn btn-sm btn-success"
                                onClick={() => { setModal({ type: 'complete', booking: b }); setActionData({ volunteerId: '', notes: '', reason: '' }) }}>
                                Complete
                              </button>
                              <button className="btn btn-sm btn-danger"
                                onClick={() => { setModal({ type: 'cancel', booking: b }); setActionData({ volunteerId: '', notes: '', reason: '' }) }}>
                                Cancel
                              </button>
                            </>
                          )}
                          {b.status === 'Completed' && b.outcomeNotes && (
                            <span className="text-muted" style={{ fontSize: '0.8rem' }}>✓ Notes recorded</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Assign Volunteer Modal */}
      {modal?.type === 'assign' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Volunteer</h2>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <p className="text-muted" style={{ marginBottom: '1.25rem' }}>
              Assigning to: <strong>{modal.booking.client.firstName} {modal.booking.client.lastName}</strong> on {new Date(modal.booking.appointmentDate).toLocaleString()}
            </p>
            <div className="form-group">
              <label className="form-label">Select Volunteer</label>
              <select className="form-control" value={actionData.volunteerId}
                onChange={e => setActionData(prev => ({ ...prev, volunteerId: e.target.value }))}>
                <option value="">-- Choose a volunteer --</option>
                {volunteers.map(v => <option key={v.id} value={v.id}>{v.firstName} {v.lastName} ({v.email})</option>)}
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleAssign} disabled={saving || !actionData.volunteerId}>
                {saving ? 'Assigning...' : 'Assign Volunteer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complete Booking Modal */}
      {modal?.type === 'complete' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>✅ Complete Booking</h2>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <p className="text-muted" style={{ marginBottom: '1.25rem' }}>
              Confirm this appointment took place for <strong>{modal.booking.client.firstName} {modal.booking.client.lastName}</strong>.
            </p>
            <div className="form-group">
              <label className="form-label">Outcome Notes</label>
              <textarea className="form-control" rows={4}
                value={actionData.notes}
                onChange={e => setActionData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Describe what was achieved in this session..." />
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)}>Cancel</button>
              <button className="btn btn-success" onClick={handleComplete} disabled={saving}>
                {saving ? 'Saving...' : 'Mark as Completed'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Booking Modal */}
      {modal?.type === 'cancel' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>❌ Cancel Booking</h2>
              <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            </div>
            <div className="form-group">
              <label className="form-label">Reason for Cancellation</label>
              <textarea className="form-control" rows={3}
                value={actionData.reason}
                onChange={e => setActionData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Please provide a reason..." />
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)}>Go Back</button>
              <button className="btn btn-danger" onClick={handleCancel} disabled={saving}>
                {saving ? 'Cancelling...' : 'Confirm Cancellation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BookingManagement

