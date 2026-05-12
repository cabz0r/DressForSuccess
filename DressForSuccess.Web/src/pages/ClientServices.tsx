import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import Chatbot from '../components/Chatbot'
import BookingForm from './BookingForm'

const ClientServices: React.FC = () => {
  const [showBooking, setShowBooking] = useState(false)

  if (showBooking) return <BookingForm onBack={() => setShowBooking(false)} />

  return (
    <>
      <div className="hero" style={{ padding: '3.5rem 1.5rem' }}>
        <div className="container">
          <h1 style={{ fontSize: '2.2rem' }}>Client Services</h1>
          <p>We're here to support you every step of the way on your journey to success.</p>
        </div>
      </div>

      <div className="page">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
          <div className="portal-card" style={{ cursor: 'default' }}>
            <div className="portal-icon">👗</div>
            <h3>Clothing Consultation</h3>
            <p>Get professionally styled for your job interview. We'll help you put together a complete outfit that makes a great first impression.</p>
            <button className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}
              onClick={() => setShowBooking(true)}>Book Now</button>
          </div>
          <div className="portal-card" style={{ cursor: 'default' }}>
            <div className="portal-icon">💼</div>
            <h3>Career Preparation</h3>
            <p>Access CV writing guidance, interview tips, and professional development resources to help land your next job.</p>
            <button className="btn btn-outline" style={{ marginTop: '1rem', width: '100%', color: 'var(--primary)', border: '2px solid var(--primary)' }}
              onClick={() => setShowBooking(true)}>Book Session</button>
          </div>
          <div className="portal-card" style={{ cursor: 'default' }}>
            <div className="portal-icon">🤗</div>
            <h3>Suiting Programme</h3>
            <p>Our one-on-one suiting experience connects you with a trained volunteer stylist for a personalised 90-minute session.</p>
            <button className="btn btn-outline" style={{ marginTop: '1rem', width: '100%', color: 'var(--primary)', border: '2px solid var(--primary)' }}
              onClick={() => setShowBooking(true)}>Book Session</button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>ℹ️ How It Works</h2>
          </div>
          <div className="card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {[
                { icon: '📋', step: '1. Referral', desc: 'You can self-refer or be referred by a partner agency such as social services, employment agency, or community centre.' },
                { icon: '📅', step: '2. Book', desc: 'Book an appointment online. We\'ll match you with a volunteer stylist who will guide you through the process.' },
                { icon: '👗', step: '3. Your Session', desc: 'Come in for your appointment. Your volunteer stylist will help you select professional clothing that suits you.' },
                { icon: '🌟', step: '4. Succeed', desc: 'Leave feeling confident, empowered, and fully prepared to present your best self at your interview.' },
              ].map(({ icon, step, desc }) => (
                <div key={step} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>{icon}</div>
                  <h4 style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>{step}</h4>
                  <p className="text-muted" style={{ fontSize: '0.9rem' }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <p className="text-muted" style={{ marginBottom: '1rem' }}>Not sure where to start? Our assistant can help!</p>
        </div>
      </div>
      <Chatbot />
    </>
  )
}

export default ClientServices

