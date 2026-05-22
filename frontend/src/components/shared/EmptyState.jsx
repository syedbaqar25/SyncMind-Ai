import { Inbox } from 'lucide-react'
import { Button } from '../ui/Button'

export default function EmptyState({ title, description, actionLabel, onAction }) {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center rounded-lg border border-border bg-surface p-8 text-center">
      <div className="mb-4 grid h-16 w-16 place-items-center rounded-full bg-primary/10 text-primary">
        <Inbox size={28} />
      </div>
      <h3 className="font-heading text-xl font-semibold text-textPrimary">{title}</h3>
      <p className="mt-2 max-w-md text-sm text-textSecondary">{description}</p>
      {actionLabel ? (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
