import { motion } from 'framer-motion'
import { formatDistanceToNow } from 'date-fns'

export default function ActivityFeed({ events = [] }) {
  const items = events.length ? events : [{ id: 'welcome', description: 'Workspace ready', createdAt: new Date().toISOString() }]

  return (
    <div className="space-y-3">
      {items.map((event) => (
        <motion.div className="rounded-lg border border-border bg-surface p-4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} key={event.id}>
          <div className="flex gap-3">
            <div className="h-9 w-9 rounded-full bg-primary/20" />
            <div>
              <p className="text-sm text-textPrimary">{event.description}</p>
              <p className="mt-1 text-xs text-textSecondary">{formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
