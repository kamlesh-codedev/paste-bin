import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import Navbar from '../components/Navbar.jsx'
import useAuth from '../hooks/useAuth.js'

const sidebarItems = [
  { to: '/dashboard', label: 'Dashboard', icon: '▦', end: true },
  { to: '/pastes/my', label: 'My pastes', icon: '▤' },
  { to: '/pastes/new', label: 'Create paste', icon: '+' },
]

function DashboardLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { user } = useAuth()
  const displayName = user?.username || user?.email || 'Account'
  const avatarLabel = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="app-shell">
      <Navbar />
      <div className="dashboard-frame">
        <button
          className="sidebar-toggle button button-secondary"
          type="button"
          aria-expanded={isSidebarOpen}
          onClick={() => setIsSidebarOpen((isOpen) => !isOpen)}
        >
          Menu
        </button>
        <aside className={`sidebar ${isSidebarOpen ? 'is-open' : ''}`}>
          <nav className="sidebar-nav" aria-label="Workspace navigation">
            {sidebarItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end} onClick={() => setIsSidebarOpen(false)}>
                <span aria-hidden="true">{item.icon}</span>{item.label}
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-profile">
            <span className="avatar avatar-large" aria-hidden="true">{avatarLabel}</span>
            <div>
              <strong>{displayName}</strong>
              <span>{user?.email || 'PasteVault workspace'}</span>
            </div>
            <button className="icon-button" type="button" aria-label="Profile settings">⚙</button>
          </div>
        </aside>
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout
