import { Link } from 'react-router-dom'
import { ArrowRight, Bot, CircuitBoard, GraduationCap, Lightbulb, Target, Users, Wrench } from 'lucide-react'

const values = [
  { title: 'Learn by doing', description: 'Students explore ideas with hands-on builds and practical projects.', icon: Bot },
  { title: 'Build curiosity', description: 'Questions, experiments and iteration are part of the learning journey.', icon: Lightbulb },
  { title: 'Make technology', description: 'Learners work with coding, electronics, sensors and robotics.', icon: CircuitBoard },
  { title: 'Grow together', description: 'Teacher enablement helps schools guide learning with confidence.', icon: Users },
]

const goals = [
  'Make robotics approachable for schools at different starting points.',
  'Help students practice creative thinking, coding and problem-solving.',
  'Give teachers structured resources and confidence to lead activities.',
  'Connect practical projects to a consistent learning journey.',
]

const team = [
  { role: 'School demo team', description: 'Introduces the program, listens to each school’s goals and demonstrates a practical learning experience.', icon: Users },
  { role: 'Teacher enablement', description: 'Helps educators get familiar with the kits, curriculum and classroom facilitation.', icon: GraduationCap },
  { role: 'Robotics learning', description: 'Shapes hands-on activities that connect components, coding and real-world ideas.', icon: Wrench },
]

const stories = [
  {
    src: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&w=1000&q=85',
    alt: 'A team collaborating around a technical project',
    label: 'LEARN TOGETHER',
  },
  {
    src: 'https://images.unsplash.com/photo-1581092334651-ddf26d9a09d0?auto=format&fit=crop&w=1000&q=85',
    alt: 'Hands-on engineering and technology work',
    label: 'MAKE AND EXPLORE',
  },
  {
    src: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=1000&q=85',
    alt: 'A close view of a technology workspace',
    label: "BUILD WHAT'S NEXT",
  },
]

export default function AboutPage() {
  return (
    <main>
      <section className="inner-hero section-cream about-hero">
        <div className="container about-hero-grid">
          <div>
            <span className="eyebrow">ABOUT TOMORROW'S TINKERS</span>
            <h1>Make every student a <span className="text-orange">creator of technology.</span></h1>
            <p>We bring robotics kits, a structured curriculum, teacher training and digital learning support together to help schools make hands-on technology learning possible.</p>
            <Link to="/contact" className="button button-primary">Meet the demo team <ArrowRight size={17} /></Link>
          </div>
          <div className="about-hero-image">
            <img src={stories[0].src} alt={stories[0].alt} />
            <span className="about-image-caption"><span className="caption-dot" /> BUILD · LEARN · CREATE</span>
          </div>
        </div>
      </section>
      <section className="section section-white">
        <div className="container">
          <div className="about-purpose-grid">
            <article className="about-purpose-card">
              <span className="eyebrow">OUR VISION</span>
              <h2>A future where every learner can <span className="text-orange">make with technology.</span></h2>
              <p>We envision classrooms where curiosity leads to building, students feel confident exploring how technology works, and practical creativity is part of learning.</p>
              <div className="purpose-mark"><Lightbulb size={24} /></div>
            </article>
            <article className="about-purpose-card purpose-mission">
              <span className="eyebrow eyebrow-light">OUR MISSION</span>
              <h2>Make robotics learning <span>practical and accessible.</span></h2>
              <p>We support schools with hands-on kits, guided projects, teacher enablement and learning resources that help turn ideas into classroom experiences.</p>
              <div className="purpose-mark"><Target size={24} /></div>
            </article>
          </div>
        </div>
      </section>
      <section className="section section-cream">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">WHAT WE'RE WORKING TOWARD</span>
            <h2>Our goals are built around <span className="text-orange">real learning.</span></h2>
            <p>A consistent, supportive experience helps schools move from first exploration to confident making.</p>
          </div>
          <div className="about-goal-layout">
            <div className="about-goal-list">
              {goals.map((goal, index) => (
                <article className="about-goal-card" key={goal}>
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  <p>{goal}</p>
                </article>
              ))}
            </div>
            <img className="about-goal-image" src={stories[1].src} alt={stories[1].alt} loading="lazy" />
          </div>
        </div>
      </section>
      <section className="section section-white">
        <div className="container">
          <div className="section-heading">
            <span className="eyebrow">PEOPLE BEHIND THE EXPERIENCE</span>
            <h2>Meet your <span className="text-orange">demo team.</span></h2>
            <p>Our team helps schools understand the program, explore the kits and choose a practical way to get started.</p>
          </div>
          <div className="about-team-grid">
            {team.map(({ role, description, icon: Icon }) => (
              <article className="about-team-card" key={role}>
                <span className="about-team-icon"><Icon size={23} /></span>
                <span className="eyebrow">HERE TO HELP</span>
                <h3>{role}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
          <div className="about-gallery" aria-label="Hands-on learning in action">
            {stories.slice(1).map(story => (
              <figure className="about-gallery-card" key={story.label}>
                <img src={story.src} alt={story.alt} loading="lazy" />
                <figcaption>{story.label}</figcaption>
              </figure>
            ))}
          </div>
          <div className="project-end-cta">
            <h2>Let’s build something meaningful together.</h2>
            <p>Start a conversation with our team about robotics learning for your school.</p>
            <Link to="/contact" className="button button-primary">Get in touch <ArrowRight size={17} /></Link>
          </div>
        </div>
      </section>
    </main>
  )
}
