import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Eye, EyeOff, ImagePlus, Plus, Save, Trash2, Upload, Video } from 'lucide-react'
import { isSupabaseConfigured, supabase } from '../lib/supabase.js'
import { roboticsKits } from '../data/roboticsKits.js'
import { createDefaultKitDetailContent, withKitDetailDemoContent } from '../data/kitDetailContent.js'

const sectionTypes = [
  ['overview', 'Overview'],
  ['gallery', 'Gallery'],
  ['learning', 'Learning outcomes'],
  ['components', 'Kit components'],
  ['specifications', 'Specifications'],
  ['projects', 'Projects'],
  ['lms', 'LMS features'],
  ['cta', 'Call to action'],
  ['custom', 'Custom section'],
]

const inputClass = 'mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-brand-orange focus:bg-white'
const labelClass = 'block text-xs font-bold text-brand-navy'

function createId() {
  return globalThis.crypto?.randomUUID?.() || `item-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

function readLocalRecords() {
  try {
    const records = JSON.parse(localStorage.getItem('tt-admin-kit-details') || '{}')
    return records && typeof records === 'object' && !Array.isArray(records) ? records : {}
  } catch (error) {
    console.error('Unable to restore local kit-detail content:', error)
    throw new Error('Saved local kit content could not be read. Clear the damaged kit-detail draft from browser storage or configure Supabase.')
  }
}

function moveItem(items, index, direction) {
  const nextIndex = index + direction
  if (nextIndex < 0 || nextIndex >= items.length) return items
  const reordered = [...items]
  ;[reordered[index], reordered[nextIndex]] = [reordered[nextIndex], reordered[index]]
  return reordered
}

function isValidDestination(value) {
  const destination = value.trim()
  return !destination ||
    (destination.startsWith('/') && !destination.startsWith('//')) ||
    /^https?:\/\/\S+$/i.test(destination) ||
    /^(mailto|tel):\S+$/i.test(destination)
}

function MediaField({ label, value, accept, onChange, onUpload, disabled, Icon }) {
  return (
    <div>
      <label className={labelClass}>{label} URL
        <input type="text" value={value || ''} onChange={(event) => onChange(event.target.value)} placeholder="https:// or an uploaded asset" className={inputClass} />
      </label>
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-brand-navy/10 px-3 py-2 text-xs font-bold text-brand-navy hover:border-brand-orange">
          <Upload className="h-3.5 w-3.5" /> Upload {label.toLowerCase()}
          <input type="file" accept={accept} disabled={disabled} onChange={onUpload} className="sr-only" />
        </label>
        {value && <button type="button" onClick={() => onChange('')} className="rounded-lg px-2 py-2 text-xs font-bold text-red-600 hover:bg-red-50">Remove</button>}
        {value && <span className="flex items-center gap-1 truncate text-xs text-slate-500"><Icon className="h-3.5 w-3.5 shrink-0" /> Asset set</span>}
      </div>
      {value && Icon === ImagePlus && <img src={value} alt={`${label} preview`} className="mt-2 max-h-40 w-full rounded-lg border border-slate-200 bg-slate-50 object-contain" />}
      {value && Icon === Video && <video src={value} controls preload="metadata" className="mt-2 max-h-40 w-full rounded-lg bg-slate-900" />}
    </div>
  )
}

export default function KitDetailContentPage({ session }) {
  const [kitId, setKitId] = useState(roboticsKits[0].id)
  const kit = useMemo(() => roboticsKits.find((item) => item.id === kitId) || roboticsKits[0], [kitId])
  const [content, setContent] = useState(() => createDefaultKitDetailContent(roboticsKits[0]))
  const [publishedContent, setPublishedContent] = useState(null)
  const [loading, setLoading] = useState(Boolean(supabase))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    setMessage('')

    if (!supabase) {
      try {
        const record = readLocalRecords()[kit.id]
        if (active) {
          const savedContent = record?.draft || record?.published
          setContent(savedContent
            ? withKitDetailDemoContent(kit, savedContent)
            : createDefaultKitDetailContent(kit))
          setPublishedContent(record?.published || null)
          setLoading(false)
        }
      } catch (loadError) {
        if (active) {
          setError(loadError.message)
          setContent(createDefaultKitDetailContent(kit))
          setPublishedContent(null)
          setLoading(false)
        }
      }
      return () => { active = false }
    }

    supabase
      .from('kit_detail_content')
      .select('draft_content, published_content')
      .eq('kit_id', kit.id)
      .maybeSingle()
      .then(({ data, error: loadError }) => {
        if (!active) return
        if (loadError) {
          console.error('Unable to load kit-detail content:', loadError.message)
          setError(`Could not load ${kit.name}: ${loadError.message}`)
        } else {
          const savedContent = data?.draft_content || data?.published_content
          setContent(savedContent
            ? withKitDetailDemoContent(kit, savedContent)
            : createDefaultKitDetailContent(kit))
          setPublishedContent(data?.published_content || null)
        }
        setLoading(false)
      })
      .catch((loadError) => {
        if (!active) return
        console.error('Unable to load kit-detail content:', loadError)
        setError(`Could not load ${kit.name}. Please try again.`)
        setLoading(false)
      })

    return () => { active = false }
  }, [kit])

  const updateMetadata = (field, value) => {
    setContent((current) => ({ ...current, metadata: { ...current.metadata, [field]: value } }))
  }

  const updateSection = (sectionId, patch) => {
    setContent((current) => ({
      ...current,
      sections: current.sections.map((section) => section.id === sectionId ? { ...section, ...patch } : section),
    }))
  }

  const updateItem = (sectionId, itemId, patch) => {
    const section = content.sections.find((item) => item.id === sectionId)
    updateSection(sectionId, {
      items: (section?.items || []).map((item) => item.id === itemId ? { ...item, ...patch } : item),
    })
  }

  const uploadAsset = async (file, onComplete) => {
    if (!file) return
    setError('')
    setMessage('')
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    if (!isImage && !isVideo) {
      setError('Choose an image or video file.')
      return
    }
    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm', 'video/quicktime']
    if (!supportedTypes.includes(file.type)) {
      setError('Supported media: JPG, PNG, WebP, GIF, MP4, WebM, and MOV.')
      return
    }

    if (!supabase) {
      if (file.size > 2 * 1024 * 1024) {
        setError('Local preview uploads are limited to 2 MB. Configure Supabase to upload larger media.')
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') onComplete(reader.result)
        else setError('Unable to read the selected media file.')
      }
      reader.onerror = () => setError('Unable to read the selected media file.')
      reader.readAsDataURL(file)
      return
    }

    setSaving(true)
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
    const path = `${kit.id}/${createId()}-${safeName}`
    try {
      const { error: uploadError } = await supabase.storage.from('kit-content-media').upload(path, file, {
        cacheControl: '3600',
        contentType: file.type,
        upsert: false,
      })
      if (uploadError) {
        console.error('Unable to upload kit media:', uploadError.message)
        setError(`Media upload failed: ${uploadError.message}`)
        return
      }
      const { data } = supabase.storage.from('kit-content-media').getPublicUrl(path)
      onComplete(data.publicUrl)
      setMessage('Media uploaded. Save the draft to keep this change.')
    } catch (uploadError) {
      console.error('Unable to upload kit media:', uploadError)
      setError('Media upload failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const uploadItemAsset = (sectionId, itemId, field) => (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    void uploadAsset(file, (url) => updateItem(sectionId, itemId, { [field]: url }))
  }

  const uploadSectionAsset = (sectionId, field) => (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    void uploadAsset(file, (url) => updateSection(sectionId, { [field]: url }))
  }

  const uploadMetadataAsset = (field) => (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    void uploadAsset(file, (url) => updateMetadata(field, url))
  }

  const save = async (action) => {
    setError('')
    setMessage('')
    const destinations = [
      content.metadata.schoolCtaUrl || '',
      content.metadata.lmsCtaUrl || '',
      ...content.sections.filter((section) => section.type === 'cta').map((section) => section.buttonUrl || ''),
    ]
    if (destinations.some((destination) => !isValidDestination(destination))) {
      setError('Use an internal path such as /contact or a valid https://, mailto:, or tel: destination.')
      return
    }

    setSaving(true)
    const nextPublished = action === 'publish' ? content : action === 'unpublish' ? null : publishedContent

    if (!supabase) {
      try {
        const records = readLocalRecords()
        records[kit.id] = { draft: content, published: nextPublished }
        localStorage.setItem('tt-admin-kit-details', JSON.stringify(records))
        setPublishedContent(nextPublished)
        setMessage(action === 'publish' ? 'Published in local preview.' : action === 'unpublish' ? 'Kit details unpublished from local preview.' : 'Draft saved locally.')
      } catch (saveError) {
        console.error('Unable to save local kit-detail content:', saveError)
        setError(`Could not save kit content: ${saveError.message}`)
      } finally {
        setSaving(false)
      }
      return
    }

    try {
      const { error: saveError } = await supabase.from('kit_detail_content').upsert({
        kit_id: kit.id,
        draft_content: content,
        published_content: nextPublished,
        updated_by: session?.id || null,
        published_at: action === 'publish' ? new Date().toISOString() : nextPublished ? undefined : null,
      }, { onConflict: 'kit_id' })

      if (saveError) {
        console.error('Unable to save kit-detail content:', saveError.message)
        setError(`Could not ${action} ${kit.name}: ${saveError.message}`)
      } else {
        setPublishedContent(nextPublished)
        setMessage(action === 'publish' ? 'Kit details published.' : action === 'unpublish' ? 'Kit details unpublished.' : 'Draft saved.')
      }
    } catch (saveError) {
      console.error('Unable to save kit-detail content:', saveError)
      setError(`Could not ${action} ${kit.name}. Please try again.`)
    } finally {
      setSaving(false)
    }
  }

  const addSection = () => {
    setContent((current) => ({
      ...current,
      sections: [...current.sections, {
        id: createId(),
        type: 'custom',
        title: 'New section',
        description: '',
        body: '',
        visible: true,
        imageUrl: '',
        videoUrl: '',
        items: [],
      }],
    }))
  }

  const addItem = (section) => updateSection(section.id, {
    items: [...(section.items || []), { id: createId(), title: '', description: '', value: '', duration: '', imageUrl: '', videoUrl: '' }],
  })

  const updateOrder = (sectionId, direction) => setContent((current) => {
    const index = current.sections.findIndex((section) => section.id === sectionId)
    return { ...current, sections: moveItem(current.sections, index, direction) }
  })

  const status = !publishedContent ? 'Draft only' : JSON.stringify(publishedContent) === JSON.stringify(content) ? 'Published' : 'Published version · newer draft'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-orange-dark">Website · Kit details</p>
          <h1 className="mt-2 text-3xl font-black font-display text-brand-navy">Kit Detail Content</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">Each class starts with editable demo copy, gallery images, and sample videos. Replace the sample media with your own before publishing.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={saving || loading} onClick={() => void save('draft')} className="inline-flex items-center gap-2 rounded-xl border border-brand-navy/10 bg-white px-3 py-2 text-sm font-bold text-brand-navy disabled:opacity-50"><Save className="h-4 w-4" /> Save draft</button>
          <button type="button" disabled={saving || loading} onClick={() => {
            if (window.confirm(`Publish the ${kit.name} detail page?`)) void save('publish')
          }} className="rounded-xl bg-brand-navy px-4 py-2 text-sm font-bold text-white disabled:opacity-50">{saving ? 'Saving…' : 'Publish'}</button>
          {publishedContent && <button type="button" disabled={saving || loading} onClick={() => {
            if (window.confirm(`Unpublish the ${kit.name} detail page? Visitors will see the built-in default content.`)) void save('unpublish')
          }} className="rounded-xl border border-red-200 bg-white px-3 py-2 text-sm font-bold text-red-700 disabled:opacity-50">Unpublish</button>}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-brand-navy/10 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex items-center gap-3 text-sm font-bold text-brand-navy">
          Edit class
          <select value={kit.id} onChange={(event) => setKitId(event.target.value)} disabled={saving} className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
            {roboticsKits.map((item) => <option key={item.id} value={item.id}>Class {item.classNumber} · {item.name}</option>)}
          </select>
        </label>
        <span className="text-xs font-bold text-brand-orange-dark">{loading ? 'Loading…' : status}</span>
      </div>

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {message && <div role="status" className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{message}</div>}
      {isSupabaseConfigured && <p className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs leading-5 text-blue-900">To enable uploaded images and videos, apply the kit-content migration first. Supported uploads: JPG, PNG, WebP, GIF, MP4, WebM and MOV up to 50 MB.</p>}

      <fieldset disabled={loading || saving} className="space-y-6 disabled:opacity-70">
        <section className="rounded-2xl border border-brand-navy/10 bg-white p-5">
          <h2 className="text-lg font-black text-brand-navy">Page details</h2>
          <p className="mt-1 text-xs text-slate-500">Manage the kit heading, welcome message, imagery, introduction, and learning stats.</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <label className={labelClass}>Kit name<input value={content.metadata.name} onChange={(event) => updateMetadata('name', event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>Difficulty level<input value={content.metadata.level} onChange={(event) => updateMetadata('level', event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>Learning time<input value={content.metadata.time} onChange={(event) => updateMetadata('time', event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>Number of projects<input type="number" min="0" value={content.metadata.projects} onChange={(event) => updateMetadata('projects', Number(event.target.value))} className={inputClass} /></label>
            <label className={`${labelClass} sm:col-span-2`}>Short introduction<textarea rows="2" value={content.metadata.short} onChange={(event) => updateMetadata('short', event.target.value)} className={inputClass} /></label>
            <label className={`${labelClass} sm:col-span-2 xl:col-span-3`}>Page description<textarea rows="3" value={content.metadata.summary || ''} onChange={(event) => updateMetadata('summary', event.target.value)} className={inputClass} /></label>
            <label className="flex items-center gap-2 text-xs font-bold text-brand-navy"><input type="checkbox" checked={content.metadata.welcomeVisible !== false} onChange={(event) => updateMetadata('welcomeVisible', event.target.checked)} /> Show welcome section</label>
            <label className={labelClass}>Welcome label<input value={content.metadata.welcomeKicker || ''} onChange={(event) => updateMetadata('welcomeKicker', event.target.value)} className={inputClass} /></label>
            <label className={`${labelClass} sm:col-span-2`}>Robot message<textarea rows="2" value={content.metadata.welcomeMessage || ''} onChange={(event) => updateMetadata('welcomeMessage', event.target.value)} placeholder="Use {name}, {classNumber}, {projects}, or {time}" className={inputClass} /></label>
            <MediaField label="Kit cover image" value={content.metadata.coverImageUrl || ''} accept="image/jpeg,image/png,image/webp,image/gif" Icon={ImagePlus} disabled={saving} onChange={(value) => updateMetadata('coverImageUrl', value)} onUpload={uploadMetadataAsset('coverImageUrl')} />
            <MediaField label="Welcome robot image" value={content.metadata.robotImageUrl || ''} accept="image/jpeg,image/png,image/webp,image/gif" Icon={ImagePlus} disabled={saving} onChange={(value) => updateMetadata('robotImageUrl', value)} onUpload={uploadMetadataAsset('robotImageUrl')} />
            <label className={labelClass}>Welcome image alt text<input value={content.metadata.robotImageAlt || ''} onChange={(event) => updateMetadata('robotImageAlt', event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>Component card prompt<input value={content.metadata.componentTapLabel || ''} onChange={(event) => updateMetadata('componentTapLabel', event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>Component card return label<input value={content.metadata.componentBackLabel || ''} onChange={(event) => updateMetadata('componentBackLabel', event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>Badge colour
              <select value={content.metadata.color || 'orange'} onChange={(event) => updateMetadata('color', event.target.value)} className={inputClass}>
                <option value="orange">Orange</option>
                <option value="blue">Blue</option>
              </select>
            </label>
            <label className={labelClass}>Class badge label<input value={content.metadata.classLabel || ''} onChange={(event) => updateMetadata('classLabel', event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>Difficulty stat label<input value={content.metadata.difficultyLabel || ''} onChange={(event) => updateMetadata('difficultyLabel', event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>Learning time stat label<input value={content.metadata.timeLabel || ''} onChange={(event) => updateMetadata('timeLabel', event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>Project stat label<input value={content.metadata.projectsLabel || ''} onChange={(event) => updateMetadata('projectsLabel', event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>Build stat caption<input value={content.metadata.buildsLabel || ''} onChange={(event) => updateMetadata('buildsLabel', event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>School enquiry button<input value={content.metadata.schoolCtaLabel || ''} onChange={(event) => updateMetadata('schoolCtaLabel', event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>School enquiry destination<input value={content.metadata.schoolCtaUrl || ''} onChange={(event) => updateMetadata('schoolCtaUrl', event.target.value)} placeholder="/contact or https://..." className={inputClass} /></label>
            <label className={labelClass}>LMS button<input value={content.metadata.lmsCtaLabel || ''} onChange={(event) => updateMetadata('lmsCtaLabel', event.target.value)} className={inputClass} /></label>
            <label className={labelClass}>LMS destination<input value={content.metadata.lmsCtaUrl || ''} onChange={(event) => updateMetadata('lmsCtaUrl', event.target.value)} placeholder="/login/school or https://..." className={inputClass} /></label>
            <label className={labelClass}>Gallery video link label<input value={content.metadata.watchLabel || ''} onChange={(event) => updateMetadata('watchLabel', event.target.value)} className={inputClass} /></label>
          </div>
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-xl font-black text-brand-navy">Page sections</h2><p className="mt-1 text-xs text-slate-500">Hide, remove, reorder, or add sections. Each section can have its own text, images, videos, and editable items.</p></div>
          <button type="button" onClick={addSection} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-orange px-4 py-2 text-sm font-black text-brand-navy"><Plus className="h-4 w-4" /> Add section</button>
        </div>

        {content.sections.map((section, index) => (
          <section key={section.id} className="space-y-4 rounded-2xl border border-brand-navy/10 bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div><span className="text-[10px] font-black uppercase tracking-widest text-brand-orange-dark">Section {String(index + 1).padStart(2, '0')}</span><h3 className="mt-1 text-lg font-black text-brand-navy">{section.title || 'Untitled section'}</h3></div>
              <div className="flex items-center gap-1">
                <button type="button" disabled={index === 0} onClick={() => updateOrder(section.id, -1)} aria-label="Move section up" className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" disabled={index === content.sections.length - 1} onClick={() => updateOrder(section.id, 1)} aria-label="Move section down" className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"><ArrowDown className="h-4 w-4" /></button>
                <button type="button" onClick={() => updateSection(section.id, { visible: section.visible === false })} className="rounded-lg border border-slate-200 p-2 text-brand-navy" aria-label={section.visible === false ? 'Show section' : 'Hide section'}>{section.visible === false ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                <button type="button" onClick={() => {
                  if (window.confirm(`Delete the "${section.title}" section from this draft?`)) {
                    setContent((current) => ({ ...current, sections: current.sections.filter((item) => item.id !== section.id) }))
                  }
                }} aria-label="Delete section" className="rounded-lg border border-red-100 p-2 text-red-600"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <label className={labelClass}>Section type
                <select value={section.type} onChange={(event) => updateSection(section.id, { type: event.target.value })} className={inputClass}>
                  {sectionTypes.map(([value, name]) => <option key={value} value={value}>{name}</option>)}
                </select>
              </label>
              <label className={labelClass}>Heading<input value={section.title || ''} onChange={(event) => updateSection(section.id, { title: event.target.value })} className={inputClass} /></label>
              <label className={labelClass}>Section intro<textarea rows="2" value={section.description || ''} onChange={(event) => updateSection(section.id, { description: event.target.value })} className={inputClass} /></label>
              {section.type === 'custom' && <label className={labelClass}>Section text<textarea rows="3" value={section.body || ''} onChange={(event) => updateSection(section.id, { body: event.target.value })} className={inputClass} /></label>}
              {section.type === 'cta' && <>
                <label className={labelClass}>Eyebrow text<input value={section.eyebrow || ''} onChange={(event) => updateSection(section.id, { eyebrow: event.target.value })} className={inputClass} /></label>
                <label className={labelClass}>Button label<input value={section.buttonLabel || ''} onChange={(event) => updateSection(section.id, { buttonLabel: event.target.value })} className={inputClass} /></label>
                <label className={labelClass}>Button destination<input value={section.buttonUrl || ''} onChange={(event) => updateSection(section.id, { buttonUrl: event.target.value })} placeholder="/contact or https://..." className={inputClass} /></label>
              </>}
              {section.type !== 'gallery' && section.type !== 'overview' && <MediaField label="Section image" value={section.imageUrl || ''} accept="image/jpeg,image/png,image/webp,image/gif" Icon={ImagePlus} disabled={saving} onChange={(value) => updateSection(section.id, { imageUrl: value })} onUpload={uploadSectionAsset(section.id, 'imageUrl')} />}
              {section.type !== 'gallery' && section.type !== 'overview' && <MediaField label="Section video" value={section.videoUrl || ''} accept="video/mp4,video/webm,video/quicktime" Icon={Video} disabled={saving} onChange={(value) => updateSection(section.id, { videoUrl: value })} onUpload={uploadSectionAsset(section.id, 'videoUrl')} />}
            </div>

            {!['overview', 'cta'].includes(section.type) && <div className="space-y-3">
              {section.type === 'gallery' && <p className="text-xs leading-5 text-slate-500">Each media item can include an image and a video. Add as many items as needed to build a multi-image and multi-video gallery.</p>}
              {(section.items || []).map((item, itemIndex) => (
                <div key={item.id} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <strong className="text-xs text-brand-navy">{section.type === 'gallery' ? 'Media' : section.type === 'components' ? 'Component' : section.type === 'projects' ? 'Project' : section.type === 'lms' ? 'LMS feature' : 'Item'} {itemIndex + 1}</strong>
                    <div className="flex gap-1">
                      <button type="button" disabled={itemIndex === 0} onClick={() => updateSection(section.id, { items: moveItem(section.items, itemIndex, -1) })} aria-label="Move item up" className="rounded-md border border-slate-200 p-1.5 disabled:opacity-40"><ArrowUp className="h-3.5 w-3.5" /></button>
                      <button type="button" disabled={itemIndex === section.items.length - 1} onClick={() => updateSection(section.id, { items: moveItem(section.items, itemIndex, 1) })} aria-label="Move item down" className="rounded-md border border-slate-200 p-1.5 disabled:opacity-40"><ArrowDown className="h-3.5 w-3.5" /></button>
                      <button type="button" onClick={() => updateSection(section.id, { items: section.items.filter((entry) => entry.id !== item.id) })} aria-label="Delete item" className="rounded-md border border-red-100 p-1.5 text-red-600"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <label className={labelClass}>{section.type === 'specifications' ? 'Label' : 'Name / title'}
                      <input value={item.title || ''} onChange={(event) => updateItem(section.id, item.id, { title: event.target.value })} className={inputClass} />
                    </label>
                    {section.type === 'specifications'
                      ? <label className={labelClass}>Value<input value={item.value || ''} onChange={(event) => updateItem(section.id, item.id, { value: event.target.value })} className={inputClass} /></label>
                      : <label className={labelClass}>Description<textarea rows="2" value={item.description || ''} onChange={(event) => updateItem(section.id, item.id, { description: event.target.value })} className={inputClass} /></label>}
                    {section.type === 'projects' && <label className={labelClass}>Project duration<input value={item.duration || ''} onChange={(event) => updateItem(section.id, item.id, { duration: event.target.value })} className={inputClass} /></label>}
                    {section.type !== 'specifications' && <>
                      <MediaField label="Image" value={item.imageUrl || ''} accept="image/jpeg,image/png,image/webp,image/gif" Icon={ImagePlus} disabled={saving} onChange={(value) => updateItem(section.id, item.id, { imageUrl: value })} onUpload={uploadItemAsset(section.id, item.id, 'imageUrl')} />
                      <MediaField label="Video" value={item.videoUrl || ''} accept="video/mp4,video/webm,video/quicktime" Icon={Video} disabled={saving} onChange={(value) => updateItem(section.id, item.id, { videoUrl: value })} onUpload={uploadItemAsset(section.id, item.id, 'videoUrl')} />
                    </>}
                  </div>
                </div>
              ))}
              <button type="button" onClick={() => addItem(section)} className="inline-flex items-center gap-2 rounded-lg border border-dashed border-brand-navy/20 px-3 py-2 text-xs font-bold text-brand-navy hover:border-brand-orange"><Plus className="h-3.5 w-3.5" /> Add {section.type === 'gallery' ? 'media' : section.type === 'components' ? 'component' : section.type === 'projects' ? 'project' : section.type === 'lms' ? 'feature' : 'item'}</button>
            </div>}
          </section>
        ))}
      </fieldset>
    </div>
  )
}
