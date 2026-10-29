import { ArrowDownRight, ArrowRight, BookOpen, Cog, GraduationCap, Lightbulb, Rocket, Users, Wrench, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { roboticsKits } from '../data/roboticsKits.js'
import KitVisual from './KitVisual.jsx'

const cardFeatures = [
  ['LEDs', Lightbulb],
  ['Switches', Zap],
  ['Hands-on builds', Wrench],
]

const journey = [
  { classes: 'Classes 1 – 3', title: 'Explore & Discover', text: 'Learn basic electronics, circuits and hands-on building.', icon: Lightbulb, color: 'orange' },
  { classes: 'Classes 4 – 6', title: 'Build & Program', text: 'Work with sensors, motors and start coding simple projects.', icon: Cog, color: 'peach' },
  { classes: 'Classes 7 – 9', title: 'Engineer & Innovate', text: 'Design advanced robots, automation and real-world solutions.', icon: Rocket, color: 'blue' },
]

const schoolBenefits = [
  { title: 'Curriculum Aligned', text: 'Designed for school learning needs across classes 1–9.', icon: GraduationCap },
  { title: 'Hands-on Projects', text: 'Build, experiment and solve real problems.', icon: Users },
  { title: 'Skill Development', text: 'Build creativity, logic and technical skills.', icon: BarChartIcon },
  { title: 'Teacher Support', text: 'Ready-to-teach resources and guidance.', icon: Lightbulb },
]

function BarChartIcon(props) {
  return <span className="kit-bars-icon" aria-hidden="true"><i /><i /><i /></span>
}

function RobotHero() {
  return (
    <div className="catalogue-hero-art" aria-label="Friendly robot illustration">
      <div className="catalogue-note">Small ideas.<br />Big possibilities.</div>
      <span className="catalogue-spark">✳</span>
      <div className="catalogue-robot">
        <span className="catalogue-antenna" />
        <span className="catalogue-robot-ear left" />
        <span className="catalogue-robot-ear right" />
        <span className="catalogue-robot-face"><i /><i /><b /></span>
        <span className="catalogue-robot-body"><i /><i /></span>
        <span className="catalogue-robot-feet" />
      </div>
      <div className="catalogue-checklist"><span>✓ Practical Projects</span><span>✓ Real-world Skills</span><span>✓ Curriculum Aligned</span></div>
    </div>
  )
}

export default function KitsPage() {
  return (
    <main className="robotics-catalogue">
      <section className="catalogue-hero">
        <div className="container catalogue-hero-inner">
          <div className="catalogue-hero-copy">
            <span className="catalogue-eyebrow">BUILD · LEARN · CREATE</span>
            <h1>Explore Robotics Kits</h1>
            <p>Class-wise hands-on kits designed for a progressive learning journey from first circuits to advanced robotics.</p>
            <div className="catalogue-points">
              <span><Lightbulb /> Hands-on Learning</span>
              <span><BarChartIcon /> Age-Appropriate Curriculum</span>
              <span><Zap /> Build Real-World Skills</span>
            </div>
          </div>
          <RobotHero />
        </div>
      </section>

      <section className="catalogue-cards-section" aria-label="Robotics kits by class">
        <div className="container">
          <div className="catalogue-grid">
            {roboticsKits.map(kit => (
              <article className={`catalogue-card catalogue-${kit.color}`} key={kit.id}>
                <div className="catalogue-card-heading">
                  <span className="catalogue-class"><small>CLASS</small><strong>{kit.classNumber}</strong></span>
                  <div className="catalogue-card-title"><h2>{kit.name}</h2><p>{kit.short}</p></div>
                  <Link className="catalogue-card-arrow" to={`/kits/${kit.id}`} aria-label={`Explore ${kit.name}`}><ArrowRight /></Link>
                </div>
                <div className="catalogue-card-bottom">
                  <div className="catalogue-card-features">
                    {cardFeatures.map(([label, Icon]) => <span key={label}><Icon />{label}</span>)}
                  </div>
                  <KitVisual variant={kit.image} className="catalogue-product-visual" />
                  <Link className="catalogue-explore" to={`/kits/${kit.id}`}>Explore this kit <ArrowRight /></Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="catalogue-journey">
        <div className="container catalogue-panel">
          <h2>A Learning Journey from Class 1 to 9</h2>
          <p>Each kit builds on the previous one, helping students develop skills step by step.</p>
          <div className="journey-cards">
            {journey.map((step, index) => {
              const Icon = step.icon
              return <div className={`journey-card journey-${step.color}`} key={step.classes}>
                <span className="journey-icon"><Icon /></span>
                <div><strong>{step.classes}</strong><h3>{step.title}</h3><p>{step.text}</p></div>
                {index < journey.length - 1 && <ArrowRight className="journey-link-arrow" />}
              </div>
            })}
          </div>
        </div>
      </section>

      <section className="catalogue-benefits">
        <div className="container catalogue-panel">
          <h2>Why Schools Choose Our Robotics Kits</h2>
          <div className="school-benefit-grid">
            {schoolBenefits.map(({ title, text, icon: Icon }) => <article className="school-benefit" key={title}>
              <span className="benefit-icon"><Icon /></span><div><h3>{title}</h3><p>{text}</p></div>
            </article>)}
          </div>
        </div>
      </section>

      <section className="catalogue-cta-section">
        <div className="container">
          <div className="catalogue-cta">
            <div>
              <h2>Bring Robotics to Your School</h2>
              <p>Empower your students with hands-on learning and real-world skills.</p>
              <div className="catalogue-cta-actions">
                <Link to="/contact" className="catalogue-explore">Request School Demo <ArrowRight /></Link>
                <a className="catalogue-download" href="mailto:sujalkalamkar2213@gmail.com?subject=Robotics%20kit%20brochure%20request"><BookOpen /> Request Kit Brochure</a>
              </div>
            </div>
            <div className="school-illustration" aria-hidden="true">
              <span className="school-cloud cloud-one" /><span className="school-cloud cloud-two" />
              <div className="school-tree tree-left" /><div className="school-tree tree-right" />
              <div className="school-building"><i /><i /><i /><i /><b /></div>
              <span className="school-caption">Let’s build<br />a brighter tomorrow<br />together.</span>
              <ArrowDownRight className="school-doodle" />
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
