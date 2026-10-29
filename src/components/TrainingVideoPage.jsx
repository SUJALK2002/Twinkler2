import { Link } from 'react-router-dom'
import { ArrowRight, Play } from 'lucide-react'

export default function TrainingVideoPage() {
  return (
    <main>
      <section className="inner-hero section-cream">
        <div className="container">
          <span className="eyebrow">WATCH AND LEARN</span>
          <h1>Demo & training <span className="text-orange">video.</span></h1>
          <p>Get a closer look at the robotics learning experience for schools.</p>
        </div>
      </section>
      <section className="section section-white">
        <div className="container">
          <div className="training-video-placeholder">
            <span className="training-video-play"><Play size={28} fill="currentColor" /></span>
            <span className="eyebrow">VIDEO COMING SOON</span>
            <h2>Our demo and training video will be available here.</h2>
            <p>In the meantime, contact us to learn about the program and arrange a school demo.</p>
            <Link to="/contact" className="button button-primary">Arrange a demo <ArrowRight size={17} /></Link>
          </div>
        </div>
      </section>
    </main>
  )
}
