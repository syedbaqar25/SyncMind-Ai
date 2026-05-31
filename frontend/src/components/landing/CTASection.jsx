import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-surface px-4 py-10 sm:px-5 sm:py-16 lg:py-20">
      <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.22),transparent_42%)]" />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h2 className="font-heading text-2xl font-bold text-textPrimary sm:text-3xl md:text-4xl lg:text-5xl">Ready to transform your meetings?</h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-textSecondary sm:mt-5 sm:text-base">Upload, understand, assign, and search every meeting from one focused workspace.</p>
        <Link className="mt-6 inline-block sm:mt-8" to="/register"><Button className="px-6">Start Free</Button></Link>
      </div>
    </section>
  )
}
