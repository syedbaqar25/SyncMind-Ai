import { motion } from 'framer-motion'

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <main className="grid min-h-screen bg-background text-textPrimary lg:grid-cols-[0.42fr_0.58fr]">
      <section className="relative hidden overflow-hidden border-r border-border bg-surface lg:block">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.35),transparent_28%),radial-gradient(circle_at_80%_30%,rgba(168,85,247,0.24),transparent_24%),linear-gradient(135deg,#0a0a0f,#13131a)] animate-gradient-shift bg-[length:200%_200%]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-10">
          <div className="font-heading text-2xl font-bold">SyncMind AI</div>
          <div>
            <motion.h1
              className="max-w-md font-heading text-5xl font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Your Meetings. Understood. Automated.
            </motion.h1>
            <p className="mt-5 max-w-sm text-textSecondary">Turn recordings into summaries, decisions, and action items without losing the thread.</p>
          </div>
          <div className="text-sm text-textSecondary">AI meeting intelligence for focused teams.</div>
        </div>
      </section>
      <section className="flex items-center justify-center p-6">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <div className="mb-8">
            <div className="mb-6 font-heading text-2xl font-bold lg:hidden">SyncMind AI</div>
            <h1 className="font-heading text-3xl font-bold">{title}</h1>
            <p className="mt-2 text-sm text-textSecondary">{subtitle}</p>
          </div>
          {children}
        </motion.div>
      </section>
    </main>
  )
}
