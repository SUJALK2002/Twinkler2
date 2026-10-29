import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, BookOpen, Brain, CheckCircle2, ChevronLeft, ChevronRight, Clock3, Code2, Lightbulb, Package, Play, ShieldCheck, Star, Wrench, Zap } from 'lucide-react'
import { roboticsKits } from '../data/roboticsKits.js'
import { createDefaultKitDetailContent, withKitDetailDemoContent } from '../data/kitDetailContent.js'
import { supabase } from '../lib/supabase.js'
import robotImage from '../assets/icon.png'
import KitVisual from './KitVisual.jsx'

const fallbackGalleryVariants = ['car', 'fan', 'circuit', 'gears']
const componentVisualVariants = ['car', 'circuit', 'gears', 'sensors', 'robot', 'coding', 'arm', 'solar', 'drone', 'fan']

function getComponentVariant(title, index) {
  const name = title.toLowerCase()
  if (/motor|wheel|chassis|car|frame/.test(name)) return 'car'
  if (/led|circuit|wire|switch|battery|buzzer|resistor/.test(name)) return 'circuit'
  if (/gear|axle/.test(name)) return 'gears'
  if (/sensor|ultrasonic|distance/.test(name)) return 'sensors'
  if (/code|controller|board|microcontroller|tablet/.test(name)) return 'coding'
  if (/arm|gripper/.test(name)) return 'arm'
  if (/solar|light/.test(name)) return 'solar'
  if (/drone/.test(name)) return 'drone'
  return componentVisualVariants[index % componentVisualVariants.length]
}

function getComponentDescription(title, kitName) {
  const name = title.toLowerCase()
  if (/motor/.test(name)) return 'Turns electrical power into movement for your robot builds.'
  if (/wheel/.test(name)) return 'Helps the robot move smoothly across the floor.'
  if (/chassis|frame|base/.test(name)) return 'The sturdy base that holds the robot and its components together.'
  if (/battery|power/.test(name)) return 'Supplies the energy needed to run the kit’s electrical components.'
  if (/switch/.test(name)) return 'Opens or closes a circuit to control when a component turns on.'
  if (/led|light/.test(name)) return 'Creates a bright visual output for hands-on circuit projects.'
  if (/wire|jumper/.test(name)) return 'Connects components so electricity can flow through the circuit.'
  if (/sensor/.test(name)) return 'Detects changes around the robot and helps it respond.'
  if (/gear/.test(name)) return 'Transfers movement between parts and introduces mechanical motion.'
  if (/board|controller|microcontroller/.test(name)) return 'Connects the electronics and helps control how the build works.'
  if (/buzzer/.test(name)) return 'Adds sound to interactive electronics projects.'
  if (/screw|nut|fastener/.test(name)) return 'Keeps the kit pieces securely connected during a build.'
  return `A useful part for assembling and exploring the ${kitName} projects.`
}

function ComponentCard({ item, itemIndex, kitName, tapLabel, backLabel }) {
  const [flipped, setFlipped] = useState(false)
  const visual = getComponentVariant(item.title, itemIndex)

  return (
    <article className={`component-card${flipped ? ' is-flipped' : ''}`}>
      <div className="component-card-inner">
        <button
          type="button"
          className="component-card-face component-card-front"
          onClick={() => setFlipped(true)}
          tabIndex={flipped ? -1 : 0}
          aria-expanded={flipped}
          aria-label={`Show more about ${item.title}`}
        >
          <span className="component-card-image">
            {item.imageUrl
              ? <img src={item.imageUrl} alt={item.title} loading="lazy" />
              : <KitVisual variant={visual} className="component-card-visual" />}
          </span>
          <strong>{item.title}</strong>
          <span className="component-card-hint">{tapLabel}</span>
        </button>
        <div className="component-card-face component-card-back" aria-hidden={!flipped}>
          <span className="component-card-back-icon"><Package /></span>
          <h3>{item.title}</h3>
          <p>{item.description || getComponentDescription(item.title, kitName)}</p>
          {item.videoUrl && <video src={item.videoUrl} controls preload="metadata" tabIndex={flipped ? 0 : -1} aria-label={`${item.title} video`} />}
          <button
            type="button"
            className="component-card-back-action"
            onClick={() => setFlipped(false)}
            tabIndex={flipped ? 0 : -1}
            aria-label={`Show ${item.title} image`}
          >
            {backLabel}
          </button>
        </div>
      </div>
    </article>
  )
}

function StudentIllustration() {
  return (
    <svg className="student-illustration" viewBox="0 0 360 245" role="img" aria-label="Student building a small robot">
      <defs>
        <linearGradient id="studentBg" x1="0" x2="1" y1="0" y2="1"><stop stopColor="#e9e5db" /><stop offset="1" stopColor="#f8d7ad" /></linearGradient>
        <linearGradient id="studentShirt" x1="0" x2="1"><stop stopColor="#f5a441" /><stop offset="1" stopColor="#e57822" /></linearGradient>
      </defs>
      <rect width="360" height="245" fill="url(#studentBg)" />
      <rect x="17" y="23" width="72" height="104" rx="8" fill="#d7e3de" />
      <rect x="26" y="32" width="54" height="82" rx="5" fill="#f3f5e9" />
      <path d="M37 109V66h32v43" fill="#a2c2a8" />
      <path d="M27 109h52" stroke="#8b9b8b" strokeWidth="4" />
      <path d="M279 0h81v101h-81z" fill="#f4eee3" />
      <circle cx="298" cy="48" r="13" fill="#cad6de" /><circle cx="331" cy="34" r="17" fill="#d9e3e7" />
      <path d="M42 245c10-42 45-68 100-70 50-2 86 23 95 70" fill="url(#studentShirt)" />
      <path d="M120 144c5-48 38-71 77-55 27 12 35 44 21 70l-28 33-61-10z" fill="#392f2a" />
      <ellipse cx="176" cy="117" rx="39" ry="48" fill="#bd7851" />
      <path d="M138 112c-5-43 23-68 57-57 26 8 38 34 31 58-12-5-19-19-21-31-16 20-40 29-67 30z" fill="#332b29" />
      <path d="M150 123q12 7 22 0m18 0q8 6 15 0" fill="none" stroke="#47352e" strokeWidth="3" strokeLinecap="round" />
      <path d="M167 144q14 10 28-1" fill="none" stroke="#864f3c" strokeWidth="3" strokeLinecap="round" />
      <path d="M136 181c-18 17-28 25-43 31" fill="none" stroke="#bd7851" strokeWidth="16" strokeLinecap="round" />
      <ellipse cx="92" cy="208" rx="12" ry="8" fill="#bd7851" />
      <rect x="26" y="206" width="304" height="20" rx="8" fill="#c69461" />
      <rect x="85" y="177" width="113" height="27" rx="8" fill="#f4b833" />
      <circle cx="107" cy="204" r="16" fill="#293642" /><circle cx="107" cy="204" r="8" fill="#e2a719" />
      <circle cx="180" cy="204" r="16" fill="#293642" /><circle cx="180" cy="204" r="8" fill="#e2a719" />
      <rect x="121" y="165" width="42" height="16" rx="4" fill="#243744" />
      <circle cx="146" cy="175" r="5" fill="#f2f1e8" /><circle cx="161" cy="175" r="5" fill="#f2f1e8" />
      <path d="M92 207 115 189" stroke="#bd7851" strokeWidth="11" strokeLinecap="round" />
      <path d="m244 88 8 14m28-31 8 13m-7 32 12 1" stroke="#ef762d" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

function MediaDisplay({ imageUrl, videoUrl, alt, className = '' }) {
  return (
    <div className={`detail-managed-media ${className}`}>
      {imageUrl && <img src={imageUrl} alt={alt} loading="lazy" />}
      {videoUrl && <video src={videoUrl} controls preload="metadata" aria-label={`${alt} video`} />}
    </div>
  )
}

function Gallery({ kit, section }) {
  const [selected, setSelected] = useState(0)
  const mediaItems = section?.items?.length
    ? section.items
    : fallbackGalleryVariants.map((variant, index) => ({ id: `default-${index}`, title: `${kit.name} image ${index + 1}`, variant }))

  useEffect(() => setSelected(0), [kit.id, section?.items?.length])

  const selectedItem = mediaItems[Math.min(selected, mediaItems.length - 1)]
  const move = (direction) => setSelected((current) => (current + direction + mediaItems.length) % mediaItems.length)

  return (
    <div className="detail-gallery">
      <div className="detail-main-image">
        <span className="detail-orb orb-one" /><span className="detail-orb orb-two" />
        {selectedItem?.imageUrl
          ? <img className="detail-product-image" src={selectedItem.imageUrl} alt={selectedItem.title || kit.name} />
          : selected === 0 && kit.coverImageUrl
            ? <img className="detail-product-image" src={kit.coverImageUrl} alt={`${kit.name} kit`} />
          : <KitVisual variant={selectedItem?.variant || kit.image} className="detail-product-visual" />}
        {selectedItem?.videoUrl && <video className="detail-gallery-video" src={selectedItem.videoUrl} controls preload="metadata" aria-label={`${selectedItem.title || kit.name} video`} />}
        <a className="watch-demo" href="#lesson-sequence"><span><Play fill="currentColor" /></span> {kit.watchLabel || 'Watch Projects'}</a>
      </div>
      {selectedItem?.description && <p className="detail-gallery-caption">{selectedItem.description}</p>}
      {mediaItems.length > 1 && <div className="gallery-strip">
        <button type="button" className="gallery-arrow" onClick={() => move(-1)} aria-label="Previous kit image"><ChevronLeft /></button>
        {mediaItems.map((item, index) => <button key={item.id || `${item.title}-${index}`} type="button" className={`gallery-thumb${selected === index ? ' selected' : ''}`} onClick={() => setSelected(index)} aria-label={`Show ${item.title || `kit image ${index + 1}`}`} aria-pressed={selected === index}>
          {item.imageUrl ? <img src={item.imageUrl} alt="" loading="lazy" /> : <KitVisual variant={item.variant || kit.image} />}
          {item.videoUrl && <Play className="gallery-video-indicator" fill="currentColor" />}
        </button>)}
        <button type="button" className="gallery-arrow" onClick={() => move(1)} aria-label="Next kit image"><ChevronRight /></button>
      </div>}
    </div>
  )
}

function SectionHeading({ section, index }) {
  return <div className="detail-section-heading"><span className="detail-section-number">{String(index + 1).padStart(2, '0')}</span><div><h2>{section.title}</h2>{section.description && <p>{section.description}</p>}</div></div>
}

function DetailLink({ to, fallback, className, children }) {
  const destination = typeof to === 'string' && to.trim() ? to.trim() : fallback
  const isInternal = destination.startsWith('/') && !destination.startsWith('//')
  const isExternal = /^https?:\/\//i.test(destination) || /^(mailto|tel):/i.test(destination)
  const safeDestination = isInternal || isExternal ? destination : fallback
  const safeIsInternal = safeDestination.startsWith('/') && !safeDestination.startsWith('//')

  return safeIsInternal
    ? <Link to={safeDestination} className={className}>{children}</Link>
    : <a href={safeDestination} className={className}>{children}</a>
}

function formatWelcomeText(template, metadata, kit) {
  const values = {
    name: metadata.name || kit.name,
    classNumber: kit.classNumber,
    projects: metadata.projects ?? kit.projects,
    time: metadata.time || kit.time,
  }
  return template.replace(/\{(name|classNumber|projects|time)\}/g, (_, key) => String(values[key]))
}

function ItemMedia({ item, fallbackVariant }) {
  if (item.imageUrl || item.videoUrl) {
    return <MediaDisplay imageUrl={item.imageUrl} videoUrl={item.videoUrl} alt={item.title || 'Kit content'} className="detail-item-media" />
  }
  return fallbackVariant ? <div className="detail-item-visual"><KitVisual variant={fallbackVariant} /></div> : null
}

function renderDetailSection(section, index, kit, metadata) {
  if (section.visible === false) return null
  const items = Array.isArray(section.items) ? section.items : []

  if (section.type === 'gallery') {
    return <section className="container detail-section detail-dynamic-gallery" key={section.id}><SectionHeading section={section} index={index} /><Gallery kit={{ ...kit, coverImageUrl: metadata.coverImageUrl, watchLabel: metadata.watchLabel }} section={section} /></section>
  }

  if (section.type === 'overview') {
    return (
      <section className="container detail-overview detail-overview-section" key={section.id}>
        <div className="detail-intro">
          <span className={`detail-class-pill detail-${metadata.color || kit.color}`}><span>✿</span> {metadata.classLabel || 'CLASS'} {kit.classNumber}</span>
          <h2>{section.title || 'Kit overview'}</h2>
          <p className="detail-lead">{metadata.short}</p>
          <div className="detail-stats">
            <div><span className="stat-icon"><BarChart /></span><p><strong>{metadata.level}</strong><small>{metadata.difficultyLabel || 'Difficulty Level'}</small></p></div>
            <div><span className="stat-icon"><Clock3 /></span><p><strong>{metadata.time}</strong><small>{metadata.timeLabel || 'Total Learning Time'}</small></p></div>
            <div><span className="stat-icon"><Package /></span><p><strong>{metadata.projects} {metadata.projectsLabel || 'Projects'}</strong><small>{metadata.buildsLabel || 'Hands-on Builds'}</small></p></div>
          </div>
          {section.description && <p className="detail-description">{section.description}</p>}
          <div className="detail-actions">
            <DetailLink to={metadata.schoolCtaUrl} fallback="/contact" className="detail-button detail-button-primary">{metadata.schoolCtaLabel || 'Enquire for School'} <ArrowRight /></DetailLink>
            <DetailLink to={metadata.lmsCtaUrl} fallback="/login/school" className="detail-button detail-button-outline">{metadata.lmsCtaLabel || 'Explore LMS'} <ArrowRight /></DetailLink>
          </div>
        </div>
      </section>
    )
  }

  if (section.type === 'learning') {
    return (
      <section className="container detail-section detail-learning" key={section.id}>
        <div className="detail-section-body">
          <SectionHeading section={section} index={index} />
          <ul className="learning-outcomes">
            {items.map((item) => (
              <li className="learning-outcome" key={item.id || item.title}>
                <strong>{item.title}</strong>
                {item.description && <p>{item.description}</p>}
                <ItemMedia item={item} />
              </li>
            ))}
          </ul>
        </div>
        {section.imageUrl || section.videoUrl
          ? <MediaDisplay imageUrl={section.imageUrl} videoUrl={section.videoUrl} alt={section.title} className="detail-learning-media" />
          : <StudentIllustration />}
      </section>
    )
  }

  if (section.type === 'components') {
    return (
      <section className="container detail-section detail-kit-contents" key={section.id}>
        <div className="detail-section-body">
          <SectionHeading section={section} index={index} />
          <div className="component-grid">
            {items.map((item, itemIndex) => <ComponentCard key={item.id || item.title} item={item} itemIndex={itemIndex} kitName={metadata.name} tapLabel={metadata.componentTapLabel || 'Tap to see more'} backLabel={metadata.componentBackLabel || 'Back to image'} />)}
          </div>
          {(section.imageUrl || section.videoUrl) && <MediaDisplay imageUrl={section.imageUrl} videoUrl={section.videoUrl} alt={section.title} className="detail-section-media" />}
        </div>
      </section>
    )
  }

  if (section.type === 'specifications') {
    return (
      <section className="container detail-section detail-specifications" key={section.id}>
        <div className="detail-section-body"><SectionHeading section={section} index={index} />
          <div className="specification-card"><h3><Zap /> {section.title}</h3>
            {items.map((item) => <div className="specification-row" key={item.id || item.title}><span>{item.title}</span><strong>{item.value}</strong></div>)}
          </div>
          {(section.imageUrl || section.videoUrl) && <MediaDisplay imageUrl={section.imageUrl} videoUrl={section.videoUrl} alt={section.title} className="detail-section-media" />}
        </div>
      </section>
    )
  }

  if (section.type === 'projects') {
    return (
      <section className="container detail-section detail-projects" id="lesson-sequence" key={section.id}>
        <SectionHeading section={section} index={index} />
        <div className="lesson-sequence">
          {items.map((item, itemIndex) => <article className="lesson-card" key={item.id || item.title}>
            <span className="lesson-number">{itemIndex + 1}</span>
            <div className={`lesson-art lesson-art-${itemIndex % 5}`}><ItemMedia item={item} fallbackVariant={fallbackGalleryVariants[itemIndex % fallbackGalleryVariants.length]} /></div>
            <h3>{item.title}</h3>
            {item.description && <p>{item.description}</p>}
            {item.duration && <span className="lesson-time"><Clock3 /> {item.duration}</span>}
          </article>)}
        </div>
        {(section.imageUrl || section.videoUrl) && <MediaDisplay imageUrl={section.imageUrl} videoUrl={section.videoUrl} alt={section.title} className="detail-section-media" />}
      </section>
    )
  }

  if (section.type === 'lms') {
    return (
      <section className="container detail-section lms-section" key={section.id}>
        <div className="detail-section-body">
          <SectionHeading section={section} index={index} />
          <div className="lms-feature-grid">
            {items.map((item, itemIndex) => {
              const icons = [Play, BookOpen, CheckCircle2, BarChart, Star]
              const Icon = icons[itemIndex % icons.length]
              return <article className="lms-feature" key={item.id || item.title}>
                <span>{item.imageUrl ? <img src={item.imageUrl} alt="" loading="lazy" /> : <Icon />}</span>
                <h3>{item.title}</h3><p>{item.description}</p>
                {item.videoUrl && <video src={item.videoUrl} controls preload="metadata" aria-label={`${item.title} video`} />}
              </article>
            })}
          </div>
          {(section.imageUrl || section.videoUrl) && <MediaDisplay imageUrl={section.imageUrl} videoUrl={section.videoUrl} alt={section.title} className="detail-section-media" />}
        </div>
        <div className="lms-laptop" aria-label="Preview of the online learning platform"><div className="lms-screen"><div className="lms-topbar">Tomorrow’s <b>Tinkers</b></div><div className="lms-screen-body"><aside><i /><i /><i /><i /></aside><div><strong>Class {kit.classNumber} · {metadata.name}</strong><div className="lms-video-preview">{section.videoUrl ? <video src={section.videoUrl} controls preload="metadata" /> : metadata.coverImageUrl ? <img src={metadata.coverImageUrl} alt={`${metadata.name} kit`} /> : <KitVisual variant={metadata.image || kit.image} />}<span><Play fill="currentColor" /></span></div>{items.slice(0, 3).map((item, itemIndex) => <small key={item.id || item.title}>{itemIndex + 1}. {item.title}</small>)}</div></div></div><span className="laptop-base" /></div>
      </section>
    )
  }

  if (section.type === 'cta') {
    return <section className="container detail-final-cta" key={section.id}><div><span>{section.eyebrow || 'READY TO GET STARTED?'}</span><h2>{section.title}</h2>{section.description && <p>{section.description}</p>}{(section.imageUrl || section.videoUrl) && <MediaDisplay imageUrl={section.imageUrl} videoUrl={section.videoUrl} alt={section.title} className="detail-section-media" />}</div><DetailLink to={section.buttonUrl} fallback="/contact" className="detail-button detail-button-primary">{section.buttonLabel || 'Request a School Demo'} <ArrowRight /></DetailLink></section>
  }

  return (
    <section className="container detail-section detail-custom-section" key={section.id}>
      <div className="detail-section-body"><SectionHeading section={section} index={index} />{section.body && <p className="detail-custom-body">{section.body}</p>}
        {(section.imageUrl || section.videoUrl) && <MediaDisplay imageUrl={section.imageUrl} videoUrl={section.videoUrl} alt={section.title} className="detail-section-media" />}
        {items.length > 0 && <div className="detail-custom-items">{items.map((item, itemIndex) => <article key={item.id || item.title}><ItemMedia item={item} fallbackVariant={fallbackGalleryVariants[itemIndex % fallbackGalleryVariants.length]} /><h3>{item.title}</h3>{item.description && <p>{item.description}</p>}</article>)}</div>}
      </div>
    </section>
  )
}

export default function KitDetailPage() {
  const { kitId } = useParams()
  const kit = roboticsKits.find((item) => item.id === kitId)
  const [content, setContent] = useState(() => kit ? createDefaultKitDetailContent(kit) : null)
  const [contentError, setContentError] = useState('')

  useEffect(() => {
    if (!kit) return undefined
    let active = true
    setContent(createDefaultKitDetailContent(kit))
    setContentError('')

    if (!supabase) {
      try {
        const records = JSON.parse(localStorage.getItem('tt-admin-kit-details') || '{}')
        const published = records?.[kit.id]?.published
        if (published?.metadata && Array.isArray(published.sections) && active) {
          setContent(withKitDetailDemoContent(kit, published))
        }
      } catch (error) {
        console.error('Unable to load locally published kit details:', error)
        if (active) setContentError('Published kit details could not be loaded. Showing the default kit information.')
      }
      return () => { active = false }
    }

    supabase
      .from('kit_detail_content')
      .select('published_content')
      .eq('kit_id', kit.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!active) return
        if (error) {
          console.error('Unable to load published kit details:', error.message)
          setContentError('Published kit details could not be loaded. Showing the default kit information.')
          return
        }
        const published = data?.published_content
        if (published) {
          if (published.metadata && Array.isArray(published.sections)) {
            setContent(withKitDetailDemoContent(kit, published))
          }
          else {
            console.error('Published kit details have an invalid content shape.')
            setContentError('Published kit details are invalid. Showing the default kit information.')
          }
        }
      })
      .catch((error) => {
        if (!active) return
        console.error('Unable to load published kit details:', error)
        setContentError('Published kit details could not be loaded. Showing the default kit information.')
      })

    return () => { active = false }
  }, [kit])

  if (!kit) return <main className="kit-detail-page"><section className="container kit-not-found"><h1>Kit not found</h1><p>Choose a class kit from the catalogue to see its details.</p><Link className="detail-button detail-button-primary" to="/kits"><ArrowLeft /> Back to all kits</Link></section></main>

  const defaults = createDefaultKitDetailContent(kit)
  const detail = content || defaults
  const metadata = { ...defaults.metadata, ...detail.metadata, classNumber: kit.classNumber, color: detail.metadata?.color || kit.color, image: detail.metadata?.image || kit.image }
  const sections = Array.isArray(detail.sections) ? detail.sections : defaults.sections
  const visibleSections = sections.filter((section) => section.visible !== false)
  const overviewTitle = metadata.name || kit.name
  let sectionHeadingIndex = 0

  return (
    <main className="kit-detail-page">
      <div className="container detail-breadcrumb"><Link to="/"><span>Home</span></Link><ChevronRight /><Link to="/kits">Robot Kits</Link><ChevronRight /><span>Class {kit.classNumber}</span><ChevronRight /><strong>{overviewTitle}</strong></div>
      {contentError && <p className="container detail-content-warning" role="status">{contentError}</p>}
      {metadata.welcomeVisible !== false && <section className="container detail-welcome" aria-labelledby="detail-welcome-title">
        <div className="detail-welcome-copy">
          {metadata.welcomeKicker && <span className="detail-welcome-kicker">{formatWelcomeText(metadata.welcomeKicker, metadata, kit)}</span>}
          <h1 id="detail-welcome-title">{overviewTitle}</h1>
          {metadata.summary && <p className="detail-welcome-summary">{metadata.summary}</p>}
        </div>
        <div className="detail-robot-message">
          {metadata.welcomeMessage && <p>{formatWelcomeText(metadata.welcomeMessage, metadata, kit)}</p>}
          <img className="detail-robot-image" src={metadata.robotImageUrl || robotImage} alt={metadata.robotImageAlt || "Tomorrow's Tinkers robot building a robotics project"} />
        </div>
      </section>}
      {visibleSections.map((section) => {
        const index = sectionHeadingIndex
        if (section.type !== 'overview' && section.type !== 'cta') sectionHeadingIndex += 1
        return renderDetailSection(section, index, kit, metadata)
      })}
    </main>
  )
}

function BarChart() {
  return <span className="detail-bar-chart" aria-hidden="true"><i /><i /><i /></span>
}
