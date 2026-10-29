import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  ChevronLeft,
  CalendarRange,
  ChevronRight,
  CircleDollarSign,
  FileText,
  FolderOpen,
  Gauge,
  ImageIcon,
  LayoutDashboard,
  Layers3,
  LogOut,
  Menu,
  Package2,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Users,
  Wrench,
  X
} from 'lucide-react'
import logo from '../assets/logo.png'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import KitDetailContentPage from './KitDetailContentPage.jsx'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

const AdminContext = createContext(null)

const adminNav = [
  { label: 'Overview', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Website Management', to: '/admin/website', icon: FolderOpen },
  { label: 'Kit Detail Content', to: '/admin/kit-content', icon: Layers3 },
  { label: 'Enquiries & CRM', to: '/admin/enquiries', icon: FileText },
  { label: 'Schools & Partnerships', to: '/admin/schools', icon: Building2 },
  { label: 'Robotics Kits & Inventory', to: '/admin/kits', icon: Package2 },
  { label: 'Schedule & Events', to: '/admin/schedule', icon: CalendarRange },
  { label: 'Testimonials & Media', to: '/admin/media', icon: ImageIcon },
  { label: 'Admin Users & Permissions', to: '/admin/users', icon: Users },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
  { label: 'Audit Logs', to: '/admin/audit-logs', icon: Activity }
]

const defaultWebsiteContent = {
  heroTitle: "Don't just teach technology. Let them build it.",
  heroSubtitle: 'Give students the confidence to turn curiosity into creation through hands-on robotics and guided learning.',
  heroDescription: 'We help schools bring robotics education to life with practical kits, teacher support, and future-ready projects.',
  ctaText: 'Book a free demo',
  ctaLink: '/contact',
  about: 'Tomorrow\'s Tinkers helps schools introduce practical technology learning through robotics kits, teacher enablement and real-world project experiences.',
  stats: ['300+ students reached', '20+ partner schools', '8–9 month learning journey'],
  faq: [
    { question: 'Do schools need prior robotics experience?', answer: 'No. We support schools from the first pilot session through rollout and teacher confidence building.' },
    { question: 'What is included in the program?', answer: 'Robotics kits, curriculum guidance, teacher training, and access to a learning platform.' }
  ],
  footerEmail: 'hello@tomorrowstinkers.com',
  footerPhone: '+91 99604 92676',
  socials: { instagram: 'https://instagram.com', linkedin: 'https://linkedin.com', whatsapp: 'https://wa.me/919960492676' }
}

const chartPalette = ['#f29a3f', '#203858', '#7f9e77', '#668fb5', '#9487ba', '#d68a4d']
const adminPermissionOptions = [
  ['dashboard', 'Overview'],
  ['website', 'Website'],
  ['enquiries', 'Enquiries'],
  ['schools', 'Schools'],
  ['kits', 'Kits & inventory'],
  ['schedule', 'Schedule'],
  ['media', 'Media'],
  ['settings', 'Settings'],
  ['audit_logs', 'Audit logs']
]
const DEMO_ADMIN_ACCOUNT = import.meta.env.DEV
  ? { email: 'demo.admin@tomorrowstinkers.com', password: 'DemoAdmin@123' }
  : null

function useAdminContext() {
  const context = useContext(AdminContext)
  if (!context) {
    throw new Error('Admin context is missing')
  }
  return context
}

export function AdminAuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return undefined
    }

    let active = true
    const resolveAdminSession = async (authSession) => {
      if (!active) return
      if (!authSession?.user) {
        setSession(null)
        setLoading(false)
        return
      }

      const { data: profile, error } = await supabase
        .from('admin_profiles')
        .select('id, email, full_name, role, active, permissions')
        .eq('id', authSession.user.id)
        .maybeSingle()

      if (!active) return
      if (error || !profile?.active || profile.role === 'pending') {
        setSession(null)
        setLoading(false)
        return
      }

      setSession({
        id: profile.id,
        email: profile.email || authSession.user.email,
        name: profile.full_name || profile.email || 'Admin',
        role: profile.role,
        permissions: profile.permissions || []
      })
      setLoading(false)
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, authSession) => {
      queueMicrotask(() => {
        void resolveAdminSession(authSession)
      })
    })

    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        console.error('Unable to restore the Supabase session:', error.message)
        setSession(null)
        setLoading(false)
        return
      }
      return resolveAdminSession(data.session)
    })

    return () => {
      active = false
      authListener.subscription.unsubscribe()
    }
  }, [])

  const signIn = async ({ email, password }) => {
    if (!isSupabaseConfigured && import.meta.env.DEV && email.trim().toLowerCase() === DEMO_ADMIN_ACCOUNT.email && password === DEMO_ADMIN_ACCOUNT.password) {
      setSession({
        id: 'development-demo-admin',
        email: DEMO_ADMIN_ACCOUNT.email,
        name: 'Demo Admin',
        role: 'super_admin',
        permissions: ['dashboard', 'website', 'enquiries', 'schools', 'kits', 'schedule', 'media', 'users', 'settings', 'audit_logs']
      })
      return { success: true }
    }

    if (!supabase) {
      return { success: false, message: 'Admin authentication is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' }
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    })

    if (error) {
      return { success: false, message: error.message }
    }

    const { data: profile, error: profileError } = await supabase
      .from('admin_profiles')
      .select('id, email, full_name, role, active, permissions')
      .eq('id', data.user.id)
      .maybeSingle()

    if (profileError) {
      await supabase.auth.signOut()
      return { success: false, message: `Unable to verify administrator access: ${profileError.message}` }
    }

    if (!profile?.active || profile.role === 'pending') {
      await supabase.auth.signOut()
      return { success: false, message: 'Your account is registered but is awaiting administrator approval.' }
    }

    setSession({
      id: profile.id,
      email: profile.email || data.user.email,
      name: profile.full_name || profile.email || 'Admin',
      role: profile.role,
      permissions: profile.permissions || []
    })
    return { success: true }
  }

  const registerAdmin = async ({ name, email, password, confirmPassword }) => {
    const trimmedName = String(name || '').trim()
    const trimmedEmail = String(email || '').trim().toLowerCase()

    if (!trimmedName || !trimmedEmail || !password) {
      return { success: false, message: 'Name, email and password are required.' }
    }

    if (password.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long.' }
    }

    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match.' }
    }

    if (!supabase) {
      return {
        success: false,
        message: 'Admin registration requires Supabase configuration. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY first.'
      }
    }

    const { error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: { full_name: trimmedName },
        emailRedirectTo: `${window.location.origin}/admin/login`
      }
    })

    if (error) {
      return { success: false, message: error.message }
    }

    return { success: true, message: 'Registration received. Verify your email, then wait for a super administrator to approve your access.' }
  }

  const requestPasswordReset = async (email) => {
    if (!supabase) {
      return { success: false, message: 'Password reset is available after Supabase is configured.' }
    }
    if (!email?.trim()) {
      return { success: false, message: 'Enter your email address first.' }
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/reset-password`
    })
    if (error) return { success: false, message: error.message }
    return { success: true, message: 'If that account exists, a password reset link has been sent.' }
  }

  const updatePassword = async ({ password, confirmPassword }) => {
    if (!supabase) {
      return { success: false, message: 'Password reset is available after Supabase is configured.' }
    }
    if (password.length < 8) {
      return { success: false, message: 'Password must be at least 8 characters long.' }
    }
    if (password !== confirmPassword) {
      return { success: false, message: 'Passwords do not match.' }
    }

    const { error } = await supabase.auth.updateUser({ password })
    if (error) return { success: false, message: error.message }
    return { success: true, message: 'Your password has been updated. You can continue to the admin portal.' }
  }

  const signOut = async () => {
    if (supabase) {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Unable to sign out of Supabase:', error.message)
        return
      }
    }
    setSession(null)
  }

  const value = useMemo(() => ({ session, loading, signIn, registerAdmin, requestPasswordReset, updatePassword, signOut }), [session, loading])

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
}

function ProtectedAdminRoute() {
  const { session, loading } = useAdminContext()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-cream flex items-center justify-center text-brand-navy">
        <div className="rounded-2xl border border-brand-navy/10 bg-white px-8 py-5 shadow-sm">
          <p className="text-lg font-semibold">Checking access…</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}

function RequireAdminPermission({ permission, children }) {
  const { session } = useAdminContext()
  const isAllowed = session?.role === 'super_admin' || (permission !== 'users' && session?.permissions?.includes(permission))
  return isAllowed ? children : <Navigate to="/admin/dashboard" replace />
}

function AdminLoginPage() {
  const { session, signIn, requestPasswordReset } = useAdminContext()
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ email: '', password: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (session) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [session, navigate])

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    const result = await signIn(form)

    if (result.success) {
      const redirectTo = location.state?.from || '/admin/dashboard'
      navigate(redirectTo, { replace: true })
      return
    }

    setMessage(result.message)
    setIsSubmitting(false)
  }

  const handleReset = async () => {
    const result = await requestPasswordReset(form.email)
    setMessage(result.message)
  }

  return (
    <main className="tt-admin-auth min-h-screen bg-brand-cream px-4 py-10 text-brand-navy">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[28px] border border-brand-navy/10 bg-white shadow-[0_22px_80px_rgba(32,56,88,0.08)]">
        <div className="grid md:grid-cols-2">
          <div className="bg-brand-navy px-8 py-10 text-white md:px-12">
            <p className="text-xs font-extrabold uppercase tracking-[0.25em] text-brand-orange">Secure access</p>
            <h1 className="mt-5 text-4xl font-black leading-tight font-display">Tomorrow's Tinkers admin</h1>
            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-200">
              Manage the website, enquiries, school partnerships, inventory, and scheduled activity from a single workspace.
            </p>
            <div className="mt-10 space-y-4 text-sm text-slate-200">
              <div className="flex items-center gap-3"><ShieldCheck className="h-4 w-4 text-brand-orange" /> Role-based admin access</div>
              <div className="flex items-center gap-3"><Activity className="h-4 w-4 text-brand-orange" /> Real dashboard policies and activity logs</div>
              <div className="flex items-center gap-3"><Settings className="h-4 w-4 text-brand-orange" /> Content publication workflows</div>
            </div>
          </div>

          <div className="px-6 py-8 md:px-10 md:py-10">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-orange-dark">Admin login</p>
                <h2 className="mt-2 text-3xl font-black font-display">Welcome back</h2>
              </div>
              <div className="rounded-xl bg-brand-cream p-3 text-brand-navy"><ShieldCheck className="h-6 w-6" /></div>
            </div>

            <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
              <label className="block text-sm font-semibold text-brand-navy">
                Email address
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="admin@tomorrowstinkers.com"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-brand-orange focus:bg-white"
                />
              </label>

              <label className="block text-sm font-semibold text-brand-navy">
                Password
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your admin password"
                  required
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-brand-orange focus:bg-white"
                />
              </label>

              {message && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{message}</div>}

              <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-brand-navy px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-navy-deep disabled:cursor-not-allowed disabled:opacity-70">
                {isSubmitting ? 'Signing in…' : 'Sign in'}
              </button>

              {DEMO_ADMIN_ACCOUNT && !isSupabaseConfigured && (
                <div className="rounded-2xl border border-brand-orange/20 bg-brand-cream px-4 py-3 text-sm text-brand-navy">
                  <p className="font-bold text-brand-orange-dark">Local development demo only</p>
                  <p className="mt-1">Email: <span className="font-semibold">{DEMO_ADMIN_ACCOUNT.email}</span></p>
                  <p>Password: <span className="font-semibold">{DEMO_ADMIN_ACCOUNT.password}</span></p>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={handleReset} className="font-semibold text-brand-orange-dark hover:text-brand-orange">Forgot password?</button>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => navigate('/admin/register')} className="font-semibold text-brand-navy/80 hover:text-brand-orange-dark">Create admin</button>
                  <a href="/" className="font-semibold text-brand-navy/80 hover:text-brand-orange-dark">Back to website</a>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}

function AdminResetPasswordPage() {
  const { updatePassword } = useAdminContext()
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirmPassword: '' })
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdated, setIsUpdated] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    const result = await updatePassword(form)
    setMessage(result.message)
    setIsUpdated(result.success)
    setIsSubmitting(false)
  }

  return (
    <main className="tt-admin-auth min-h-screen bg-brand-cream px-4 py-10 text-brand-navy">
      <div className="mx-auto max-w-xl rounded-[28px] border border-brand-navy/10 bg-white p-6 shadow-[0_22px_80px_rgba(32,56,88,0.08)] md:p-10">
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-orange-dark">Account recovery</p>
        <h1 className="mt-2 text-3xl font-black font-display">Set a new password</h1>
        <p className="mt-3 text-sm leading-6 text-brand-navy/70">Choose a new password for your administrator account.</p>

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-brand-navy">
            New password
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-brand-orange focus:bg-white"
            />
          </label>
          <label className="block text-sm font-semibold text-brand-navy">
            Confirm new password
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              required
              value={form.confirmPassword}
              onChange={(event) => setForm((current) => ({ ...current, confirmPassword: event.target.value }))}
              className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none transition focus:border-brand-orange focus:bg-white"
            />
          </label>

          {message && (
            <div className={`rounded-xl border px-3 py-2 text-sm ${isUpdated ? 'border-green-200 bg-green-50 text-green-800' : 'border-red-200 bg-red-50 text-red-700'}`}>
              {message}
            </div>
          )}

          {isUpdated ? (
            <button type="button" onClick={() => navigate('/admin/dashboard')} className="w-full rounded-xl bg-brand-navy px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-navy-deep">
              Continue to admin portal
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting} className="w-full rounded-xl bg-brand-navy px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-navy-deep disabled:cursor-not-allowed disabled:opacity-70">
              {isSubmitting ? 'Updating password…' : 'Update password'}
            </button>
          )}
        </form>

        <a href="/admin/login" className="mt-5 inline-block text-sm font-semibold text-brand-orange-dark hover:text-brand-orange">
          Return to admin login
        </a>
      </div>
    </main>
  )
}

function AdminRegisterPage() {
  const { registerAdmin, session } = useAdminContext()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' })
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (session) {
      navigate('/admin/dashboard', { replace: true })
    }
  }, [session, navigate])

  const handleChange = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setIsSubmitting(true)
    setMessage('')

    const result = await registerAdmin(form)
    if (!result.success) {
      setMessage(result.message)
      setIsSubmitting(false)
      return
    }

    setMessage(result.message)
    setIsSubmitting(false)
    setForm({ name: '', email: '', password: '', confirmPassword: '' })
  }

  return (
    <main className="tt-admin-auth min-h-screen bg-brand-cream px-4 py-10 text-brand-navy">
      <div className="mx-auto max-w-2xl rounded-[28px] border border-brand-navy/10 bg-white p-6 shadow-[0_22px_80px_rgba(32,56,88,0.08)] md:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-orange-dark">Registration</p>
            <h1 className="mt-2 text-3xl font-black font-display">Request admin access</h1>
            <p className="mt-2 max-w-lg text-sm text-slate-600">New accounts remain pending until an existing super administrator approves them.</p>
          </div>
          <div className="rounded-xl bg-brand-cream p-3 text-brand-navy"><Users className="h-6 w-6" /></div>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <label className="block text-sm font-semibold text-brand-navy">
            Full name
            <input name="name" value={form.name} onChange={handleChange} placeholder="Demo Admin" required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-brand-orange focus:bg-white" />
          </label>

          <label className="block text-sm font-semibold text-brand-navy">
            Email address
            <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="admin@example.com" required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-brand-orange focus:bg-white" />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-semibold text-brand-navy">
              Password
              <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Minimum 8 characters" required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-brand-orange focus:bg-white" />
            </label>
            <label className="block text-sm font-semibold text-brand-navy">
              Confirm password
              <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Repeat password" required className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm outline-none focus:border-brand-orange focus:bg-white" />
            </label>
          </div>

          {message && <div className="rounded-xl border border-brand-orange/20 bg-brand-cream px-3 py-2 text-sm text-brand-navy">{message}</div>}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="submit" disabled={isSubmitting} className="flex-1 rounded-xl bg-brand-navy px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-navy-deep disabled:cursor-not-allowed disabled:opacity-70">
              {isSubmitting ? 'Creating…' : 'Create admin account'}
            </button>
            <button type="button" onClick={() => navigate('/admin/login')} className="rounded-xl border border-brand-navy/10 px-4 py-3 text-sm font-bold text-brand-navy hover:bg-slate-50">Back to login</button>
          </div>
        </form>
      </div>
    </main>
  )
}

function AdminLayout() {
  const { signOut, session } = useAdminContext()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const pathMap = location.pathname.split('/').filter(Boolean)
  const crumbs = pathMap.slice(1).map((segment) => segment.replace(/-/g, ' '))

  return (
    <div className="tt-admin min-h-screen bg-brand-cream text-brand-navy">
      <div className="flex min-h-screen">
        {sidebarOpen && (
          <button
            type="button"
            aria-label="Close navigation menu"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-brand-navy/45 backdrop-blur-[2px] md:hidden"
          />
        )}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} tt-admin-sidebar fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 p-4 text-white transition-all duration-300 md:sticky md:top-0 md:h-screen md:translate-x-0 ${sidebarCollapsed ? 'md:w-20' : 'md:w-72'}`}>
          <div className={`flex items-center border-b border-white/10 pb-5 ${sidebarCollapsed ? 'justify-center md:justify-center' : 'justify-between'}`}>
            <div className={`flex items-center ${sidebarCollapsed ? 'justify-center md:justify-center' : 'gap-3'}`}>
              <img src={logo} alt="Tomorrow's Tinkers" title="Tomorrow's Tinkers" className="h-11 w-11 shrink-0 rounded-xl border border-white/15 object-cover shadow-md" />
              <div className={`min-w-0 ${sidebarCollapsed ? 'md:hidden' : ''}`}>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-orange">Admin workspace</p>
                <h2 className="mt-1 whitespace-nowrap text-lg font-black font-display">Tomorrow's Tinkers</h2>
              </div>
            </div>
            {!sidebarCollapsed && (
              <button type="button" onClick={() => setSidebarOpen(false)} aria-label="Close navigation menu" className="rounded-lg border border-white/10 p-2 hover:bg-white/5 md:hidden">
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <nav className="mt-7 space-y-1">
            {adminNav.filter(({ to }) => {
              const permission = to === '/admin/kit-content' ? 'website' : to.split('/').pop().replace('-', '_')
              return session?.role === 'super_admin' || (permission !== 'users' && (session?.permissions?.includes(permission) || session?.permissions?.includes(to.split('/').pop())))
            }).map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                title={sidebarCollapsed ? label : undefined}
                aria-label={sidebarCollapsed ? label : undefined}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `tt-admin-nav-link flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    sidebarCollapsed ? 'md:justify-center md:px-2' : ''
                  } ${isActive ? 'bg-brand-orange text-brand-navy shadow-sm' : 'text-slate-200 hover:bg-white/5 hover:text-white'}`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className={sidebarCollapsed ? 'md:hidden' : ''}>{label}</span>
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="tt-admin-main min-w-0 flex-1">
          <header className="border-b border-brand-navy/10 bg-white/80 backdrop-blur-md">
            <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation menu" className="rounded-xl border border-brand-navy/10 p-2 text-brand-navy md:hidden">
                  <Menu className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
                  aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                  className="hidden rounded-xl border border-brand-navy/10 bg-white p-2 text-brand-navy shadow-sm hover:border-brand-orange/50 hover:bg-brand-cream md:inline-flex"
                >
                  <ChevronLeft className={`h-5 w-5 transition-transform duration-300 ${sidebarCollapsed ? 'rotate-180' : ''}`} />
                </button>
                <div>
                  <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-orange-dark">Workspace</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-sm font-semibold text-brand-navy/70">
                    <span>admin</span>
                    {crumbs.length ? <ChevronRight className="h-3 w-3" /> : null}
                    {crumbs.map((crumb, index) => (
                      <span key={`${crumb}-${index}`}>{crumb}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 md:flex">
                  <Search className="h-4 w-4" />
                  <input placeholder="Search" className="w-32 bg-transparent outline-none" />
                </label>
                <button type="button" aria-label="Notifications" className="rounded-xl border border-slate-200 p-2 text-brand-navy hover:bg-slate-50"><Bell className="h-4 w-4" /></button>
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-navy text-xs font-bold text-white">{session?.name?.charAt(0) || 'A'}</div>
                  <div className="hidden text-left md:block">
                    <p className="text-sm font-semibold text-brand-navy">{session?.name || 'Admin'}</p>
                    <p className="text-[11px] text-slate-500">{session?.role || 'Super admin'}</p>
                  </div>
                  <button type="button" onClick={signOut} className="rounded-lg bg-brand-navy px-2 py-1.5 text-xs font-semibold text-white hover:bg-brand-navy-deep">
                    <span className="hidden sm:inline">Logout</span>
                    <LogOut className="h-3.5 w-3.5 sm:hidden" />
                  </button>
                </div>
              </div>
            </div>
          </header>

          <main className="tt-admin-content px-4 py-6 md:px-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, hint, tone = 'brand', detail }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <button
      type="button"
      className={`tt-stat-card tt-stat-card--${tone} ${flipped ? 'is-flipped' : ''}`}
      onClick={() => setFlipped((current) => !current)}
      aria-pressed={flipped}
      aria-label={`${label}: ${value}. ${flipped ? 'Show summary' : 'Show details'}`}
    >
      <span className="tt-stat-card-inner">
        <span className="tt-stat-face tt-stat-front">
          <span className="tt-stat-top">
            <span className="tt-stat-label">{label}</span>
            <span className="tt-stat-icon"><Gauge className="h-4 w-4" /></span>
          </span>
          <span className="tt-stat-bottom">
            <span className="tt-stat-value">{value}</span>
            <span className="tt-stat-hint">{hint}</span>
          </span>
          <span className="tt-stat-flip-hint">Click for details</span>
        </span>
        <span className="tt-stat-face tt-stat-back">
          <span className="tt-stat-back-title">Quick insight</span>
          <span className="tt-stat-back-copy">{detail}</span>
          <span className="tt-stat-back-action">Click to return</span>
        </span>
      </span>
    </button>
  )
}

function SectionCard({ title, action, children, className = '' }) {
  return (
    <section className={`tt-admin-panel rounded-3xl border border-brand-navy/10 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="text-lg font-black font-display text-brand-navy">{title}</h3>
        {action}
      </div>
      {children}
    </section>
  )
}

function DashboardPage() {
  const { session } = useAdminContext()
  const [snapshot, setSnapshot] = useState(null)
  const [dashboardLoading, setDashboardLoading] = useState(false)
  const [dashboardError, setDashboardError] = useState('')
  const [selectedRange, setSelectedRange] = useState('30 days')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  useEffect(() => {
    if (!supabase || !session) {
      setSnapshot(null)
      setDashboardError('')
      setDashboardLoading(false)
      return
    }

    let active = true
    const now = new Date()
    const rangeEnd = selectedRange === 'Custom range' && customEnd
      ? new Date(`${customEnd}T23:59:59`)
      : now
    const rangeStart = selectedRange === 'Custom range' && customStart
      ? new Date(`${customStart}T00:00:00`)
      : new Date(now.getTime() - (selectedRange === '7 days' ? 7 : selectedRange === '90 days' ? 90 : 30) * 24 * 60 * 60 * 1000)

    if (selectedRange === 'Custom range' && (!customStart || !customEnd)) {
      setDashboardError('Choose both dates to load the custom range.')
      setDashboardLoading(false)
      return undefined
    }

    if (rangeStart > rangeEnd) {
      setDashboardError('Start date must be before end date.')
      setDashboardLoading(false)
      return undefined
    }

    setDashboardLoading(true)
    setDashboardError('')
    supabase.rpc('get_admin_dashboard_snapshot', {
      range_start: rangeStart.toISOString(),
      range_end: rangeEnd.toISOString()
    }).then(({ data, error }) => {
      if (!active) return
      if (error) {
        console.error('Unable to load dashboard data:', error.message)
        setDashboardError(`Could not load live dashboard data: ${error.message}`)
        setSnapshot(null)
      } else {
        setSnapshot(data)
      }
      setDashboardLoading(false)
    }).catch((error) => {
      if (!active) return
      console.error('Unable to load dashboard data:', error)
      setDashboardError('Could not load live dashboard data. Please try again.')
      setDashboardLoading(false)
    })

    return () => {
      active = false
    }
  }, [session, selectedRange, customStart, customEnd])

  const demoMetrics = {
    total_enquiries: 248,
    new_enquiries: 18,
    active_schools: 32,
    upcoming_demos: 9,
    total_kits: 410,
    available_stock: 186,
    low_stock_alerts: 7,
    pending_deliveries: 12
  }
  const metrics = snapshot?.metrics || (isSupabaseConfigured ? {} : demoMetrics)
  const chartData = (key, demoData) => snapshot ? snapshot[key] || [] : isSupabaseConfigured ? [] : demoData

  const statCards = [
    { label: 'Total school enquiries', value: metrics.total_enquiries ?? (dashboardLoading ? '…' : '—'), hint: 'All time', detail: 'View the enquiries module to review every lead and its current status.', tone: 'brand' },
    { label: 'New enquiries', value: metrics.new_enquiries ?? (dashboardLoading ? '…' : '—'), hint: 'Needs review', detail: 'Open the CRM module to triage newly submitted school enquiries.', tone: 'orange' },
    { label: 'Active partner schools', value: metrics.active_schools ?? (dashboardLoading ? '…' : '—'), hint: 'Partners', detail: 'Open school partnerships to review active relationships and progress.', tone: 'cream' },
    { label: 'Upcoming demonstrations', value: metrics.upcoming_demos ?? (dashboardLoading ? '…' : '—'), hint: 'Scheduled', detail: 'Open schedule and events to review upcoming demonstrations.', tone: 'white' },
    { label: 'Total robotics kits', value: metrics.total_kits ?? (dashboardLoading ? '…' : '—'), hint: 'Inventory', detail: 'Open inventory to review kit catalog and stock allocation.', tone: 'brand' },
    { label: 'Available kit stock', value: metrics.available_stock ?? (dashboardLoading ? '…' : '—'), hint: 'Available', detail: 'Open inventory to review kits currently available for allocation.', tone: 'white' },
    { label: 'Low-stock alerts', value: metrics.low_stock_alerts ?? (dashboardLoading ? '…' : '—'), hint: 'Attention', detail: 'Review inventory items that may need replenishment.', tone: 'orange' },
    { label: 'Pending deliveries', value: metrics.pending_deliveries ?? (dashboardLoading ? '…' : '—'), hint: 'In progress', detail: 'Review deliveries that are not yet marked complete.', tone: 'cream' }
  ]

  const demoEnquiriesByMonth = [
    { month: 'Jan', value: 22 },
    { month: 'Feb', value: 30 },
    { month: 'Mar', value: 28 },
    { month: 'Apr', value: 42 },
    { month: 'May', value: 38 },
    { month: 'Jun', value: 51 }
  ]

  const demoStockDistribution = [
    { name: 'Ready', value: 54 },
    { name: 'In use', value: 28 },
    { name: 'Low stock', value: 12 },
    { name: 'Queued', value: 6 }
  ]

  const demoSchedule = [
    { month: 'Jan', demos: 2 },
    { month: 'Feb', demos: 3 },
    { month: 'Mar', demos: 4 },
    { month: 'Apr', demos: 5 },
    { month: 'May', demos: 4 },
    { month: 'Jun', demos: 6 }
  ]

  const demoSchoolPerformance = [
    { name: 'DPS', value: 32 },
    { name: 'Vikas', value: 25 },
    { name: 'St. Peters', value: 20 },
    { name: 'New Age', value: 18 },
    { name: 'Bharat', value: 17 }
  ]

  const demoSchoolsByMonth = [
    { month: 'Jan', value: 3 },
    { month: 'Feb', value: 5 },
    { month: 'Mar', value: 4 },
    { month: 'Apr', value: 7 },
    { month: 'May', value: 6 },
    { month: 'Jun', value: 8 }
  ]

  const demoEnquiryStatus = [
    { name: 'New', value: 18 },
    { name: 'Contacted', value: 44 },
    { name: 'Qualified', value: 31 },
    { name: 'Converted', value: 22 }
  ]

  const demoActivities = [
    { title: 'New school partnership request', meta: 'Bluebells Academy • 12 mins ago' },
    { title: 'Inventory alert for Arduino kits', meta: 'Stockroom • 1 hr ago' },
    { title: 'Demo scheduled for DPS Bengaluru', meta: 'Schedule • Today' },
    { title: 'Homepage update published', meta: 'Website • Yesterday' }
  ]

  const actions = [
    'Add School',
    'Add Robotics Kit',
    'Schedule Demo',
    'Add Testimonial',
    'Create Announcement',
    'View New Enquiries'
  ]

  return (
    <div className="tt-dashboard space-y-4">
      <div className="admin-page-heading flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-orange-dark">Overview</p>
          <h1 className="mt-1 text-3xl font-black font-display text-brand-navy">Operations dashboard</h1>
          <p className="mt-1 text-xs text-brand-navy/60">Schools, enquiries and daily operations at a glance.</p>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          {['7 days', '30 days', '90 days', 'Custom range'].map((item) => (
            <button key={item} type="button" onClick={() => setSelectedRange(item)} className={`rounded-xl border px-3 py-2 font-semibold ${selectedRange === item ? 'border-brand-orange bg-brand-orange text-brand-navy' : 'border-brand-navy/10 bg-white text-brand-navy hover:border-brand-navy/30'}`}>
              {item}
            </button>
          ))}
          {selectedRange === 'Custom range' && (
            <div className="flex w-full flex-wrap gap-2 md:w-auto">
              <label className="sr-only" htmlFor="dashboard-start-date">Start date</label>
              <input id="dashboard-start-date" aria-label="Start date" type="date" value={customStart} onChange={(event) => setCustomStart(event.target.value)} className="rounded-xl border border-brand-navy/10 bg-white px-2 py-2 text-xs" />
              <label className="sr-only" htmlFor="dashboard-end-date">End date</label>
              <input id="dashboard-end-date" aria-label="End date" type="date" value={customEnd} onChange={(event) => setCustomEnd(event.target.value)} className="rounded-xl border border-brand-navy/10 bg-white px-2 py-2 text-xs" />
            </div>
          )}
        </div>
      </div>

      {dashboardError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">{dashboardError}</div>}
      {!isSupabaseConfigured && <div className="rounded-xl border border-brand-orange/20 bg-brand-cream px-4 py-2 text-[11px] font-semibold text-brand-orange-dark">Preview data — configure Supabase and apply the database migration to view live records.</div>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 2xl:grid-cols-8">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard title="Enquiries over time" className="xl:col-span-1">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData('enquiries_by_month', demoEnquiriesByMonth)}>
                <defs>
                  <linearGradient id="enquiriesFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f29a3f" stopOpacity={0.6} />
                    <stop offset="100%" stopColor="#f29a3f" stopOpacity={0.08} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#f29a3f" strokeWidth={3} fill="url(#enquiriesFill)" />
              </AreaChart>
            </ResponsiveContainer>
            {!chartData('enquiries_by_month', demoEnquiriesByMonth).length && <p className="pt-2 text-center text-xs text-slate-400">No enquiry data in this date range.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Enquiries by status">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData('enquiries_by_status', demoEnquiryStatus)} dataKey="value" nameKey="name" innerRadius={45} outerRadius={67} paddingAngle={4}>
                  {chartData('enquiries_by_status', demoEnquiryStatus).map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={chartPalette[index % chartPalette.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {!chartData('enquiries_by_status', demoEnquiryStatus).length && <p className="pt-2 text-center text-xs text-slate-400">No enquiry status data yet.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Inventory stock distribution">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chartData('inventory_distribution', demoStockDistribution)} dataKey="value" nameKey="name" innerRadius={48} outerRadius={68} paddingAngle={4}>
                  {chartData('inventory_distribution', demoStockDistribution).map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={chartPalette[index % chartPalette.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Share']} />
              </PieChart>
            </ResponsiveContainer>
            {!chartData('inventory_distribution', demoStockDistribution).some((entry) => entry.value > 0) && <p className="pt-2 text-center text-xs text-slate-400">No inventory records yet.</p>}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <SectionCard title="New school partnerships">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData('schools_by_month', demoSchoolsByMonth)}>
                <defs>
                  <linearGradient id="schoolsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#668fb5" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#668fb5" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#668fb5" strokeWidth={2} fill="url(#schoolsFill)" />
              </AreaChart>
            </ResponsiveContainer>
            {!chartData('schools_by_month', demoSchoolsByMonth).length && <p className="pt-2 text-center text-xs text-slate-400">No new schools in this date range.</p>}
          </div>
        </SectionCard>

        <SectionCard title="School allocation by school">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData('kits_by_school', demoSchoolPerformance)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#203858" />
              </BarChart>
            </ResponsiveContainer>
            {!chartData('kits_by_school', demoSchoolPerformance).length && <p className="pt-2 text-center text-xs text-slate-400">No kit allocations in this date range.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Scheduled demonstrations">
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData('demos_by_month', demoSchedule)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="demos" stroke="#7f9e77" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
            {!chartData('demos_by_month', demoSchedule).length && <p className="pt-2 text-center text-xs text-slate-400">No demonstrations in this date range.</p>}
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard title="Recent activity">
          <div className="space-y-3">
            {(chartData('recent_activity', demoActivities)).map((item) => (
              <div key={item.title} className="flex items-start gap-3 rounded-2xl border border-brand-navy/10 bg-slate-50 p-3">
                <div className="mt-1 rounded-full bg-brand-orange p-2 text-brand-navy"><Activity className="h-3.5 w-3.5" /></div>
                <div>
                  <p className="font-semibold text-brand-navy">{item.title}</p>
                  <p className="text-sm text-slate-500">{item.meta}</p>
                </div>
              </div>
            ))}
            {!chartData('recent_activity', demoActivities).length && <p className="text-xs text-slate-400">No recent activity has been logged.</p>}
          </div>
        </SectionCard>

        <SectionCard title="Quick actions">
          <div className="grid gap-3 sm:grid-cols-2">
            {actions.map((action) => (
              <button key={action} type="button" className="flex items-center justify-between rounded-2xl border border-brand-navy/10 bg-brand-cream px-4 py-3 text-left text-sm font-semibold text-brand-navy transition hover:border-brand-orange hover:bg-brand-orange/20">
                {action}
                <ArrowRight className="h-4 w-4" />
              </button>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  )
}

function WebsitePage() {
  const { session } = useAdminContext()
  const [content, setContent] = useState(() => {
    if (!isSupabaseConfigured) {
      const saved = localStorage.getItem('tt-admin-website-content')
      if (!saved) return defaultWebsiteContent
      try {
        const parsed = JSON.parse(saved)
        return { ...defaultWebsiteContent, ...(parsed.content || parsed) }
      } catch (error) {
        console.error('Unable to restore the local website draft:', error)
        return defaultWebsiteContent
      }
    }
    return defaultWebsiteContent
  })
  const [status, setStatus] = useState(() => {
    if (isSupabaseConfigured) return 'Draft'
    try {
      const saved = JSON.parse(localStorage.getItem('tt-admin-website-content') || 'null')
      return saved?.status === 'published' ? 'Published in local preview' : 'Draft'
    } catch (error) {
      console.error('Unable to restore the local website draft:', error)
      return 'Draft'
    }
  })
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return undefined
    }

    let active = true
    supabase
      .from('website_content')
      .select('content, status, updated_at')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data, error: loadError }) => {
        if (!active) return
        if (loadError) {
          console.error('Unable to load website content:', loadError.message)
          setError(`Could not load website content: ${loadError.message}`)
        } else if (data) {
          setContent({ ...defaultWebsiteContent, ...data.content })
          setStatus(data.status === 'published' ? 'Published' : 'Draft')
        }
        setLoading(false)
      })
      .catch((loadError) => {
        if (!active) return
        console.error('Unable to load website content:', loadError)
        setError('Could not load website content. Please try again.')
        setLoading(false)
      })

    return () => {
      active = false
    }
  }, [])

  const updateField = (field, value) => {
    setContent((current) => ({ ...current, [field]: value }))
  }

  const saveContent = async (nextStatus) => {
    setSaving(true)
    setError('')
    if (!supabase) {
      localStorage.setItem('tt-admin-website-content', JSON.stringify({ content, status: nextStatus }))
      setStatus(nextStatus === 'published' ? 'Published in local preview' : 'Draft saved locally')
      setSaving(false)
      return
    }

    try {
      const { error: saveError } = await supabase.from('website_content').insert({
        content,
        status: nextStatus,
        updated_by: session.id,
        published_at: nextStatus === 'published' ? new Date().toISOString() : null
      })

      if (saveError) {
        console.error('Unable to save website content:', saveError.message)
        setError(`Could not ${nextStatus === 'published' ? 'publish' : 'save draft'}: ${saveError.message}`)
      } else {
        setStatus(nextStatus === 'published' ? 'Published' : 'Draft saved')
      }
    } catch (saveError) {
      console.error('Unable to save website content:', saveError)
      setError(`Could not ${nextStatus === 'published' ? 'publish' : 'save draft'}. Please try again.`)
    } finally {
      setSaving(false)
    }
  }

  const publish = async () => {
    if (!window.confirm('Publish this website content version?')) return
    await saveContent('published')
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-orange-dark">Website</p>
          <h1 className="mt-2 text-3xl font-black font-display text-brand-navy">Homepage CMS</h1>
        </div>
        <div className="flex flex-wrap gap-2 text-sm">
          <button type="button" disabled={saving || loading} onClick={() => saveContent('draft')} className="rounded-xl border border-brand-navy/10 bg-white px-3 py-2 font-semibold text-brand-navy hover:border-brand-navy/30 disabled:opacity-50">{saving ? 'Saving…' : 'Save draft'}</button>
          <button type="button" disabled={saving || loading} onClick={publish} className="rounded-xl bg-brand-navy px-3 py-2 font-semibold text-white hover:bg-brand-navy-deep disabled:opacity-50">{saving ? 'Saving…' : 'Publish'}</button>
        </div>
      </div>

      <div className="rounded-2xl border border-brand-navy/10 bg-white p-4 text-sm font-semibold text-brand-navy">
        Status: <span className="text-brand-orange-dark">{loading ? 'Loading…' : status}</span>
      </div>
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}

      <div className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Hero section">
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-brand-navy">Hero heading
              <input value={content.heroTitle} onChange={(event) => updateField('heroTitle', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-orange" />
            </label>
            <label className="block text-sm font-semibold text-brand-navy">Hero subtitle
              <textarea value={content.heroSubtitle} onChange={(event) => updateField('heroSubtitle', event.target.value)} rows="3" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-orange" />
            </label>
            <label className="block text-sm font-semibold text-brand-navy">Hero description
              <textarea value={content.heroDescription} onChange={(event) => updateField('heroDescription', event.target.value)} rows="3" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-orange" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-brand-navy">CTA text
                <input value={content.ctaText} onChange={(event) => updateField('ctaText', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-orange" />
              </label>
              <label className="block text-sm font-semibold text-brand-navy">CTA destination
                <input value={content.ctaLink} onChange={(event) => updateField('ctaLink', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-orange" />
              </label>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="About and stats">
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-brand-navy">About/company description
              <textarea value={content.about} onChange={(event) => updateField('about', event.target.value)} rows="5" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-orange" />
            </label>
            <label className="block text-sm font-semibold text-brand-navy">Homepage stats
              <textarea value={content.stats.join('\n')} onChange={(event) => updateField('stats', event.target.value.split('\n').filter(Boolean))} rows="4" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-orange" />
            </label>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="FAQ and footer links">
        <div className="grid gap-6 xl:grid-cols-2">
          <div className="space-y-3">
            {content.faq.map((item, index) => (
              <div key={index} className="rounded-2xl border border-brand-navy/10 bg-slate-50 p-3">
                <label className="block text-sm font-semibold text-brand-navy">Question
                  <input value={item.question} onChange={(event) => {
                    const nextFaq = [...content.faq]
                    nextFaq[index] = { ...nextFaq[index], question: event.target.value }
                    updateField('faq', nextFaq)
                  }} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-orange" />
                </label>
                <label className="mt-3 block text-sm font-semibold text-brand-navy">Answer
                  <textarea value={item.answer} onChange={(event) => {
                    const nextFaq = [...content.faq]
                    nextFaq[index] = { ...nextFaq[index], answer: event.target.value }
                    updateField('faq', nextFaq)
                  }} rows="3" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-orange" />
                </label>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <label className="block text-sm font-semibold text-brand-navy">Contact email
              <input value={content.footerEmail} onChange={(event) => updateField('footerEmail', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-orange" />
            </label>
            <label className="block text-sm font-semibold text-brand-navy">Phone number
              <input value={content.footerPhone} onChange={(event) => updateField('footerPhone', event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none focus:border-brand-orange" />
            </label>
            <div className="rounded-2xl border border-brand-navy/10 bg-slate-50 p-4">
              <p className="text-sm font-semibold text-brand-navy">Social links</p>
              <div className="mt-3 space-y-3 text-sm">
                <label className="block">Instagram <input value={content.socials.instagram} onChange={(event) => updateField('socials', { ...content.socials, instagram: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-orange" /></label>
                <label className="block">LinkedIn <input value={content.socials.linkedin} onChange={(event) => updateField('socials', { ...content.socials, linkedin: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-orange" /></label>
                <label className="block">WhatsApp <input value={content.socials.whatsapp} onChange={(event) => updateField('socials', { ...content.socials, whatsapp: event.target.value })} className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-brand-orange" /></label>
              </div>
            </div>
          </div>
        </div>
      </SectionCard>
    </div>
  )
}

function EnquiriesPage() {
  const rows = [
    { name: 'Ariana Singh', school: 'Bangalore Public School', status: 'New', date: 'Today' },
    { name: 'Rohit Sharma', school: 'Green Valley Academy', status: 'Qualified', date: 'Yesterday' },
    { name: 'Priya Nair', school: 'Kite International', status: 'Follow up', date: '2 days ago' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-orange-dark">CRM</p>
          <h1 className="mt-2 text-3xl font-black font-display text-brand-navy">Enquiries</h1>
        </div>
        <button type="button" className="rounded-xl bg-brand-navy px-3 py-2 text-sm font-bold text-white">Export</button>
      </div>

      <SectionCard title="School enquiries">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-brand-navy/70">
              <tr className="border-b border-brand-navy/10">
                <th className="pb-3 pr-4">School leader</th>
                <th className="pb-3 pr-4">School</th>
                <th className="pb-3 pr-4">Status</th>
                <th className="pb-3 pr-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.name} className="border-b border-brand-navy/5 align-top">
                  <td className="py-3 pr-4 font-semibold">{row.name}</td>
                  <td className="py-3 pr-4">{row.school}</td>
                  <td className="py-3 pr-4"><span className="rounded-full bg-brand-orange/15 px-2 py-1 text-xs font-bold text-brand-orange-dark">{row.status}</span></td>
                  <td className="py-3 pr-4">{row.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  )
}

function SchoolsPage() {
  const schools = [
    { name: 'Bangalore Public School', stage: 'Pilot active', progress: '82%' },
    { name: 'St. Peters Academy', stage: 'Partner school', progress: '93%' },
    { name: 'Vikas Valley', stage: 'Demo booked', progress: '67%' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-orange-dark">Schools</p>
          <h1 className="mt-2 text-3xl font-black font-display text-brand-navy">Partnerships</h1>
        </div>
        <button type="button" className="rounded-xl bg-brand-orange px-3 py-2 text-sm font-bold text-brand-navy">Add School</button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {schools.map((school) => (
          <div key={school.name} className="rounded-3xl border border-brand-navy/10 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-cream text-brand-navy"><Building2 className="h-5 w-5" /></div>
              <span className="rounded-full bg-brand-cream px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-navy">{school.stage}</span>
            </div>
            <h3 className="mt-4 text-xl font-black font-display text-brand-navy">{school.name}</h3>
            <p className="mt-2 text-sm text-slate-500">Implementation progress</p>
            <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-brand-navy" style={{ width: school.progress }}></div>
            </div>
            <p className="mt-3 text-sm font-semibold text-brand-orange-dark">{school.progress} complete</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function KitsPage() {
  const kits = [
    { name: 'Starter Robotics Kit', stock: 42, status: 'Healthy' },
    { name: 'Sensors + IoT Pack', stock: 18, status: 'Low stock' },
    { name: 'Advanced Build Kit', stock: 9, status: 'Restock soon' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-orange-dark">Inventory</p>
          <h1 className="mt-2 text-3xl font-black font-display text-brand-navy">Robotics kits</h1>
        </div>
        <button type="button" className="rounded-xl bg-brand-navy px-3 py-2 text-sm font-bold text-white">Add kit</button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {kits.map((kit) => (
          <div key={kit.name} className="rounded-3xl border border-brand-navy/10 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-orange/10 text-brand-orange-dark"><Package2 className="h-5 w-5" /></div>
              <span className="rounded-full bg-brand-cream px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-navy">{kit.status}</span>
            </div>
            <h3 className="mt-4 text-xl font-black font-display text-brand-navy">{kit.name}</h3>
            <p className="mt-2 text-sm text-slate-500">Available stock</p>
            <p className="mt-2 text-3xl font-black font-display text-brand-navy">{kit.stock}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SchedulePage() {
  const demos = [
    { event: 'Primary Robotics Demo', date: '12 Oct 2026', location: 'Bengaluru' },
    { event: 'STEM Expo Setup', date: '22 Oct 2026', location: 'Mumbai' },
    { event: 'Teacher Mentor Roundtable', date: '30 Oct 2026', location: 'Hyderabad' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-orange-dark">Schedule</p>
          <h1 className="mt-2 text-3xl font-black font-display text-brand-navy">Events and demos</h1>
        </div>
        <button type="button" className="rounded-xl bg-brand-orange px-3 py-2 text-sm font-bold text-brand-navy">Schedule demo</button>
      </div>

      <div className="space-y-3">
        {demos.map((item) => (
          <div key={item.event} className="flex flex-col gap-2 rounded-2xl border border-brand-navy/10 bg-white p-4 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-lg font-black font-display text-brand-navy">{item.event}</p>
              <p className="text-sm text-slate-500">{item.location}</p>
            </div>
            <p className="text-sm font-semibold text-brand-orange-dark">{item.date}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function MediaPage() {
  const items = [
    { title: 'New robotics showcase reel', type: 'Video' },
    { title: 'Teacher workshop gallery', type: 'Gallery' },
    { title: 'Student success story', type: 'Testimonial' }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-orange-dark">Media</p>
          <h1 className="mt-2 text-3xl font-black font-display text-brand-navy">Testimonials and media</h1>
        </div>
        <button type="button" className="rounded-xl bg-brand-navy px-3 py-2 text-sm font-bold text-white">Add media</button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {items.map((item) => (
          <div key={item.title} className="rounded-3xl border border-brand-navy/10 bg-white p-5 shadow-sm">
            <div className="flex h-40 items-center justify-center rounded-2xl bg-brand-cream text-brand-navy"><ImageIcon className="h-8 w-8" /></div>
            <p className="mt-4 text-lg font-black font-display text-brand-navy">{item.title}</p>
            <span className="mt-2 inline-flex rounded-full bg-brand-orange/15 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-brand-orange-dark">{item.type}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [savingId, setSavingId] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  const loadUsers = async () => {
    if (!supabase) {
      setLoading(false)
      setError('Configure Supabase and apply the admin migration to manage accounts.')
      return
    }

    setLoading(true)
    setError('')
    const { data, error: loadError } = await supabase
      .from('admin_profiles')
      .select('id, email, full_name, role, active, permissions, created_at')
      .order('created_at', { ascending: false })

    if (loadError) {
      console.error('Unable to load admin profiles:', loadError.message)
      setError(`Could not load admin accounts: ${loadError.message}`)
    } else {
      setUsers(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    void loadUsers()
  }, [])

  const togglePermission = (userId, permission) => {
    setUsers((current) => current.map((user) => {
      if (user.id !== userId) return user
      const currentPermissions = user.permissions || []
      const permissions = currentPermissions.includes(permission)
        ? currentPermissions.filter((item) => item !== permission)
        : [...currentPermissions, permission]
      return { ...user, permissions }
    }))
  }

  const updateUser = async (user, activate = false) => {
    if (!supabase) return
    setSavingId(user.id)
    setError('')
    setNotice('')
    const updates = {
      permissions: user.permissions || [],
      ...(activate ? {
        active: true,
        role: 'admin',
        permissions: user.permissions?.length ? user.permissions : ['dashboard']
      } : {})
    }
    const { error: updateError } = await supabase
      .from('admin_profiles')
      .update(updates)
      .eq('id', user.id)

    if (updateError) {
      console.error('Unable to update admin profile:', updateError.message)
      setError(`Could not update ${user.email}: ${updateError.message}`)
    } else {
      setNotice(activate ? `${user.email} has been approved.` : `Permissions saved for ${user.email}.`)
      await loadUsers()
    }
    setSavingId('')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-orange-dark">Users</p>
          <h1 className="mt-2 text-3xl font-black font-display text-brand-navy">Admin access</h1>
        </div>
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {notice && <div role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</div>}

      <SectionCard title="Admin accounts" action={<button type="button" onClick={loadUsers} className="rounded-lg border border-brand-navy/10 bg-white px-3 py-2 text-xs font-bold text-brand-navy">Refresh</button>}>
        {loading ? <p className="text-sm text-slate-500">Loading admin accounts…</p> : users.length === 0 ? (
          <div className="rounded-xl bg-brand-cream px-4 py-5 text-sm text-brand-navy/70">No administrator registrations have been submitted.</div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <article key={user.id} className="rounded-2xl border border-brand-navy/10 bg-slate-50 p-4">
                <div className="flex flex-col gap-3 border-b border-brand-navy/10 pb-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-bold text-brand-navy">{user.full_name || 'Admin user'}</p>
                    <p className="text-xs text-slate-500">{user.email} · {user.role}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${user.active ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                      {user.active ? 'Active' : 'Pending'}
                    </span>
                    {!user.active && user.role === 'pending' && (
                      <button type="button" disabled={savingId === user.id} onClick={() => updateUser(user, true)} className="rounded-lg bg-brand-navy px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
                        {savingId === user.id ? 'Approving…' : 'Approve as admin'}
                      </button>
                    )}
                    {user.role !== 'super_admin' && user.active && (
                      <button type="button" disabled={savingId === user.id} onClick={() => updateUser(user)} className="rounded-lg bg-brand-navy px-3 py-2 text-xs font-bold text-white disabled:opacity-50">
                        {savingId === user.id ? 'Saving…' : 'Save permissions'}
                      </button>
                    )}
                  </div>
                </div>
                {user.role !== 'super_admin' && (
                  <fieldset disabled={!user.active || savingId === user.id} className="mt-3">
                    <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-brand-navy/65">Module access</legend>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {adminPermissionOptions.map(([permission, label]) => (
                        <label key={permission} className="flex items-center gap-2 rounded-lg border border-brand-navy/5 bg-white px-3 py-2 text-xs font-semibold text-brand-navy">
                          <input type="checkbox" checked={(user.permissions || []).includes(permission)} onChange={() => togglePermission(user.id, permission)} />
                          {label}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                )}
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}

function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-orange-dark">Settings</p>
        <h1 className="mt-2 text-3xl font-black font-display text-brand-navy">Workspace preferences</h1>
      </div>

      <SectionCard title="General settings">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm font-semibold text-brand-navy">Business name <input defaultValue="Tomorrow's Tinkers" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none" /></label>
          <label className="text-sm font-semibold text-brand-navy">Timezone <input defaultValue="Asia/Kolkata" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none" /></label>
          <label className="text-sm font-semibold text-brand-navy">Support email <input defaultValue="hello@tomorrowstinkers.com" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none" /></label>
          <label className="text-sm font-semibold text-brand-navy">Default lead source <input defaultValue="Website form" className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm outline-none" /></label>
        </div>
      </SectionCard>
    </div>
  )
}

function AuditLogsPage() {
  const logs = [
    { action: 'Homepage published', time: '10:42 AM', user: 'System Admin' },
    { action: 'Inventory stock updated', time: '09:18 AM', user: 'Rakesh Iyer' },
    { action: 'School partnership status changed', time: 'Yesterday', user: 'Julie Mathew' }
  ]

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-orange-dark">Audit</p>
        <h1 className="mt-2 text-3xl font-black font-display text-brand-navy">Audit logs</h1>
      </div>

      <SectionCard title="Recent actions">
        <div className="space-y-3">
          {logs.map((log) => (
            <div key={`${log.action}-${log.time}`} className="flex items-center justify-between gap-3 rounded-2xl border border-brand-navy/10 bg-slate-50 p-3">
              <div>
                <p className="font-semibold text-brand-navy">{log.action}</p>
                <p className="text-sm text-slate-500">{log.user}</p>
              </div>
              <span className="text-sm font-semibold text-brand-orange-dark">{log.time}</span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  )
}

function KitDetailContentPageRoute() {
  const { session } = useAdminContext()
  return <KitDetailContentPage session={session} />
}

export default function AdminApp() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLoginPage />} />
        <Route path="register" element={<AdminRegisterPage />} />
        <Route path="reset-password" element={<AdminResetPasswordPage />} />
        <Route element={<ProtectedAdminRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="dashboard" element={<RequireAdminPermission permission="dashboard"><DashboardPage /></RequireAdminPermission>} />
            <Route path="website" element={<RequireAdminPermission permission="website"><WebsitePage /></RequireAdminPermission>} />
            <Route path="kit-content" element={<RequireAdminPermission permission="website"><KitDetailContentPageRoute /></RequireAdminPermission>} />
            <Route path="enquiries" element={<RequireAdminPermission permission="enquiries"><EnquiriesPage /></RequireAdminPermission>} />
            <Route path="schools" element={<RequireAdminPermission permission="schools"><SchoolsPage /></RequireAdminPermission>} />
            <Route path="kits" element={<RequireAdminPermission permission="kits"><KitsPage /></RequireAdminPermission>} />
            <Route path="schedule" element={<RequireAdminPermission permission="schedule"><SchedulePage /></RequireAdminPermission>} />
            <Route path="media" element={<RequireAdminPermission permission="media"><MediaPage /></RequireAdminPermission>} />
            <Route path="users" element={<RequireAdminPermission permission="users"><UsersPage /></RequireAdminPermission>} />
            <Route path="settings" element={<RequireAdminPermission permission="settings"><SettingsPage /></RequireAdminPermission>} />
            <Route path="audit-logs" element={<RequireAdminPermission permission="audit_logs"><AuditLogsPage /></RequireAdminPermission>} />
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </AdminAuthProvider>
  )
}
