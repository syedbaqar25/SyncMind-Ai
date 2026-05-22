export default function SkeletonCard({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-surface2 ${className || 'h-36 w-full'}`} />
}
