import { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Bot, Check, ChevronDown, CircuitBoard, Code2, GraduationCap, Lightbulb, MoveRight, Puzzle, Sparkles, Users, Wrench, BookOpen, Cpu, School, Layers3, MessageCircle, Zap, Target, Radar } from 'lucide-react'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import ProjectCard from './components/ProjectCard.jsx'
import LeadForm from './components/LeadForm.jsx'
import AboutPage from './components/AboutPage.jsx'
import KitsPage from './components/KitsPage.jsx'
import KitDetailPage from './components/KitDetailPage.jsx'
import LoginPage from './components/LoginPage.jsx'
import TrainingVideoPage from './components/TrainingVideoPage.jsx'
import { projects } from './data/projects.js'

const AdminApp = lazy(() => import('./admin/AdminApp.jsx'))

const fadeUp = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } }
function Reveal({ children, className = '' }) {
  return <motion.div className={className} variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.12 }} transition={{ duration: .55, ease: 'easeOut' }}>{children}</motion.div>
}
function SectionHeading({ kicker, title, text, center = false }) {
  return <div className={`section-heading ${center ? 'text-center' : ''}`}><span className="eyebrow">{kicker}</span><h2>{title}</h2>{text && <p>{text}</p>}</div>
}
function HeroArt() {
  return <div className="hero-art" aria-label="Illustration of a robot building a project">
    <div className="art-orbit orbit-one"></div><div className="art-orbit orbit-two"></div>
    <div className="art-sticker sticker-one"><CircuitBoard size={19} /><span>Think it.<br />Build it.</span></div>
    <div className="art-sticker sticker-two"><span className="sticker-spark">✳</span><span>Curiosity<br />in motion</span></div>
    <div className="art-sun"></div>
    <div className="robot-stage"><div className="robot-shadow"></div><div className="robot-head"><span className="robot-antenna"></span><div className="robot-face"><span></span><span></span><i></i></div><div className="robot-ear left"></div><div className="robot-ear right"></div></div><div className="robot-neck"></div><div className="robot-body"><div className="robot-panel"><span></span><span></span><span></span></div><div className="robot-arm arm-left"><i></i></div><div className="robot-arm arm-right"><i></i></div><div className="robot-wheel wheel-left"></div><div className="robot-wheel wheel-right"></div></div><div className="robot-base"><span></span><span></span><span></span></div></div>
    <div className="art-circuit circuit-a"><i></i><i></i><i></i></div><div className="art-circuit circuit-b"><i></i><i></i><i></i></div>
    <div className="floating-chip chip-code"><Code2 size={23} /></div><div className="floating-chip chip-bulb"><Lightbulb size={24} /></div><div className="floating-chip chip-gear"><Puzzle size={22} /></div>
    <div className="art-caption"><span className="caption-dot"></span> Small ideas. Big possibilities.</div>
  </div>
}
function Home() {
  const [publishedContent, setPublishedContent] = useState(null)
  const featured = projects.filter(p => [1, 2, 3].includes(p.level)).filter((p, i) => [0, 1, 6, 7, 10, 11].includes(projects.indexOf(p)))
  const defaultFaqs = [
    ['Do schools need prior robotics experience?', 'The program is designed to help schools get started with a structured curriculum and teacher training. We can discuss your school’s starting point during the demo.'],
    ['What is included in the program?', 'The package brings together robotics kits, an 8–9 month student learning program, teacher training and LMS access.'],
    ['How does the school get started?', 'Start with a free 40-minute demo at your school, explore a pilot with one class, and then consider a wider rollout.'],
    ['Which projects can students build?', 'Projects range from sensor-based builds and traffic signal timers to line-following robots, Bluetooth-controlled cars and weather stations.']
  ]
  const faqs = publishedContent?.faq?.length
    ? publishedContent.faq.map(({ question, answer }) => [question, answer])
    : defaultFaqs
  const heroTitle = publishedContent?.heroTitle || "Don't just teach technology. Let them build it."
  const titleSplit = heroTitle.lastIndexOf('. ')
  const heroTitleFirst = titleSplit > -1 ? heroTitle.slice(0, titleSplit + 1) : heroTitle
  const heroTitleSecond = titleSplit > -1 ? heroTitle.slice(titleSplit + 2) : ''
  const ctaLink = publishedContent?.ctaLink?.startsWith('/') && !publishedContent.ctaLink.startsWith('//')
    ? publishedContent.ctaLink
    : '/contact'

  useEffect(() => {
    let active = true
    if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY) {
      try {
        const localDraft = localStorage.getItem('tt-admin-website-content')
        const parsed = localDraft ? JSON.parse(localDraft) : null
        if (parsed?.status === 'published') setPublishedContent(parsed.content || parsed)
      } catch (error) {
        console.error('Unable to restore locally published website content:', error)
      }
      return () => {
        active = false
      }
    }

    import('./lib/supabase.js')
      .then(({ supabase }) => {
        if (!supabase) return null
        return supabase
          .from('website_content')
          .select('content')
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(1)
          .maybeSingle()
      })
      .then((result) => {
        if (!active || !result) return
        if (result.error) {
          console.error('Unable to load published website content:', result.error.message)
          return
        }
        if (result.data?.content) setPublishedContent(result.data.content)
      })
      .catch((error) => {
        if (active) console.error('Unable to load published website content:', error)
      })

    return () => {
      active = false
    }
  }, [])
  return <>
    <section className="hero section-cream"><div className="container hero-grid"><div className="hero-copy">
      <div className="hero-pill"><span className="pulse-dot"></span> ROBOTICS EDUCATION, REIMAGINED</div>
      <h1>{heroTitleFirst} {heroTitleSecond && <span>{heroTitleSecond}</span>}</h1>
      <p className="hero-subtitle">{publishedContent?.heroSubtitle || 'Give students the confidence to turn curiosity into creation—with hands-on robotics, a ready-to-run curriculum and teachers who feel ready to lead.'}</p>
      {publishedContent?.heroDescription && <p className="hero-subtitle hero-description">{publishedContent.heroDescription}</p>}
      <div className="hero-actions"><Link to={ctaLink} className="button button-primary">{publishedContent?.ctaText || 'Book a free demo'} <ArrowUpRight size={18} /></Link><Link to="/kits#demo-kits" className="button button-secondary">Explore kits <ArrowRight size={17} /></Link></div>
      <div className="hero-proof"><div className="proof-avatars"><span><Bot size={16} /></span><span><Lightbulb size={16} /></span><span><Code2 size={16} /></span></div><p><strong>Build · Learn · Create</strong><br />A complete school robotics program</p></div>
    </div><HeroArt /></div><div className="hero-bottom container"><span>MADE FOR CURIOUS MINDS</span><div><i></i> Hands-on learning <i></i> Real-world projects <i></i> Future-ready skills</div></div></section>
    <section className="value-strip"><div className="container value-strip-inner"><p>Everything your school needs to bring robotics to life.</p><div><span><Check size={16} /> Robotics kits</span><span><Check size={16} /> Student training</span><span><Check size={16} /> Teacher enablement</span><span><Check size={16} /> LMS access</span></div></div></section>
    <section className="section section-white" id="program"><div className="container"><Reveal><SectionHeading kicker="ONE COMPLETE PROGRAM" title={<>A robotics program that works <span className="text-orange">beyond the lab.</span></>} text="Not just a box of components. A structured learning experience that helps schools bring practical technology education into the school year." /></Reveal><div className="offering-grid">
      {[{n:'01',icon:Wrench,title:'Robotics kits',desc:'Hands-on hardware for students to explore electronics, sensors, movement and making.',color:'orange'},{n:'02',icon:BookOpen,title:'Ready curriculum',desc:'A structured 8–9 month learning journey with practical projects at every step.',color:'blue'},{n:'03',icon:GraduationCap,title:'Teacher training',desc:'Help teachers build the confidence to guide robotics activities in their classrooms.',color:'green'},{n:'04',icon:Layers3,title:'LMS access',desc:'Keep learning connected with a learning platform included in the package.',color:'purple'}].map((item,i)=><Reveal key={item.n}><article className="offering-card shadow-sm shadow-brand-navy/5 transition-all duration-300 hover:shadow-lg hover:shadow-brand-navy/10"><div className={`offering-icon icon-${item.color}`}><item.icon size={24}/></div><span className="offering-number">{item.n}</span><h3>{item.title}</h3><p>{item.desc}</p><span className="card-line"></span></article></Reveal>)}
    </div></div></section>
    <section className="section section-cream" id="projects"><div className="container"><Reveal><div className="section-heading-row"><SectionHeading kicker="MADE TO BE BUILT" title={<>From first circuit to <span className="text-orange">smart creations.</span></>} text="Students learn by making. Every project is a chance to ask questions, test ideas and see technology come to life." /><Link className="text-link" to="/projects">Explore all projects <ArrowRight size={17} /></Link></div></Reveal><div className="project-grid">{featured.map((project, i) => <Reveal key={project.title}><ProjectCard project={project} index={i} /></Reveal>)}</div><div className="projects-footer"><span>Three learning levels. Plenty of room to experiment.</span><Link to="/projects" className="button button-outline">See the project library <ArrowRight size={17} /></Link></div></div></section>
    <section className="section section-navy"><div className="container learning-grid"><Reveal><div className="learning-copy"><span className="eyebrow eyebrow-light">A JOURNEY THAT BUILDS</span><h2>Skills for the world they're growing into.</h2><p>Every build turns abstract ideas into something students can see, test, debug and improve. That is where confidence starts.</p><div className="skill-list"><div><span className="skill-icon"><Code2 size={19} /></span><span><strong>Coding</strong><small>Logic, sequences and control</small></span><Check size={18} /></div><div><span className="skill-icon"><CircuitBoard size={19} /></span><span><strong>Electronics</strong><small>Sensors, circuits and components</small></span><Check size={18} /></div><div><span className="skill-icon"><Target size={19} /></span><span><strong>Problem-solving</strong><small>Test, learn, improve and repeat</small></span><Check size={18} /></div><div><span className="skill-icon"><Users size={19} /></span><span><strong>Teamwork</strong><small>Make better things together</small></span><Check size={18} /></div></div></div></Reveal><Reveal><div className="level-board"><div className="board-top"><span>THE TINKERING PATH</span><span className="board-live"><i></i> LEARN BY DOING</span></div><div className="level-step level-one"><div className="level-num">01</div><div className="level-art"><Radar size={26} /><CircuitBoard size={19} /></div><div><span>LEVEL ONE</span><h3>Sensors & basics</h3><p>Discover the building blocks.</p></div><ArrowUpRight size={20} /></div><div className="level-connector"></div><div className="level-step level-two"><div className="level-num">02</div><div className="level-art"><Zap size={26} /><Bot size={20} /></div><div><span>LEVEL TWO</span><h3>Robots & automation</h3><p>Make ideas move and respond.</p></div><ArrowUpRight size={20} /></div><div className="level-connector"></div><div className="level-step level-three"><div className="level-num">03</div><div className="level-art"><Sparkles size={26} /><Cpu size={19} /></div><div><span>LEVEL THREE</span><h3>Connected & smart</h3><p>Build with connected technology.</p></div><ArrowUpRight size={20} /></div><div className="board-footer"><span><span className="board-footer-dot"></span> A structured 8–9 month program</span><span>BUILT IN STEPS ↗</span></div></div></Reveal></div></section>
    <section className="section section-white" id="how-it-works"><div className="container"><Reveal><SectionHeading kicker="YOUR NEXT STEP" title="Start small. Build something bigger." text="See how robotics can fit your school—then choose the rollout that works for you."/></Reveal><div className="journey-grid">{[{n:'01',title:'Book a demo',desc:'A free 40-minute session at your school to see the approach in action.',icon:MessageCircle},{n:'02',title:'Run a pilot',desc:'Try the experience with one class and see how students engage.',icon:Bot},{n:'03',title:'Roll it out',desc:'Plan a full robotics lab experience across your school.',icon:School}].map((s,i)=><Reveal key={s.n}><article className="journey-card shadow-sm shadow-brand-navy/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-navy/10"><div className="journey-top"><span>{s.n}</span><s.icon size={23}/></div><h3>{s.title}</h3><p>{s.desc}</p>{i<2&&<div className="journey-arrow"><MoveRight size={19}/></div>}</article></Reveal>)}</div></div></section>
    <section className="section section-cream"><div className="container faq-layout"><Reveal><SectionHeading kicker="GOOD QUESTIONS" title="A few things schools ask us." text="We want your school to know what to expect before getting started." /></Reveal><div className="faq-list">{faqs.map((f, i) => <details key={f[0]} className="faq-item" open={i === 0}><summary>{f[0]}<ChevronDown size={18} /></summary><p>{f[1]}</p></details>)}</div></div></section>
    <section className="cta-section"><div className="container"><div className="cta-card"><div className="cta-orb cta-orb-one"></div><div className="cta-orb cta-orb-two"></div><div className="cta-content"><span className="eyebrow eyebrow-light">LET'S MAKE SOMETHING REAL</span><h2>Ready to bring robotics to your school?</h2><p>Start with a free 40-minute demo. Bring your questions—we'll bring the possibilities.</p><Link to="/contact" className="button button-orange">Book your free demo <ArrowUpRight size={18} /></Link></div><div className="cta-illustration"><div className="cta-robot"><Bot size={100} strokeWidth={1.15} /><span>LET'S BUILD!</span></div><Sparkles className="cta-spark spark-a" /><Sparkles className="cta-spark spark-b" /></div></div></div></section>
  </>
}
function ProjectsPage() {
  const [level, setLevel] = React.useState('all')
  const filtered = level === 'all' ? projects : projects.filter(p => String(p.level) === level)
  return <main><section className="inner-hero section-cream"><div className="container"><span className="eyebrow">THE PROJECT LIBRARY</span><h1>Big ideas start with <span className="text-orange">small builds.</span></h1><p>Explore hands-on projects across three levels of robotics learning—from sensor basics to connected and smart devices.</p><div className="project-filters" role="group" aria-label="Filter projects by level">{[['all', 'All projects'], ['1', 'Level 1 · Basics'], ['2', 'Level 2 · Robots'], ['3', 'Level 3 · Smart']].map(([v, l]) => <button key={v} className={level === v ? 'filter-button active' : 'filter-button'} onClick={() => setLevel(v)}>{l}</button>)}</div></div></section><section className="section section-white"><div className="container"><div className="results-line"><span>{filtered.length} projects to explore</span><span>LEARN · BUILD · REPEAT</span></div><div className="project-grid">{filtered.map((p, i) => <ProjectCard key={p.title} project={p} index={i} />)}</div><div className="project-end-cta"><h2>Want to see the learning journey in action?</h2><p>Book a free 40-minute demo for your school.</p><Link to="/contact" className="button button-primary">Book a demo <ArrowRight size={17} /></Link></div></div></section></main>
}
function ContactPage() {
  return <main><section className="inner-hero contact-hero section-cream"><div className="container"><span className="eyebrow">LET'S TALK ROBOTICS</span><h1>Let's build a little <span className="text-orange">curiosity.</span></h1><p>Book a free 40-minute demo or tell us what your school is looking for. We'll help you figure out a practical next step.</p></div></section><section className="section section-white"><div className="container contact-layout"><Reveal><div className="contact-intro"><span className="eyebrow">YOUR SCHOOL. YOUR STARTING POINT.</span><h2>Let's make robotics feel possible.</h2><p>Whether you're exploring robotics for the first time or planning a school-wide program, start a conversation with our team.</p><div className="contact-info-list"><a href="mailto:sujalkalamkar2213@gmail.com"><span><MessageCircle size={20} /></span><div><small>EMAIL US</small><strong>sujalkalamkar2213@gmail.com</strong></div><ArrowUpRight size={17} /></a><a href="tel:+919960492676"><span><PhoneIcon /></span><div><small>CALL OUR TEAM</small><strong>+91 9960492676</strong></div><ArrowUpRight size={17} /></a><div><span><School size={20} /></span><div><small>BASED IN</small><strong>Pune, Maharashtra, India</strong></div></div></div><div className="contact-note"><Sparkles size={19} /><p><strong>What happens next?</strong><br />Share your details and we'll have the context to discuss the right starting point for your school.</p></div></div></Reveal><Reveal><LeadForm /></Reveal></div></section></main>
}
function PhoneIcon() { return <MessageCircle size={20} /> }
function WhatsAppContact() {
  return (
    <a className="whatsapp-contact" href="https://wa.me/919960492676" target="_blank" rel="noopener noreferrer" aria-label="Contact us on WhatsApp" title="Contact us on WhatsApp">
      <MessageCircle size={22} />
      <span>Contact us</span>
    </a>
  )
}
export default function App() {
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith('/admin')

  useEffect(() => {
    if (location.hash) {
      document.querySelector(location.hash)?.scrollIntoView({ behavior: 'smooth' })
      return
    }
    window.scrollTo(0, 0)
  }, [location.pathname, location.hash])

  if (isAdminRoute) {
    return <Suspense fallback={<main className="not-found"><p>Loading admin workspace…</p></main>}><Routes><Route path="/admin/*" element={<AdminApp />} /></Routes></Suspense>
  }

  return <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projects" element={<ProjectsPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/kits" element={<KitsPage />} />
      <Route path="/kits/:kitId" element={<KitDetailPage />} />
      <Route path="/training-video" element={<TrainingVideoPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/admin" element={<LoginPage role="admin" />} />
      <Route path="/login/school" element={<LoginPage role="school" />} />
      <Route path="*" element={<main className="not-found"><h1>Page not found</h1><Link className="button button-primary" to="/">Back home</Link></main>} />
    </Routes>
    <Footer />
    <WhatsAppContact />
  </>
}