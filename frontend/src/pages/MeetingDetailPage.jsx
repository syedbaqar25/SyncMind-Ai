import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import DashboardLayout from '../components/layout/DashboardLayout'
import ActionItemsList from '../components/meetings/ActionItemsList'
import MeetingPlayer from '../components/meetings/MeetingPlayer'
import MeetingSummary from '../components/meetings/MeetingSummary'
import TranscriptViewer from '../components/meetings/TranscriptViewer'
import ProcessingStatus from '../components/shared/ProcessingStatus'
import SkeletonCard from '../components/shared/SkeletonCard'
import ConfirmModal from '../components/shared/ConfirmModal'
import { Button } from '../components/ui/Button'
import { meetingService } from '../services/meetingService'
import { taskService } from '../services/taskService'

const tabs = ['Summary', 'Action Items', 'Key Topics', 'Q&A']

export default function MeetingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [tab, setTab] = useState('Summary')
  const [currentTime, setCurrentTime] = useState(0)
  const [wave, setWave] = useState(null)
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [deleteOpen, setDeleteOpen] = useState(false)

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
  const deleteMeeting = useMutation({
    mutationFn: () => meetingService.remove(id),
    onSuccess: () => {
      toast.success('Meeting deleted')
      navigate('/meetings', { replace: true })
    },
  })
  const retryMeeting = useMutation({
    mutationFn: () => meetingService.process(id),
    onSuccess: () => {
      toast.success('Meeting requeued')
      queryClient.invalidateQueries({ queryKey: ['meeting', id] })
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

  if (meeting.status === 'FAILED') {
    return (
      <DashboardLayout title={meeting.title}>
        <div className="rounded-lg border border-error/40 bg-error/5 p-6">
          <h2 className="font-heading text-2xl font-semibold text-error">Processing failed</h2>
          <p className="mt-3 text-sm text-textSecondary">{meeting.processingError || 'The meeting could not be processed.'}</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button type="button" onClick={() => retryMeeting.mutate()} isLoading={retryMeeting.isPending}>Retry Processing</Button>
            <Button type="button" className="bg-error hover:bg-error" onClick={() => setDeleteOpen(true)}>Delete Meeting</Button>
          </div>
        </div>
        <ConfirmModal
          open={deleteOpen}
          title="Delete meeting"
          description="This will permanently delete the meeting and all its data."
          confirmLabel="Delete"
          variant="danger"
          onClose={() => setDeleteOpen(false)}
          onConfirm={() => deleteMeeting.mutate()}
        />
      </DashboardLayout>
    )
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
      <div className="mb-4 flex justify-end">
        <Button type="button" className="bg-error hover:bg-error" onClick={() => setDeleteOpen(true)}>Delete</Button>
      </div>
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
      <ConfirmModal
        open={deleteOpen}
        title="Delete meeting"
        description="This will permanently delete the meeting and all its data."
        confirmLabel="Delete"
        variant="danger"
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMeeting.mutate()}
      />
    </DashboardLayout>
  )
}
