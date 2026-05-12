import React from 'react'
import { Link } from 'react-router-dom'
import Chatbot from '../components/Chatbot'

const Home: React.FC = () => (
  <>
    <section className="hero">
      <div className="container">
        <h1>Empowering Women to Succeed</h1>
        <p>
          Dress for Success provides professional attire, development tools, and support for women
          entering the workforce with confidence and dignity.
        </p>
        <div className="hero-buttons">
          <Link to="/client-services" className="btn btn-primary">Get Started</Link>
          <Link to="/store" className="btn btn-outline">Browse Store</Link>
        </div>
      </div>
    </section>

    <section className="portals">
      <div className="container">
        <h2>Our Portals</h2>
        <p className="portals-subtitle">Access the service you need below</p>
        <div className="portals-grid">
          <Link to="/client-services" className="portal-card">
            <div className="portal-icon">🤝</div>
            <h3>Client Services</h3>
            <p>
              Book a clothing consultation appointment, get styled for success, and access
              support resources for your journey into employment.
            </p>
          </Link>
          <Link to="/store" className="portal-card">
            <div className="portal-icon">👗</div>
            <h3>Our Store</h3>
            <p>
              Browse our selection of quality professional clothing available to purchase and
              support our charity's mission.
            </p>
          </Link>
          <Link to="/volunteer/login" className="portal-card">
            <div className="portal-icon">⭐</div>
            <h3>Volunteer Portal</h3>
            <p>
              Volunteers log in here to manage bookings, view your schedule, and track the
              appointments you've assisted with.
            </p>
          </Link>
        </div>
      </div>
    </section>

    <section style={{ background: 'var(--primary)', color: 'white', padding: '4rem 1.5rem', textAlign: 'center' }}>
      <div className="container">
        <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Make a Difference Today</h2>
        <p style={{ opacity: 0.9, maxWidth: 600, margin: '0 auto 2rem' }}>
          Whether you're a client seeking support or a volunteer wanting to give back,
          Dress for Success welcomes you with open arms.
        </p>
        <Link to="/volunteer/register" className="btn btn-white">Become a Volunteer</Link>
      </div>
    </section>

    <Chatbot />
  </>
)

export default Home

