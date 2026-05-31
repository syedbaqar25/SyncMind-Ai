import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { AudioLines, Bot, CheckSquare, MessageSquareText, Search, Users } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const features = [
  [AudioLines, 'Precise transcription', 'Meeting audio becomes searchable text with speaker-aware segments.'],
  [Bot, 'Executive summaries', 'Key decisions, context, and outcomes are shaped into clean summaries.'],
  [CheckSquare, 'Action extraction', 'Follow-ups become assignable tasks with priority and due dates.'],
  [MessageSquareText, 'Meeting Q&A', 'Ask natural questions and get answers grounded in the transcript.'],
  [Users, 'Team workspaces', 'Collaborate with role-based access and live updates.'],
  [Search, 'Semantic search', 'Find moments by meaning across meetings, not just keywords.'],
]

export default function FeaturesSection() {
  const ref = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.feature-title', {
        scrollTrigger: {
          trigger: '.feature-title',
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
        opacity: 0,
        y: 30,
        duration: 0.7,
      })

      gsap.utils.toArray('.feature-card').forEach((card, index) => {
        gsap.from(card, {
          scrollTrigger: {
            trigger: card,
            start: 'top 95%',
            toggleActions: 'play none none none',
          },
          opacity: 0,
          y: 30,
          x: index % 2 === 0 ? -20 : 20,
          duration: 0.5,
          delay: index * 0.06,
        })
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section id="features" ref={ref} className="bg-background px-4 py-10 sm:px-5 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <div className="feature-title mx-auto mb-6 max-w-2xl text-center sm:mb-10">
          <h2 className="font-heading text-2xl font-bold text-textPrimary sm:text-3xl lg:text-4xl">Everything after the meeting, already done.</h2>
          <p className="mt-3 text-sm text-textSecondary sm:mt-4 sm:text-base">SyncMind turns recordings into a shared operating layer for decisions and follow-through.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {features.map(([Icon, title, description]) => (
            <div className="feature-card rounded-lg border border-border bg-surface p-4 transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)] sm:p-5 lg:p-6" key={title}>
              <Icon className="text-primary" size={24} />
              <h3 className="mt-3 font-heading text-base font-semibold text-textPrimary sm:mt-4 sm:text-lg lg:text-xl">{title}</h3>
              <p className="mt-2 text-xs leading-5 text-textSecondary sm:mt-3 sm:text-sm sm:leading-6">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
