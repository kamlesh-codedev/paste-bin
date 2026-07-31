import { useState } from 'react'
import { NavLink, Link, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth.js'

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const displayName = user?.username || user?.email || 'Account'
  const avatarLabel = displayName.slice(0, 2).toUpperCase()

  const closeMenu = () => setIsMenuOpen(false)

  const handleLogout = () => {
    logout()
    closeMenu()
    navigate('/login', { replace: true })
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link className="brand" to="/dashboard" onClick={closeMenu}>
          <span className="brand-mark" aria-hidden="true">&lt;/&gt;</span>
          <span>PasteVault</span>
        </Link>

        <button
          className="icon-button nav-menu-button"
          type="button"
          aria-label="Toggle navigation menu"
          aria-expanded={isMenuOpen}
          aria-controls="primary-navigation"
          onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
        >
          <span aria-hidden="true">☰</span>
        </button>

        <nav
          id="primary-navigation"
          className={`navbar-links ${isMenuOpen ? 'is-open' : ''}`}
          aria-label="Primary navigation"
        >
          <NavLink to="/dashboard" onClick={closeMenu}>Dashboard</NavLink>
          <Link className="button button-primary button-small" to="/pastes/new" onClick={closeMenu}>
            <span aria-hidden="true">+</span> Create paste
          </Link>
          <div className="navbar-profile">
            <span className="avatar" aria-hidden="true">{avatarLabel}</span>
            <div>
              <strong>{displayName}</strong>
              <span>{user?.email || 'PasteVault workspace'}</span>
            </div>
          </div>
          <button className="button button-ghost button-small" type="button" onClick={handleLogout}>
            Log out
          </button>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
