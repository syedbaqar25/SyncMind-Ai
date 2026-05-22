const testimonials = [
  ['Maya', 'Product lead', 'The action list is ready before our team leaves the call.'],
  ['Noah', 'Engineering manager', 'Search finally works the way my memory works.'],
  ['Ari', 'Founder', 'Our weekly updates turned into an actual operating rhythm.'],
  ['Lena', 'Designer', 'I can skim decisions without replaying an hour of audio.'],
  ['Sam', 'Student lead', 'Perfect capstone energy: polished, useful, and fast.'],
  ['Iris', 'Ops manager', 'Tasks land in one place instead of hiding in chat.'],
  ['Dev', 'Researcher', 'The summaries preserve context, not just bullet points.'],
  ['Rhea', 'Team lead', 'It makes follow-up feel calm instead of chaotic.'],
]

export default function TestimonialsSection() {
  const row = [...testimonials, ...testimonials]

  return (
    <section id="voices" className="overflow-hidden bg-background py-24">
      <h2 className="px-5 text-center font-heading text-4xl font-bold text-textPrimary">Built for teams that move after meetings.</h2>
      <div className="mt-12 flex w-max animate-marquee gap-4">
        {row.map(([name, role, quote], index) => (
          <div className="w-80 rounded-lg border border-white/10 bg-white/5 p-5 backdrop-blur" key={`${name}-${index}`}>
            <p className="text-sm leading-6 text-textPrimary">"{quote}"</p>
            <div className="mt-5 text-sm text-textSecondary"><span className="text-textPrimary">{name}</span> / {role}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
