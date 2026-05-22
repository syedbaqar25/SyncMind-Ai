import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckSquare, Clock, Users, Video } from 'lucide-react'

const icons = [Video, Clock, CheckSquare, Users]

function Counter({ value }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let frame = 0
    const totalFrames = 45
    const interval = setInterval(() => {
      frame += 1
      const progress = 1 - Math.pow(1 - frame / totalFrames, 3)
      setCount(Math.round(value * progress))
      if (frame >= totalFrames) clearInterval(interval)
    }, 1000 / 30)
    return () => clearInterval(interval)
  }, [value])

  return count
}

export default function StatsCards({ stats = [] }) {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = icons[index] || Video
        return (
          <motion.div whileHover={{ y: -2, boxShadow: '0 8px 30px rgba(99,102,241,0.15)' }} transition={{ type: 'spring', stiffness: 300 }} className="rounded-lg border border-border bg-surface p-5" key={stat.label}>
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary"><Icon size={20} /></div>
            <p className="mt-5 text-sm text-textSecondary">{stat.label}</p>
            <p className="mt-1 font-heading text-3xl font-bold text-textPrimary"><Counter value={stat.value || 0} /></p>
          </motion.div>
        )
      })}
    </div>
  )
}
