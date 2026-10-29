import { ArrowUpRight, AudioLines, Bluetooth, CloudRain, CloudSun, DoorOpen, Fan, Mic, Radar, Route, Ruler, ScanLine, Sun, Thermometer, TrafficCone, Cpu } from 'lucide-react'

const icons = { radar: Radar, ruler: Ruler, audio: AudioLines, 'cloud-rain': CloudRain, thermometer: Thermometer, 'traffic-cone': TrafficCone, route: Route, sun: Sun, 'door-open': DoorOpen, fan: Fan, bluetooth: Bluetooth, scan: ScanLine, mic: Mic, 'cloud-sun': CloudSun }
export default function ProjectCard({ project, index = 0 }) {
  const Icon = icons[project.icon] || Cpu
  return (
    <article className={`project-card project-${project.color} shadow-sm shadow-brand-navy/5 transition-all duration-300 hover:shadow-lg hover:shadow-brand-navy/10`}>
      <div className="project-card-top"><span className="project-icon"><Icon size={24}/></span><span className="project-index">{String(index + 1).padStart(2, '0')}</span></div>
      <span className="eyebrow">{project.category}</span>
      <h3>{project.title}</h3>
      <p>{project.description}</p>
      <div className="project-card-bottom"><span>Level {project.level}</span><ArrowUpRight size={17}/></div>
    </article>
  )
}