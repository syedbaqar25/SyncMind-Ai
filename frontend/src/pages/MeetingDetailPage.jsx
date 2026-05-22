import { useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import DashboardLayout from '../components/layout/DashboardLayout'
import ActionItemsList from '../components/meetings/ActionItemsList'
import MeetingPlayer from '../components/meetings/MeetingPlayer'
import MeetingSummary from '../components/meetings/MeetingSummary'
import TranscriptViewer from '../components/meetings/TranscriptViewer'
import ProcessingStatus from '../components/shared/ProcessingStatus'
import SkeletonCard from '../components/shared/SkeletonCard'
import { meetingService } from '../services/meetingService'
import { taskService } from '../services/taskService'

const tabs = ['Summary', 'Action Items', 'Key Topics', 'Q&A']

export default function MeetingDetailPage() {
  const { id } = useParams()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('Summary')
  const [currentTime, setCurrentTime] = useState(0)
  const [wave, setWave] = useState(null)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])

  const meetingQuery = useQuery({
    queryKey: ['meeting', id],
    queryFn: () => meetingService.get(id),
  })

  const meeting = meetingQuery.data?.data
  const transcript = meeting?.transcript
  const actionItems = meeting?.actionItems || []
  const mediaUrl = meeting?.audioUrl || meeting?.videoUrl

  const updateTask = useMutation({
    mutationFn: ({ taskId, status }) => taskService.update(taskId, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['meeting', id] }),
  })

  const askMutation = useMutation({
    mutationFn: (value) => meetingService.ask(id, value),
    onSuccess: (response, asked) => {
      setMessages((items) => [...items, { role: 'user', text: asked }, { role: 'assistant', text: response.data.answer }])
      setQuestion('')
    },
  })

  const activeContent = useMemo(() => {
    if (tab === 'Summary') return <MeetingSummary summary={transcript?.summary} />
    if (tab === 'Action Items') return <ActionItemsList items={actionItems} onStatusChange={(taskId, status) => updateTask.mutate({ taskId, status })} />
    if (tab === 'Key Topics') {
      return <div className="flex flex-wrap gap-2">{(transcript?.keyTopics || []).map((topic) => <span className="rounded-full bg-gradient-to-r from-primary/25 to-accent/25 px-3 py-2 text-sm text-textPrimary" key={topic}>{topic}</span>)}</div>
    }
    return (
      <div className="flex min-h-96 flex-col rounded-lg border border-border bg-surface p-4">
        <div className="flex-1 space-y-3">
          {messages.map((message, index) => <div className={`rounded-lg p-3 text-sm ${message.role === 'user' ? 'ml-auto bg-primary text-white' : 'bg-background text-textSecondary'}`} key={index}>{message.text}</div>)}
        </div>
        <form className="mt-4 flex gap-2" onSubmit={(event) => { event.preventDefault(); if (question.trim()) askMutation.mutate(question) }}>
          <input className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-textPrimary outline-none focus:border-primary" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask about this meeting" />
          <button className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white" type="submit">Ask</button>
        </form>
      </div>
    )
  }, [actionItems, askMutation, messages, question, tab, transcript?.keyTopics, transcript?.summary, updateTask])

  if (meetingQuery.isLoading) {
    return <DashboardLayout title="Meeting"><SkeletonCard className="h-[70vh]" /></DashboardLayout>
  }

  if (!meeting) {
    return <DashboardLayout title="Meeting"><div className="rounded-lg border border-border bg-surface p-6 text-textSecondary">Meeting not found.</div></DashboardLayout>
  }

  if (meeting.status !== 'COMPLETED') {
    return (
      <DashboardLayout title={meeting.title}>
        <ProcessingStatus status={meeting.status} />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title={meeting.title}>
      <div className="grid gap-5 lg:grid-cols-[0.55fr_0.45fr]">
        <section>
          <h2 className="mb-4 font-heading text-xl font-semibold">Transcript</h2>
          <TranscriptViewer segments={transcript?.segments || []} currentTime={currentTime} onSeek={(time) => wave?.setTime(time)} />
        </section>
        <section>
          <div className="mb-4 flex gap-2 overflow-x-auto">
            {tabs.map((item) => <button className={`rounded-lg px-3 py-2 text-sm ${tab === item ? 'bg-primary text-white' : 'bg-surface text-textSecondary'}`} key={item} onClick={() => setTab(item)} type="button">{item}</button>)}
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              {activeContent}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
      {mediaUrl ? <MeetingPlayer url={mediaUrl} onTime={setCurrentTime} onWaveReady={setWave} /> : null}
    </DashboardLayout>
  )
}
