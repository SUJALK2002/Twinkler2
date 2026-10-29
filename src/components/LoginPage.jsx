import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, School, ShieldCheck } from 'lucide-react'

export default function LoginPage({ role }) {
  if (!role) {
    return (
      <main>
        <section className="inner-hero section-cream">
          <div className="container">
            <span className="eyebrow">WELCOME BACK</span>
            <h1>Choose your <span className="text-orange">login.</span></h1>
            <p>Select the account type to continue.</p>
          </div>
        </section>
        <section className="section section-white">
          <div className="container login-choice-grid">
            <Link className="login-choice-card" to="/admin/login">
              <ShieldCheck size={30} />
              <h2>Admin Login</h2>
              <p>Continue to the administrator sign-in screen.</p>
              <span>Continue <ArrowRight size={16} /></span>
            </Link>
            <Link className="login-choice-card" to="/login/school">
              <School size={30} />
              <h2>School Login</h2>
              <p>Continue to the school sign-in screen.</p>
              <span>Continue <ArrowRight size={16} /></span>
            </Link>
          </div>
        </section>
      </main>
    )
  }

  return <RoleLoginForm role={role} />
}

function RoleLoginForm({ role }) {
  const [message, setMessage] = useState('')
  const isAdmin = role === 'admin'
  const title = isAdmin ? 'Admin Login' : 'School Login'
  const Icon = isAdmin ? ShieldCheck : School

  function handleSubmit(event) {
    event.preventDefault()
    setMessage('Login is not connected yet. Please contact us to get access.')
  }

  return (
    <main>
      <section className="inner-hero section-cream">
        <div className="container">
          <span className="eyebrow">SECURE SIGN-IN</span>
          <h1>{title}</h1>
          <p>Sign in to continue to your Tomorrow’s Tinkers account.</p>
        </div>
      </section>
      <section className="section section-white">
        <div className="container login-form-wrap">
          <form className="lead-form login-form" onSubmit={handleSubmit}>
            <div className="login-form-icon"><Icon size={25} /></div>
            <div className="form-heading">
              <span className="eyebrow">{isAdmin ? 'ADMINISTRATOR ACCESS' : 'SCHOOL ACCESS'}</span>
              <h2>Welcome back.</h2>
              <p>Enter your account details to sign in.</p>
            </div>
            <div className="form-grid login-fields">
              <label>Email address<input type="email" name="email" autoComplete="username" placeholder="you@school.edu.in" required /></label>
              <label>Password<input type="password" name="password" autoComplete="current-password" placeholder="Enter your password" required /></label>
            </div>
            {message && <p className="form-error" role="status">{message}</p>}
            <button className="button button-primary form-submit" type="submit">Login <ArrowRight size={17} /></button>
            <p className="login-back-link"><Link to="/login">Choose another login</Link></p>
          </form>
        </div>
      </section>
    </main>
  )
}
