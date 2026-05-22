import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'

export default function CTASection() {
  return (
    <section className="relative overflow-hidden bg-surface px-5 py-24">
      <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.22),transparent_42%)]" />
      <div className="relative z-10 mx-auto max-w-3xl text-center">
        <h2 className="font-heading text-4xl font-bold text-textPrimary md:text-5xl">Ready to transform your meetings?</h2>
        <p className="mx-auto mt-5 max-w-xl text-textSecondary">Upload, understand, assign, and search every meeting from one focused workspace.</p>
        <Link className="mt-8 inline-block" to="/register"><Button className="px-6">Start Free</Button></Link>
      </div>
    </section>
  )
}
