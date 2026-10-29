import robotImage from '../assets/icon.png'

const defaultLearningDescriptions = [
  'Try ideas, test and learn by doing.',
  'Assemble, connect and test components.',
  'Debug designs and improve them through practice.',
  'Bring creative ideas to life with a working build.',
]

const demoGalleryItems = [
  {
    title: 'Robotics build in action',
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=80',
    videoUrl: '',
    description: 'A sample robotics image for the kit gallery. Replace it with a photo of your kit.',
    variant: 'robot',
  },
  {
    title: 'Electronics close-up',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    videoUrl: '',
    description: 'A sample electronics image for the kit gallery. Replace it with a photo of your components.',
    variant: 'circuit',
  },
  {
    title: 'Hands-on classroom project',
    imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80',
    videoUrl: '',
    description: 'A sample project image for the kit gallery. Replace it with a classroom activity photo.',
    variant: 'gears',
  },
  {
    title: 'Demo video sample 1',
    imageUrl: robotImage,
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
    description: 'Sample video for testing the gallery player. Replace it with a video of this kit.',
    variant: 'robot',
  },
  {
    title: 'Demo video sample 2',
    imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm',
    description: 'Second sample video for testing multiple gallery videos. Replace it before publishing.',
    variant: 'circuit',
  },
]

const defaultLmsFeatures = [
  ['Video Lessons', 'Easy-to-follow step-by-step videos.'],
  ['Digital Project Guides', 'Downloadable worksheets and instructions.'],
  ['Quizzes & Activities', 'Fun assessments to reinforce learning.'],
  ['Teacher Dashboard', 'Track student progress and manage classes.'],
  ['Student Certificates', 'Celebrate student achievements.'],
]

const defaultSpecificationLabels = [
  ['Power Supply', 'power'],
  ['Motor Type', 'motor'],
  ['Chassis Material', 'chassis'],
  ['Other Components', 'other'],
]

export function createDefaultKitDetailContent(kit) {
  return {
    metadata: {
      name: kit.name,
      short: kit.short,
      level: kit.level,
      time: kit.time,
      projects: kit.projects,
      summary: kit.summary,
      power: kit.power,
      motor: kit.motor,
      chassis: kit.chassis,
      other: kit.other,
      color: kit.color,
      image: kit.image,
      welcomeVisible: true,
      welcomeKicker: 'MEET YOUR CLASS {classNumber} KIT',
      welcomeMessage: 'Hi! I’m {name}. Let’s build {projects} projects together!',
      robotImageUrl: robotImage,
      robotImageAlt: "Tomorrow's Tinkers robot building a robotics project",
      coverImageUrl: demoGalleryItems[0].imageUrl,
      componentTapLabel: 'Tap to see more',
      componentBackLabel: 'Back to image',
      classLabel: 'CLASS',
      difficultyLabel: 'Difficulty Level',
      timeLabel: 'Total Learning Time',
      projectsLabel: 'Projects',
      buildsLabel: 'Hands-on Builds',
      schoolCtaLabel: 'Enquire for School',
      schoolCtaUrl: '/contact',
      lmsCtaLabel: 'Explore LMS',
      lmsCtaUrl: '/login/school',
      watchLabel: 'Watch Projects',
    },
    sections: [
      {
        id: 'gallery',
        type: 'gallery',
        title: 'Kit gallery',
        description: 'Explore sample kit images and videos. Replace these examples with your own media before publishing.',
        visible: true,
        items: demoGalleryItems.map((item, index) => ({
          id: `gallery-${index + 1}`,
          ...item,
        })),
      },
      {
        id: 'overview',
        type: 'overview',
        title: 'Kit overview',
        description: `${kit.name} is designed for Class ${kit.classNumber} students to explore robotics through engaging activities and creative projects.`,
        visible: true,
        imageUrl: '',
        videoUrl: '',
        items: [],
      },
      {
        id: 'learning',
        type: 'learning',
        title: 'What Students Will Learn',
        description: 'Students explore robotics through hands-on activities and develop curiosity, creativity and problem-solving skills.',
        visible: false,
        items: kit.outcomes.map((title, index) => ({
          id: `outcome-${index + 1}`,
          title,
          description: defaultLearningDescriptions[index % defaultLearningDescriptions.length],
          imageUrl: '',
          videoUrl: '',
        })),
      },
      {
        id: 'components',
        type: 'components',
        title: 'What’s Inside the Kit',
        description: `Explore the essential parts used to complete the ${kit.name} projects.`,
        visible: true,
        imageUrl: '',
        videoUrl: '',
        items: kit.components.map((title, index) => ({
          id: `component-${index + 1}`,
          title,
          description: `A hands-on part for assembling and testing ${kit.name} projects.`,
          imageUrl: '',
          videoUrl: '',
        })),
      },
      {
        id: 'specifications',
        type: 'specifications',
        title: 'Key Specifications',
        description: `A quick reference to the power, mechanics and materials included with ${kit.name}.`,
        visible: true,
        items: [
          ...defaultSpecificationLabels.map(([title, key], index) => ({
            id: `spec-${index + 1}`,
            title,
            value: kit[key],
          })),
          {
            id: 'spec-5',
            title: 'Reusability',
            value: 'Most components can be reused for future projects',
          },
        ],
      },
      {
        id: 'projects',
        type: 'projects',
        title: 'Projects & Lesson Sequence',
        description: 'Step-by-step projects designed for young learners with clear instructions and fun challenges.',
        visible: true,
        imageUrl: '',
        videoUrl: '',
        items: kit.lessons.map((title, index) => ({
          id: `project-${index + 1}`,
          title,
          description: `${title} — a hands-on build that helps students explore ${kit.short.toLowerCase()}`,
          duration: ['30 mins', '30 mins', '45 mins', '45 mins', '60 mins'][index % 5],
          imageUrl: '',
          videoUrl: '',
        })),
      },
      {
        id: 'lms',
        type: 'lms',
        title: 'LMS Subscription',
        description: 'Access step-by-step video lessons, downloadable guides, quizzes and more through our online learning platform.',
        visible: true,
        imageUrl: '',
        videoUrl: '',
        items: defaultLmsFeatures.map(([title, description], index) => ({
          id: `lms-feature-${index + 1}`,
          title,
          description,
          imageUrl: '',
          videoUrl: '',
        })),
      },
      {
        id: 'school-demo-cta',
        type: 'cta',
        eyebrow: 'READY TO GET STARTED?',
        title: 'Bring robotics to your school.',
        description: 'Talk to our team about a classroom demo and the right kit for your students.',
        buttonLabel: 'Request a School Demo',
        buttonUrl: '/contact',
        visible: true,
        items: [],
      },
    ],
  }
}

function fillMissingContent(defaultValue, savedValue) {
  if (typeof defaultValue === 'string') {
    return typeof savedValue === 'string' && savedValue.trim() ? savedValue : defaultValue
  }

  if (Array.isArray(defaultValue)) {
    if (!Array.isArray(savedValue) || savedValue.length === 0) return defaultValue
    return savedValue.map((item, index) => (
      index < defaultValue.length
        ? fillMissingContent(defaultValue[index], item)
        : item
    ))
  }

  if (defaultValue && typeof defaultValue === 'object') {
    const savedObject = savedValue && typeof savedValue === 'object' && !Array.isArray(savedValue)
      ? savedValue
      : {}
    const merged = { ...defaultValue, ...savedObject }
    Object.keys(defaultValue).forEach((key) => {
      merged[key] = fillMissingContent(defaultValue[key], savedObject[key])
    })
    return merged
  }

  return savedValue ?? defaultValue
}

export function withKitDetailDemoContent(kit, content) {
  if (kit.id !== 'class-1' || !content) return content

  const defaults = createDefaultKitDetailContent(kit)
  const savedSections = Array.isArray(content.sections) ? content.sections : []
  const merged = {
    ...defaults,
    ...content,
    metadata: fillMissingContent(defaults.metadata, content.metadata),
    sections: defaults.sections.map((defaultSection) => {
      const savedSection = savedSections.find((section) => section.id === defaultSection.id)
        || savedSections.find((section) => section.type === defaultSection.type)
      const section = fillMissingContent(defaultSection, savedSection)
      return {
        ...section,
        id: defaultSection.id,
        type: defaultSection.type,
        visible: defaultSection.visible,
      }
    }),
  }
  const gallery = merged.sections.find((section) => section.type === 'gallery')
  const defaultGallery = defaults.sections.find((section) => section.type === 'gallery')
  const galleryItems = [...(gallery.items || [])]
  const hasMedia = (field, item) => galleryItems.some((existing) => existing[field] === item[field])

  for (const item of defaultGallery.items) {
    const needsImage = galleryItems.filter((existing) => existing.imageUrl).length < 3
    const needsVideo = galleryItems.filter((existing) => existing.videoUrl).length < 2
    if ((needsImage && item.imageUrl && !hasMedia('imageUrl', item)) ||
        (needsVideo && item.videoUrl && !hasMedia('videoUrl', item))) {
      const existingIds = new Set(galleryItems.map((existing) => existing.id))
      const id = existingIds.has(item.id) ? `class-1-demo-${item.id}` : item.id
      galleryItems.push({ ...item, id })
    }
  }

  gallery.items = galleryItems
  return merged
}
