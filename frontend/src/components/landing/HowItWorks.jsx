import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { FileUp, ListTodo, Sparkles, UploadCloud } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

const steps = [
  [UploadCloud, 'Upload', 'Drop in audio or video from the meeting.'],
  [FileUp, 'Transcribe', 'Whisper creates timestamped transcript segments.'],
  [Sparkles, 'Analyze', 'GPT extracts summaries, topics, sentiment, and tasks.'],
  [ListTodo, 'Execute', 'Teams assign, track, and complete action items.'],
]

export default function HowItWorks() {
  const lineRef = useRef(null)

  useEffect(() => {
    gsap.fromTo(lineRef.current, { scaleX: 0 }, {
      scaleX: 1,
      transformOrigin: 'left center',
      scrollTrigger: { trigger: lineRef.current, start: 'top 75%' },
      duration: 1,
      ease: 'power2.out',
    })
  }, [])

  return (
    <section id="workflow" className="bg-surface px-5 py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center font-heading text-4xl font-bold text-textPrimary">From recording to momentum.</h2>
        <div className="relative mt-14 grid gap-6 md:grid-cols-4">
          <div ref={lineRef} className="absolute left-0 right-0 top-10 hidden h-px bg-primary/60 md:block" />
          {steps.map(([Icon, title, description], index) => (
            <div className="relative rounded-lg border border-border bg-background p-6 text-center" key={title}>
              <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-mono text-lg font-semibold text-white">{index + 1}</div>
              <Icon className="mx-auto mt-5 text-primary" size={26} />
              <h3 className="mt-4 font-heading text-xl font-semibold text-textPrimary">{title}</h3>
              <p className="mt-2 text-sm text-textSecondary">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
