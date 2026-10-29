import { useState } from 'react'
import { ArrowRight, CheckCircle2 } from 'lucide-react'

const initial = { name: '', school: '', email: '', phone: '', city: '', students: '', message: '' }

export default function LeadForm() {
  const [form, setForm] = useState(initial)
  const [status, setStatus] = useState('idle')
  const [error, setError] = useState('')
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  function submit(e) {
    e.preventDefault()
    setError('')
    if (!form.name.trim() || !form.school.trim() || !form.phone.trim()) {
      setError('Please fill in your name, school name and phone number.')
      return
    }
    const subject = encodeURIComponent(`Robotics demo enquiry — ${form.school}`)
    const body = encodeURIComponent(
      `Hello Tomorrow's Tinkers,\\n\\nI'd like to enquire about a school robotics demo.\\n\\nName: ${form.name}\\nSchool: ${form.school}\\nEmail: ${form.email}\\nPhone: ${form.phone}\\nCity: ${form.city}\\nStudent age groups / grades: ${form.students}\\nMessage: ${form.message}\\n`
    )
    setStatus('ready')
    window.location.href = `mailto:sujalkalamkar2213@gmail.com?subject=${subject}&body=${body}`
  }

  return (
    <form className="lead-form" onSubmit={submit}>
      <div className="form-heading"><span className="eyebrow">LET'S GET STARTED</span><h2>Tell us about your school.</h2><p>Share a few details and start a conversation with our team.</p></div>
      <div className="form-grid">
        <label>Your name *<input name="name" value={form.name} onChange={update} placeholder="e.g. Priya Sharma" autoComplete="name" required /></label>
        <label>School name *<input name="school" value={form.school} onChange={update} placeholder="Your school" required /></label>
        <label>Work email<input name="email" value={form.email} onChange={update} type="email" placeholder="you@school.edu.in" autoComplete="email" /></label>
        <label>Phone number *<input name="phone" value={form.phone} onChange={update} type="tel" placeholder="+91" autoComplete="tel" required /></label>
        <label>City<input name="city" value={form.city} onChange={update} placeholder="e.g. Pune" /></label>
        <label>Grades / age groups<select name="students" value={form.students} onChange={update}><option value="">Select grades</option><option>Primary school</option><option>Middle school</option><option>Secondary school</option><option>Multiple age groups</option></select></label>
        <label className="full-field">Anything else we should know?<textarea name="message" value={form.message} onChange={update} placeholder="Tell us about your school's goals..." rows="4" /></label>
      </div>
      {error && <p className="form-error" role="alert">{error}</p>}
      {status === 'ready' && <p className="form-note"><CheckCircle2 size={17}/> Your email app should open with your enquiry pre-filled. Send it to complete your request.</p>}
      <button className="button button-primary form-submit" type="submit">Request a demo <ArrowRight size={17}/></button>
      <p className="form-privacy">Your details will only be used to respond to this enquiry.</p>
    </form>
  )
}