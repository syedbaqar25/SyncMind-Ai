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
        scrollTrigger: { trigger: ref.current, start: 'top 75%' },
        opacity: 0,
        y: 30,
        duration: 0.7,
      })
      gsap.from('.feature-card', {
        scrollTrigger: { trigger: ref.current, start: 'top 65%' },
        opacity: 0,
        x: (index) => (index % 2 === 0 ? -40 : 40),
        stagger: 0.08,
        duration: 0.65,
      })
    }, ref)
    return () => ctx.revert()
  }, [])

  return (
    <section id="features" ref={ref} className="bg-background px-5 py-24">
      <div className="mx-auto max-w-7xl">
        <div className="feature-title mx-auto mb-12 max-w-2xl text-center">
          <h2 className="font-heading text-4xl font-bold text-textPrimary">Everything after the meeting, already done.</h2>
          <p className="mt-4 text-textSecondary">SyncMind turns recordings into a shared operating layer for decisions and follow-through.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map(([Icon, title, description]) => (
            <div className="feature-card rounded-lg border border-border bg-surface p-6 transition hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_8px_30px_rgba(99,102,241,0.15)]" key={title}>
              <Icon className="text-primary" size={28} />
              <h3 className="mt-5 font-heading text-xl font-semibold text-textPrimary">{title}</h3>
              <p className="mt-3 text-sm leading-6 text-textSecondary">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
