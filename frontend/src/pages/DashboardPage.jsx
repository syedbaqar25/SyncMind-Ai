import AnalyticsCharts from '../components/dashboard/AnalyticsCharts'
import ActivityFeed from '../components/dashboard/ActivityFeed'
import RecentMeetings from '../components/dashboard/RecentMeetings'
import StatsCards from '../components/dashboard/StatsCards'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useMeetings } from '../hooks/useMeetings'
import { useWorkspaceStore } from '../store/workspaceStore'
import { useQuery } from '@tanstack/react-query'
import api from '../services/api'

export default function DashboardPage() {
  const workspaceId = useWorkspaceStore((state) => state.activeWorkspaceId)
  const meetingsQuery = useMeetings({ workspaceId, limit: 5 })
  const meetings = meetingsQuery.data?.data || []

  // Use the analytics overview API for accurate aggregate stats
  const overviewQuery = useQuery({
    queryKey: ['analytics-overview', workspaceId],
    queryFn: () => api.get('/analytics/overview', { params: { workspaceId } }).then((res) => res.data),
    enabled: Boolean(workspaceId),
    staleTime: 30000,
  })

  const overview = overviewQuery.data?.data || {}

  const stats = [
    { label: 'Total Meetings', value: overview.totalMeetings ?? meetings.length },
    { label: 'Hours Recorded', value: overview.hoursRecorded ?? Math.round(meetings.reduce((sum, meeting) => sum + (meeting.duration || 0), 0) / 3600) },
    { label: 'Action Items', value: overview.totalTasks ?? meetings.reduce((sum, meeting) => sum + (meeting.actionItems?.length || 0), 0) },
    { label: 'Team Members', value: overview.totalMembers ?? 1 },
  ]

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        <StatsCards stats={stats} />
        <div className="grid gap-6 lg:grid-cols-[0.6fr_0.4fr]">
          <section className="min-w-0">
            <h2 className="mb-4 font-heading text-xl font-semibold">Recent Meetings</h2>
            <RecentMeetings meetings={meetings} isLoading={meetingsQuery.isLoading} />
          </section>
          <section className="min-w-0">
            <h2 className="mb-4 font-heading text-xl font-semibold">Activity Feed</h2>
            <ActivityFeed />
          </section>
        </div>
        <AnalyticsCharts />
      </div>
    </DashboardLayout>
  )
}
