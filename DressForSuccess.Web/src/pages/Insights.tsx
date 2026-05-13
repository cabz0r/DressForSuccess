import React, { useEffect, useState } from 'react'
import { getInsights, InsightsData } from '../api'

const statusColors: Record<string, string> = {
  Scheduled: '#3b82f6',
  Confirmed: '#f59e0b',
  Completed: '#10b981',
  Cancelled: '#ef4444',
  NoShow: '#6b7280'
}

const BarChart: React.FC<{ data: { label: string; value: number; color?: string }[]; maxValue?: number }> = ({ data, maxValue }) => {
  const max = maxValue || Math.max(...data.map(d => d.value), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
      {data.map((d, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ minWidth: 140, fontSize: '0.82rem', textAlign: 'right', color: 'var(--text-muted)' }}>
            {d.label}
          </span>
          <div style={{ flex: 1, height: 28, background: 'var(--border)', borderRadius: 6, overflow: 'hidden', position: 'relative' }}>
            <div style={{
              width: `${(d.value / max) * 100}%`, height: '100%',
              background: d.color || 'var(--primary)',
              borderRadius: 6, transition: 'width 0.5s ease',
              minWidth: d.value > 0 ? 24 : 0
            }} />
            <span style={{
              position: 'absolute', left: `${Math.min((d.value / max) * 100, 92)}%`,
              top: '50%', transform: 'translateY(-50%)',
              fontSize: '0.75rem', fontWeight: 700,
              color: (d.value / max) > 0.4 ? 'white' : 'var(--text)',
              paddingLeft: 6
            }}>
              {d.value}
            </span>
          </div>
        </div>
      ))}
    </div>
  )
}

const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const total = data.reduce((sum, d) => sum + d.value, 0)
  if (total === 0) return <p className="text-muted text-center">No data</p>
  let offset = 0
  const size = 160
  const stroke = 30

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((d, i) => {
          const pct = d.value / total
          const circumference = Math.PI * (size - stroke)
          const dashLength = pct * circumference
          const dashOffset = offset * circumference
          offset += pct
          return (
            <circle key={i}
              cx={size / 2} cy={size / 2} r={(size - stroke) / 2}
              fill="none" stroke={d.color} strokeWidth={stroke}
              strokeDasharray={`${dashLength} ${circumference}`}
              strokeDashoffset={-dashOffset}
              style={{ transition: 'stroke-dasharray 0.5s' }}
            />
          )
        })}
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
          style={{ fontSize: '1.4rem', fontWeight: 700, fill: 'var(--text)' }}>
          {total}
        </text>
        <text x="50%" y="65%" textAnchor="middle"
          style={{ fontSize: '0.6rem', fill: 'var(--text-muted)' }}>
          total
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        {data.map((d, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: d.color }} />
            <span>{d.label}</span>
            <strong style={{ marginLeft: 'auto' }}>{d.value}</strong>
            <span className="text-muted">({total > 0 ? Math.round(d.value / total * 100) : 0}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const Insights: React.FC = () => {
  const [data, setData] = useState<InsightsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getInsights().then(r => setData(r.data)).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page"><div className="spinner" /></div>
  if (!data) return <div className="page"><p>Failed to load insights.</p></div>

  const formatAgency = (s: string) => s.replace(/([A-Z])/g, ' $1').trim()

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>📊 Insights & Analytics</h1>
          <p className="text-muted">Performance overview and referral agency metrics</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        <div className="stat-card">
          <div className="stat-num">{data.summary.totalClients}</div>
          <div className="stat-label">Total Clients</div>
        </div>
        <div className="stat-card" style={{ borderColor: '#3b82f6' }}>
          <div className="stat-num" style={{ color: '#3b82f6' }}>{data.summary.totalBookings}</div>
          <div className="stat-label">Total Bookings</div>
        </div>
        <div className="stat-card" style={{ borderColor: '#10b981' }}>
          <div className="stat-num" style={{ color: '#10b981' }}>{data.summary.completedBookings}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card" style={{ borderColor: '#ef4444' }}>
          <div className="stat-num" style={{ color: '#ef4444' }}>{data.summary.cancelledBookings}</div>
          <div className="stat-label">Cancelled</div>
        </div>
        <div className="stat-card" style={{ borderColor: '#8b5cf6' }}>
          <div className="stat-num" style={{ color: '#8b5cf6' }}>{data.summary.completionRate}%</div>
          <div className="stat-label">Completion Rate</div>
        </div>
        <div className="stat-card" style={{ borderColor: '#f59e0b' }}>
          <div className="stat-num" style={{ color: '#f59e0b' }}>{data.summary.totalVolunteers}</div>
          <div className="stat-label">Active Volunteers</div>
        </div>
      </div>

      {/* Two column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        {/* Booking Status Donut */}
        <div className="card">
          <div className="card-header"><h2>📈 Booking Status Breakdown</h2></div>
          <div className="card-body">
            <DonutChart data={data.statusBreakdown.map(s => ({
              label: s.status,
              value: s.count,
              color: statusColors[s.status] || '#6b7280'
            }))} />
          </div>
        </div>

        {/* Top Referral Agencies */}
        <div className="card">
          <div className="card-header"><h2>🏢 Top Referral Agencies (by Clients)</h2></div>
          <div className="card-body">
            {data.referralBreakdown.length === 0 ? (
              <p className="text-muted text-center">No referral data yet.</p>
            ) : (
              <BarChart data={data.referralBreakdown.map((r, i) => ({
                label: formatAgency(r.agency),
                value: r.count,
                color: ['#8B1A4A', '#D4AF37', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#6366f1'][i % 10]
              }))} />
            )}
          </div>
        </div>
      </div>

      {/* Referral by Completed Bookings */}
      <div className="card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header">
          <h2>🏆 Referral Agencies by Successful Completions</h2>
          <p className="text-muted" style={{ fontSize: '0.82rem', marginTop: '0.25rem' }}>
            Which referral pathways lead to the most completed appointments
          </p>
        </div>
        <div className="card-body">
          {data.referralByCompleted.length === 0 ? (
            <p className="text-muted text-center">No completed bookings yet.</p>
          ) : (
            <div style={{ maxWidth: 600 }}>
              <BarChart data={data.referralByCompleted.map(r => ({
                label: formatAgency(r.agency),
                value: r.completedBookings,
                color: '#10b981'
              }))} />
            </div>
          )}
        </div>
      </div>

      {/* Service Type Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
        <div className="card">
          <div className="card-header"><h2>👗 Service Type Breakdown</h2></div>
          <div className="card-body">
            {data.serviceBreakdown.length === 0 ? (
              <p className="text-muted text-center">No bookings yet.</p>
            ) : (
              <BarChart data={data.serviceBreakdown.map((s, i) => ({
                label: s.service,
                value: s.count,
                color: ['#8B1A4A', '#D4AF37', '#3b82f6', '#10b981'][i % 4]
              }))} />
            )}
          </div>
        </div>

        {/* Volunteer Performance */}
        <div className="card">
          <div className="card-header"><h2>⭐ Volunteer Performance</h2></div>
          <div className="card-body">
            {data.volunteerStats.length === 0 ? (
              <p className="text-muted text-center">No volunteer data yet.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr><th>Volunteer ID</th><th>Total</th><th>Completed</th><th>Cancelled</th></tr>
                  </thead>
                  <tbody>
                    {data.volunteerStats.map(v => (
                      <tr key={v.volunteerId}>
                        <td>#{v.volunteerId}</td>
                        <td><strong>{v.totalBookings}</strong></td>
                        <td><span className="badge badge-completed">{v.completed}</span></td>
                        <td><span className="badge badge-cancelled">{v.cancelled}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Key Insights Box */}
      <div className="card" style={{ marginTop: '1.5rem', borderLeft: '4px solid var(--primary)' }}>
        <div className="card-body">
          <h3 style={{ color: 'var(--primary)', marginBottom: '0.75rem' }}>💡 Key Insights</h3>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.9rem' }}>
            {data.referralBreakdown.length > 0 && (
              <li>🏢 <strong>{formatAgency(data.referralBreakdown[0].agency)}</strong> is the top referring agency with <strong>{data.referralBreakdown[0].count}</strong> client{data.referralBreakdown[0].count !== 1 ? 's' : ''}</li>
            )}
            <li>📊 Completion rate is <strong>{data.summary.completionRate}%</strong> — {data.summary.completionRate >= 70 ? 'excellent performance!' : data.summary.completionRate >= 50 ? 'good, room for improvement.' : 'needs attention.'}</li>
            <li>❌ Cancellation rate is <strong>{data.summary.cancellationRate}%</strong> — {data.summary.cancellationRate <= 15 ? 'very low, great retention!' : data.summary.cancellationRate <= 30 ? 'moderate, consider follow-up reminders.' : 'high, investigate causes.'}</li>
            <li>👥 <strong>{data.summary.totalVolunteers}</strong> active volunteers supporting <strong>{data.summary.totalClients}</strong> clients</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Insights

