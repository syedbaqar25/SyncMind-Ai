import { useMemo, useState } from 'react'
import DashboardLayout from '../components/layout/DashboardLayout'
import MeetingCard from '../components/meetings/MeetingCard'
import MeetingUpload from '../components/meetings/MeetingUpload'
import EmptyState from '../components/shared/EmptyState'
import SkeletonCard from '../components/shared/SkeletonCard'
import { useMeetings } from '../hooks/useMeetings'
import { useWorkspaceStore } from '../store/workspaceStore'

const tabs = ['All', 'Processing', 'Completed', 'Failed']

export default function MeetingsPage() {
  const workspaceId = useWorkspaceStore((state) => state.activeWorkspaceId)
  const [tab, setTab] = useState('All')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('newest')

  const params = useMemo(() => ({
    workspaceId,
    status: tab === 'All' ? undefined : tab.toUpperCase(),
    search: search || undefined,
    sort,
  }), [search, sort, tab, workspaceId])

  const meetingsQuery = useMeetings(params)
  const meetings = meetingsQuery.data?.data || []

  return (
    <DashboardLayout title="Meetings">
      <div className="space-y-6">
        <MeetingUpload workspaceId={workspaceId} onUploaded={() => meetingsQuery.refetch()} />
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {tabs.map((item) => (
              <button className={`rounded-lg px-3 py-2 text-sm ${tab === item ? 'bg-primary text-white' : 'bg-background text-textSecondary'}`} key={item} onClick={() => setTab(item)} type="button">{item}</button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <input className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-textPrimary outline-none focus:border-primary" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search meetings" />
            <select className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-textPrimary outline-none" value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="duration">Duration</option>
              <option value="name">Name</option>
            </select>
          </div>
        </div>
        {meetingsQuery.isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{[0, 1, 2, 3].map((item) => <SkeletonCard key={item} />)}</div>
        ) : meetings.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{meetings.map((meeting) => <MeetingCard meeting={meeting} key={meeting.id} onDeleted={() => meetingsQuery.refetch()} onUpdated={() => meetingsQuery.refetch()} />)}</div>
        ) : (
          <EmptyState title="Upload your first meeting" description="Start with an audio or video file and SyncMind will process the rest." actionLabel="Choose File" />
        )}
      </div>
    </DashboardLayout>
  )
}
