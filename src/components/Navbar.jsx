import { useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { ArrowDown, Menu, X } from 'lucide-react'
import logo from '../assets/logo.png'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [loginOpen, setLoginOpen] = useState(false)
  const close = () => {
    setOpen(false)
    setLoginOpen(false)
  }
  return (
    <header className="site-header">
      <div className="nav-wrap container">
        <Link to="/" className="brand" onClick={close} aria-label="Tomorrow's Tinkers home">
          
          <img src={logo} alt="Tomorrow's Tinkers logo" className="brand-logo rounded-xl shadow-sm" height="70" width="70" />
          <span className="brand-copy"><strong>Tomorrow's <em>Tinkers</em></strong><small>ROBOTICS FOR SCHOOLS</small></span>
        </Link>
        <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Close menu' : 'Open menu'}>
          {open ? <X /> : <Menu />}
        </button>
        <nav className={open ? 'nav-links is-open' : 'nav-links'}>
          <NavLink to="/" onClick={close}>Home</NavLink>
          <NavLink to="/kits" onClick={close}>Kits</NavLink>
          <NavLink to="/training-video" onClick={close}>Demo Training Video</NavLink>
          <NavLink to="/about" onClick={close}>About Us</NavLink>
          <NavLink to="/contact" onClick={close}>Contact Us</NavLink>
          <div className="login-dropdown">
            <button
              className="nav-cta login-trigger"
              type="button"
              aria-expanded={loginOpen}
              aria-haspopup="menu"
              onClick={() => setLoginOpen(!loginOpen)}
            >
              Login <ArrowDown size={15} />
            </button>
            {loginOpen && (
              <div className="login-menu" role="menu">
                <Link to="/admin/login" role="menuitem" onClick={close}>Admin Login</Link>
                <Link to="/login/school" role="menuitem" onClick={close}>School Login</Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  )
}