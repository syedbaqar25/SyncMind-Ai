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
    <section id="voices" className="overflow-hidden bg-background py-10 sm:py-16 lg:py-20">
      <h2 className="px-4 text-center font-heading text-2xl font-bold text-textPrimary sm:px-5 sm:text-3xl lg:text-4xl">Built for teams that move after meetings.</h2>
      <div className="mt-8 flex w-max animate-marquee gap-3 sm:mt-12 sm:gap-4">
        {row.map(([name, role, quote], index) => (
          <div className="w-64 rounded-lg border border-white/10 bg-white/5 p-4 backdrop-blur sm:w-80 sm:p-5" key={`${name}-${index}`}>
            <p className="text-xs leading-5 text-textPrimary sm:text-sm sm:leading-6">"{quote}"</p>
            <div className="mt-3 text-xs text-textSecondary sm:mt-5 sm:text-sm"><span className="text-textPrimary">{name}</span> / {role}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
