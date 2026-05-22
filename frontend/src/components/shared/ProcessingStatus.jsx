import { motion } from 'framer-motion'

const steps = ['TRANSCRIBING', 'ANALYZING', 'COMPLETED']

export default function ProcessingStatus({ status = 'PROCESSING' }) {
  const activeIndex = Math.max(steps.indexOf(status), 0)

  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        {steps.map((step, index) => (
          <div className="flex flex-1 items-center" key={step}>
            <div className={`grid h-10 w-10 place-items-center rounded-full border text-xs ${index <= activeIndex ? 'border-primary bg-primary text-white' : 'border-border bg-surface2 text-textSecondary'}`}>
              {index + 1}
            </div>
            {index < steps.length - 1 ? <div className="mx-2 h-px flex-1 bg-border"><motion.div className="h-px bg-primary" animate={{ width: index < activeIndex ? '100%' : '0%' }} /></div> : null}
          </div>
        ))}
      </div>
      <p className="mt-4 text-sm text-textSecondary">Current status: <span className="text-textPrimary">{status}</span></p>
    </div>
  )
}
