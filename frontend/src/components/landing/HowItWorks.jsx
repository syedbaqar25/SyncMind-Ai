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
    <section id="workflow" className="bg-surface px-4 py-10 sm:px-5 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-center font-heading text-2xl font-bold text-textPrimary sm:text-3xl lg:text-4xl">From recording to momentum.</h2>
        <div className="relative mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 md:grid-cols-4 lg:mt-14">
          <div ref={lineRef} className="absolute left-0 right-0 top-10 hidden h-px bg-primary/60 md:block" />
          {steps.map(([Icon, title, description], index) => (
            <div className="relative rounded-lg border border-border bg-background p-4 text-center sm:p-6" key={title}>
              <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-primary to-accent font-mono text-base font-semibold text-white sm:h-14 sm:w-14 sm:text-lg">{index + 1}</div>
              <Icon className="mx-auto mt-4 text-primary sm:mt-5" size={24} />
              <h3 className="mt-3 font-heading text-base font-semibold text-textPrimary sm:mt-4 sm:text-xl">{title}</h3>
              <p className="mt-1.5 text-xs text-textSecondary sm:mt-2 sm:text-sm">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
