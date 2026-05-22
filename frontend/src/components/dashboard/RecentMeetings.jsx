import MeetingCard from '../meetings/MeetingCard'
import EmptyState from '../shared/EmptyState'
import SkeletonCard from '../shared/SkeletonCard'

export default function RecentMeetings({ meetings = [], isLoading }) {
  if (isLoading) return <div className="grid gap-4">{[0, 1, 2, 3].map((item) => <SkeletonCard key={item} />)}</div>
  if (!meetings.length) return <EmptyState title="No meetings yet" description="Upload a recording to see summaries, transcripts, and action items here." actionLabel="Upload Meeting" />

  return <div className="grid gap-4">{meetings.slice(0, 5).map((meeting) => <MeetingCard meeting={meeting} key={meeting.id} />)}</div>
}
