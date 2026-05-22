export default function LoadingSpinner({ label = 'Loading' }) {
  return (
    <div className="inline-flex items-center gap-3 text-sm text-textSecondary">
      <span className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      <span>{label}</span>
    </div>
  )
}
