import { Link } from 'react-router-dom'
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Link to="/" className="brand brand-light"><span className="brand-mark"><span>TT</span></span><span className="brand-copy"><strong>Tomorrow's <em>Tinkers</em></strong><small>ROBOTICS EDUCATION FOR SCHOOLS</small></span></Link>
          <p>Make every student a creator of technology, not just a user.</p>
        </div>
        <div className="footer-links"><strong>Explore</strong><Link to="/">Home</Link><a href="/#program">Our program</a><Link to="/projects">Student projects</Link><Link to="/contact">Book a demo</Link></div>
        <div className="footer-links footer-contact"><strong>Let's talk</strong><a href="mailto:sujalkalamkar2213@gmail.com"><Mail size={16}/> sujalkalamkar2213@gmail.com</a><a href="tel:+918626021464"><Phone size={16}/> +91 86260 21464</a><span><MapPin size={16}/> Pune, Maharashtra</span></div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} Tomorrow's Tinkers</span><span>Build · Learn · Create · Tomorrow</span></div>
    </footer>
  )
}