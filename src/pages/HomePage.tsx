import { useEffect, useState } from 'react'
import {
  getCampusWelcome,
  getCurrentUser,
  logout,
} from '../services/authService'
import type { UserView } from '../services/authService'
import '../styles/home.css'

interface HomePageProps {
  onNavigate: (path: string) => void
  user?: UserView | null
}

interface BusRoute {
  id: string
  code: string
  name: string
  terminalA: string
  terminalB: string
  zone: 'north' | 'central' | 'engineering' | 'west'
  nextArrivalMins: number
  passengersInQueue: number
  capacityPercentage: number
  crowdLevel: 'low' | 'medium' | 'high'
  busNumber: string
  frequencyMins: number
}

const INITIAL_ROUTES: BusRoute[] = [
  {
    id: 'route-1',
    code: 'LINE 101',
    name: 'North Campus Shuttle',
    terminalA: 'North Gate Transit Hub',
    terminalB: 'Main Library & Union',
    zone: 'north',
    nextArrivalMins: 3,
    passengersInQueue: 11,
    capacityPercentage: 35,
    crowdLevel: 'low',
    busNumber: 'CG-401',
    frequencyMins: 6,
  },
  {
    id: 'route-2',
    code: 'LINE 204',
    name: 'SciTech & Engineering Loop',
    terminalA: 'Engineering Complex',
    terminalB: 'Nanotech Research Wing',
    zone: 'engineering',
    nextArrivalMins: 6,
    passengersInQueue: 24,
    capacityPercentage: 68,
    crowdLevel: 'medium',
    busNumber: 'CG-218',
    frequencyMins: 8,
  },
  {
    id: 'route-3',
    code: 'LINE 305',
    name: 'Student Center & Dorms Express',
    terminalA: 'Student Center West',
    terminalB: 'Undergrad Dormitories',
    zone: 'west',
    nextArrivalMins: 9,
    passengersInQueue: 42,
    capacityPercentage: 92,
    crowdLevel: 'high',
    busNumber: 'CG-105',
    frequencyMins: 5,
  },
  {
    id: 'route-4',
    code: 'LINE 402',
    name: 'Central Quad & Metro Link',
    terminalA: 'University Metro Station',
    terminalB: 'Central Quadrangle',
    zone: 'central',
    nextArrivalMins: 4,
    passengersInQueue: 18,
    capacityPercentage: 55,
    crowdLevel: 'medium',
    busNumber: 'CG-312',
    frequencyMins: 10,
  },
  {
    id: 'route-5',
    code: 'LINE 510',
    name: 'Athletics & South Campus Line',
    terminalA: 'Fieldhouse Stadium',
    terminalB: 'South Dining Pavilion',
    zone: 'central',
    nextArrivalMins: 12,
    passengersInQueue: 8,
    capacityPercentage: 25,
    crowdLevel: 'low',
    busNumber: 'CG-509',
    frequencyMins: 15,
  },
]

export default function HomePage({ onNavigate, user: initialUser }: HomePageProps) {
  const [currentUser, setCurrentUser] = useState<UserView | null>(
    initialUser || null
  )
  const [welcomeText, setWelcomeText] = useState('Welcome to Campus GPS!')
  const [routes, setRoutes] = useState<BusRoute[]>(INITIAL_ROUTES)
  const [activeZone, setActiveZone] = useState<string>('all')
  const [activeTicket, setActiveTicket] = useState<{
    routeId: string
    routeName: string
    busNumber: string
    position: number
    estMins: number
  } | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  // Load user profile and campus welcome from backend
  useEffect(() => {
    async function loadData() {
      const userRes = await getCurrentUser()
      if (userRes) {
        setCurrentUser(userRes)
      }

      const welcome = await getCampusWelcome()
      if (welcome) {
        setWelcomeText(welcome)
      }
    }
    loadData()
  }, [])

  // Auto-dismiss toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  async function handleLogout() {
    await logout()
    setCurrentUser(null)
    onNavigate('/login')
  }

  function handleJoinQueue(route: BusRoute) {
    if (activeTicket?.routeId === route.id) {
      setToast(`You are already in line for ${route.name}!`)
      return
    }

    const pos = Math.max(1, Math.floor(route.passengersInQueue / 3))
    setActiveTicket({
      routeId: route.id,
      routeName: route.name,
      busNumber: route.busNumber,
      position: pos,
      estMins: route.nextArrivalMins,
    })

    // Increase queue count slightly
    setRoutes((prev) =>
      prev.map((r) =>
        r.id === route.id
          ? { ...r, passengersInQueue: r.passengersInQueue + 1 }
          : r
      )
    )

    setToast(
      `🎉 You joined the virtual queue for ${route.name}! You are #${pos} in line.`
    )
  }

  function handleLeaveQueue() {
    if (activeTicket) {
      setRoutes((prev) =>
        prev.map((r) =>
          r.id === activeTicket.routeId
            ? {
                ...r,
                passengersInQueue: Math.max(0, r.passengersInQueue - 1),
              }
            : r
        )
      )
    }
    setActiveTicket(null)
    setToast('You left the virtual queue.')
  }

  const filteredRoutes = routes.filter((r) =>
    activeZone === 'all' ? true : r.zone === activeZone
  )

  const displayName =
    currentUser?.displayName || currentUser?.email || 'Campus Traveler'

  return (
    <div className="home-page">
      {/* NAVBAR */}
      <nav className="home-nav">
        <div className="nav-container">
          <div className="brand-section" onClick={() => onNavigate('/home')}>
            <span className="brand-logo">🚌 CGPS</span>
            <span className="network-badge">
              <span className="pulse-dot"></span>
              Live Transit
            </span>
          </div>

          <div className="nav-links">
            <button className="nav-link active">Live Queues</button>
            <button className="nav-link">Bus Routes</button>
            <button className="nav-link">Interactive Map</button>
            <button className="nav-link">Alerts</button>
          </div>

          <div className="nav-user-area">
            {currentUser ? (
              <>
                <div className="user-pill">
                  <div className="user-avatar">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <div className="user-details">
                    <span className="user-name">{displayName}</span>
                    <span className="user-role">
                      {currentUser.role || 'Passenger'}
                    </span>
                  </div>
                </div>
                <button
                  className="nav-btn-outline"
                  onClick={handleLogout}
                  title="Sign out of Campus GPS"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <button
                  className="nav-btn-outline"
                  onClick={() => onNavigate('/login')}
                >
                  Login
                </button>
                <button
                  className="nav-btn-primary"
                  onClick={() => onNavigate('/signup')}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="home-main">
        {/* TOAST NOTICE */}
        {toast && (
          <div
            style={{
              position: 'fixed',
              top: '80px',
              right: '24px',
              zIndex: 9999,
              background: 'rgba(10, 14, 39, 0.95)',
              border: '1px solid #00d4ff',
              boxShadow: '0 10px 30px rgba(0, 212, 255, 0.3)',
              color: '#fff',
              padding: '14px 22px',
              borderRadius: '14px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            {toast}
          </div>
        )}

        {/* HERO BANNER */}
        <section className="hero-banner">
          <div className="hero-tag">
            <span>● Campus Transit Intelligence</span>
          </div>
          <h1 className="hero-title">
            {welcomeText ? welcomeText : `Welcome to Campus GPS, ${displayName}!`}
          </h1>
          <p className="hero-subtitle">
            Track live bus arrivals, monitor passenger queues in real time, and
            reserve your virtual spot before you reach the stop.
          </p>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🚏</div>
              <div className="stat-info">
                <span className="stat-value">5 Routes</span>
                <span className="stat-label">Active Campus Lines</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">⚡</div>
              <div className="stat-info">
                <span className="stat-value">3.2 Mins</span>
                <span className="stat-label">Avg. Queue Wait Time</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🚌</div>
              <div className="stat-info">
                <span className="stat-value">18 Buses</span>
                <span className="stat-label">Live on Campus Roads</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">🛡️</div>
              <div className="stat-info">
                <span className="stat-value">100%</span>
                <span className="stat-label">Service Capacity</span>
              </div>
            </div>
          </div>
        </section>

        {/* ACTIVE VIRTUAL QUEUE TICKET BANNER */}
        {activeTicket && (
          <section className="active-ticket-banner">
            <div className="ticket-details">
              <div className="ticket-qr" title="Digital boarding pass QR">
                🎫
              </div>
              <div className="ticket-info">
                <h4>Virtual Queue Pass: {activeTicket.routeName}</h4>
                <p>
                  Bus <strong>{activeTicket.busNumber}</strong> • Present this
                  pass to board immediately without waiting in physical queue.
                </p>
              </div>
            </div>

            <div className="ticket-stats">
              <div className="ticket-stat">
                <span className="ticket-stat-val">
                  #{activeTicket.position}
                </span>
                <span className="ticket-stat-lbl">Your Queue Spot</span>
              </div>
              <div className="ticket-stat">
                <span
                  className="ticket-stat-val"
                  style={{ color: '#00d4ff' }}
                >
                  ~{activeTicket.estMins}m
                </span>
                <span className="ticket-stat-lbl">Estimated Arrival</span>
              </div>
              <button className="leave-btn" onClick={handleLeaveQueue}>
                Leave Queue
              </button>
            </div>
          </section>
        )}

        {/* SECTION HEADER & ZONE FILTERS */}
        <div className="section-header">
          <h2 className="section-title">
            <span>🚍</span> Live Campus Bus Queues
          </h2>

          <div className="filter-chips">
            <button
              className={`filter-chip ${activeZone === 'all' ? 'active' : ''}`}
              onClick={() => setActiveZone('all')}
            >
              All Campus Stops
            </button>
            <button
              className={`filter-chip ${
                activeZone === 'north' ? 'active' : ''
              }`}
              onClick={() => setActiveZone('north')}
            >
              North Hub
            </button>
            <button
              className={`filter-chip ${
                activeZone === 'central' ? 'active' : ''
              }`}
              onClick={() => setActiveZone('central')}
            >
              Central Quad
            </button>
            <button
              className={`filter-chip ${
                activeZone === 'engineering' ? 'active' : ''
              }`}
              onClick={() => setActiveZone('engineering')}
            >
              Engineering
            </button>
            <button
              className={`filter-chip ${
                activeZone === 'west' ? 'active' : ''
              }`}
              onClick={() => setActiveZone('west')}
            >
              West Dorms
            </button>
          </div>
        </div>

        {/* QUEUES GRID */}
        <div className="queues-grid">
          {filteredRoutes.map((route) => {
            const isJoined = activeTicket?.routeId === route.id
            return (
              <div
                key={route.id}
                className={`queue-card ${isJoined ? 'joined' : ''}`}
              >
                <div>
                  <div className="card-top">
                    <span className="route-pill">{route.code}</span>
                    <span
                      className={`crowd-badge crowd-${route.crowdLevel}`}
                    >
                      {route.crowdLevel} crowd
                    </span>
                  </div>

                  <h3 className="route-name">{route.name}</h3>
                  <div className="route-path">
                    {route.terminalA} ⇄ {route.terminalB}
                  </div>

                  <div className="card-metrics">
                    <div className="metric-item">
                      <span className="metric-label">Next Arrival</span>
                      <span className="metric-value highlight-cyan">
                        {route.nextArrivalMins} mins
                      </span>
                    </div>

                    <div className="metric-item">
                      <span className="metric-label">In Line</span>
                      <span className="metric-value highlight-green">
                        {route.passengersInQueue} people
                      </span>
                    </div>
                  </div>

                  <div className="progress-container">
                    <div className="progress-header">
                      <span>Bus Capacity</span>
                      <span>{route.capacityPercentage}% Filled</span>
                    </div>
                    <div className="progress-bar-bg">
                      <div
                        className={`progress-bar-fill fill-${route.crowdLevel}`}
                        style={{ width: `${route.capacityPercentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="card-actions">
                  {isJoined ? (
                    <button
                      className="leave-btn"
                      onClick={handleLeaveQueue}
                    >
                      ✓ In Queue (#{activeTicket.position}) • Leave
                    </button>
                  ) : (
                    <button
                      className="join-btn"
                      onClick={() => handleJoinQueue(route)}
                    >
                      Join Virtual Queue
                    </button>
                  )}
                  <button
                    className="info-btn"
                    title={`Bus #${route.busNumber} arrives every ${route.frequencyMins} mins`}
                    onClick={() =>
                      setToast(
                        `ℹ️ Route ${route.code} (${route.name}) runs every ${route.frequencyMins} mins. Next vehicle: ${route.busNumber}`
                      )
                    }
                  >
                    ℹ️
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* SCHEDULE TABLE */}
        <section className="schedule-section">
          <div className="section-header" style={{ marginBottom: '12px' }}>
            <h3 className="section-title">
              <span>🕒</span> Upcoming Campus Departures
            </h3>
            <span
              style={{
                fontSize: '12px',
                color: 'rgba(255,255,255,0.45)',
              }}
            >
              Real-time GPS synchronization
            </span>
          </div>

          <div className="schedule-table-wrap">
            <table className="schedule-table">
              <thead>
                <tr>
                  <th>Line</th>
                  <th>Origin Stop</th>
                  <th>Destination</th>
                  <th>Est. Departure</th>
                  <th>Vehicle ID</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>LINE 101</strong>
                  </td>
                  <td>North Gate Terminal</td>
                  <td>Central Library</td>
                  <td>In 3 mins</td>
                  <td>CG-401</td>
                  <td>
                    <span className="status-indicator status-on-time">
                      ● On Schedule
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>LINE 204</strong>
                  </td>
                  <td>SciTech Lab Pavilion</td>
                  <td>Nanotech Research</td>
                  <td>In 6 mins</td>
                  <td>CG-218</td>
                  <td>
                    <span className="status-indicator status-on-time">
                      ● On Schedule
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>LINE 305</strong>
                  </td>
                  <td>Student Center West</td>
                  <td>West Dorm Complex</td>
                  <td>In 9 mins</td>
                  <td>CG-105</td>
                  <td>
                    <span className="status-indicator status-delayed">
                      ● High Traffic (+2m)
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>LINE 402</strong>
                  </td>
                  <td>Metro Station Connector</td>
                  <td>Central Quad</td>
                  <td>In 4 mins</td>
                  <td>CG-312</td>
                  <td>
                    <span className="status-indicator status-on-time">
                      ● On Schedule
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="home-footer">
        <div>
          <strong>Campus GPS (CGPS)</strong> • Real-time University Transit &
          Queue System
        </div>
        <div>
          <span>Connected to Spring Boot API • </span>
          <button
            onClick={() => onNavigate('/login')}
            style={{
              background: 'none',
              border: 'none',
              color: '#00d4ff',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Auth Portal
          </button>
        </div>
      </footer>
    </div>
  )
}
