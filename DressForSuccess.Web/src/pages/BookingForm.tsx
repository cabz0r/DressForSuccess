import React, { useEffect, useState } from 'react'
import { createClient, createBooking, getVolunteers, getReferralAgencies, Volunteer, ReferralOption } from '../api'

interface Props { onBack: () => void }

const SERVICE_TYPES = [
  'Clothing Consultation',
  'Suiting Programme',
  'Career Preparation Session',
  'Follow-Up Appointment',
]

const BookingForm: React.FC<Props> = ({ onBack }) => {
  const [step, setStep] = useState(1)
  const [referralAgencies, setReferralAgencies] = useState<ReferralOption[]>([])
  const [volunteers, setVolunteers] = useState<Volunteer[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [bookingRef, setBookingRef] = useState<number | null>(null)

  const [client, setClient] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', referralAgency: '0', notes: ''
  })
  const [booking, setBooking] = useState({
    serviceType: SERVICE_TYPES[0],
    appointmentDate: '',
    volunteerId: '',
    notes: ''
  })

  useEffect(() => {
    getReferralAgencies().then(r => setReferralAgencies(r.data))
    getVolunteers().then(r => setVolunteers(r.data))
  }, [])

  const setC = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setClient(prev => ({ ...prev, [field]: e.target.value }))
  const setB = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setBooking(prev => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async () => {
    setError(''); setLoading(true)
    try {
      const clientRes = await createClient({
        firstName: client.firstName, lastName: client.lastName,
        email: client.email, phone: client.phone,
        address: client.address, referralAgency: Number(client.referralAgency),
        notes: client.notes
      })
      const bookingRes = await createBooking({
        clientId: clientRes.data.id,
        volunteerId: booking.volunteerId ? Number(booking.volunteerId) : null,
        appointmentDate: new Date(booking.appointmentDate).toISOString(),
        serviceType: booking.serviceType,
        notes: booking.notes
      })
      setBookingRef(bookingRes.data.id)
      setSuccess(true)
    } catch (err: any) {
      setError('Something went wrong. Please try again.')
    } finally { setLoading(false) }
  }

  if (success) return (
    <div className="page" style={{ maxWidth: 600, margin: '3rem auto', textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🎉</div>
      <h2 style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>Booking Confirmed!</h2>
      <p className="text-muted" style={{ marginBottom: '0.5rem' }}>Your appointment has been booked successfully.</p>
      <p className="text-muted" style={{ marginBottom: '2rem' }}>Booking Reference: <strong>#{bookingRef}</strong></p>
      <div className="alert alert-success">
        A volunteer will be in touch to confirm your appointment details. Please arrive 10 minutes early on the day.
      </div>
      <button className="btn btn-primary" style={{ marginTop: '1.5rem' }} onClick={onBack}>Back to Client Services</button>
    </div>
  )

  return (
    <div className="page" style={{ maxWidth: 680, margin: '0 auto' }}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
        ← Back to Client Services
      </button>
      <div className="card">
        <div className="card-header">
          <div className="flex items-center justify-between">
            <h2>Book an Appointment</h2>
            <span className="text-muted" style={{ fontSize: '0.85rem' }}>Step {step} of 2</span>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
            {[1, 2].map(s => (
              <div key={s} style={{ flex: 1, height: 4, borderRadius: 4, background: step >= s ? 'var(--primary)' : 'var(--border)', transition: 'background 0.3s' }} />
            ))}
          </div>
        </div>
        <div className="card-body">
          {error && <div className="alert alert-error">{error}</div>}

          {step === 1 && (
            <>
              <h3 style={{ marginBottom: '1.25rem', color: 'var(--text)' }}>Your Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input className="form-control" value={client.firstName} onChange={setC('firstName')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input className="form-control" value={client.lastName} onChange={setC('lastName')} required />
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input className="form-control" type="email" value={client.email} onChange={setC('email')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input className="form-control" type="tel" value={client.phone} onChange={setC('phone')} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Address *</label>
                <input className="form-control" value={client.address} onChange={setC('address')} required placeholder="Street, Suburb, State, Postcode" />
              </div>
              <div className="form-group">
                <label className="form-label">Referral Agency *</label>
                <select className="form-control" value={client.referralAgency} onChange={setC('referralAgency')}>
                  {referralAgencies.map(a => (
                    <option key={a.value} value={a.value}>
                      {a.label.replace(/([A-Z])/g, ' $1').trim()}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Additional Notes</label>
                <textarea className="form-control" rows={3} value={client.notes} onChange={setC('notes')}
                  placeholder="Any information that might help us prepare for your session..." />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button className="btn btn-primary"
                  disabled={!client.firstName || !client.lastName || !client.email || !client.phone || !client.address}
                  onClick={() => setStep(2)}>
                  Next: Appointment Details →
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h3 style={{ marginBottom: '1.25rem', color: 'var(--text)' }}>Appointment Details</h3>
              <div className="form-group">
                <label className="form-label">Service Type *</label>
                <select className="form-control" value={booking.serviceType} onChange={setB('serviceType')}>
                  {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Date & Time *</label>
                <input className="form-control" type="datetime-local" value={booking.appointmentDate}
                  onChange={setB('appointmentDate')} required
                  min={new Date().toISOString().slice(0, 16)} />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Volunteer (Optional)</label>
                <select className="form-control" value={booking.volunteerId} onChange={setB('volunteerId')}>
                  <option value="">-- No preference --</option>
                  {volunteers.map(v => <option key={v.id} value={v.id}>{v.firstName} {v.lastName}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Booking Notes</label>
                <textarea className="form-control" rows={3} value={booking.notes} onChange={setB('notes')}
                  placeholder="Any specific requests for this appointment..." />
              </div>
              <div className="flex justify-between mt-2">
                <button className="btn btn-outline" style={{ color: 'var(--primary)', border: '2px solid var(--primary)' }} onClick={() => setStep(1)}>
                  ← Back
                </button>
                <button className="btn btn-primary" onClick={handleSubmit}
                  disabled={!booking.appointmentDate || loading}>
                  {loading ? 'Booking...' : 'Confirm Booking ✓'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default BookingForm

