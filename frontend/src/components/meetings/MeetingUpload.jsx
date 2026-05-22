import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { UploadCloud } from 'lucide-react'
import { Button } from '../ui/Button'
import { meetingService } from '../../services/meetingService'
import { formatFileSize } from '../../utils/formatters'

export default function MeetingUpload({ workspaceId, onUploaded }) {
  const [file, setFile] = useState(null)
  const [title, setTitle] = useState('')
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)

  const onDrop = useCallback((accepted) => {
    const nextFile = accepted[0]
    setFile(nextFile)
    setTitle(nextFile?.name?.replace(/\.[^.]+$/, '') || '')
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'audio/*': [], 'video/*': [] },
    maxSize: 500 * 1024 * 1024,
    multiple: false,
  })

  const upload = async () => {
    if (!workspaceId) {
      toast.error('Select a workspace first')
      return
    }
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('workspaceId', workspaceId)
    formData.append('title', title || file.name)

    setLoading(true)
    try {
      const response = await meetingService.upload(formData, (event) => {
        setProgress(Math.round((event.loaded / event.total) * 100))
      })
      toast.success('Meeting uploaded')
      setFile(null)
      setProgress(0)
      onUploaded?.(response.data)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <div
        {...getRootProps()}
        className={`grid min-h-44 cursor-pointer place-items-center rounded-lg border border-dashed p-6 text-center transition ${isDragActive ? 'scale-[1.01] border-primary bg-primary/5' : 'border-border bg-background'}`}
      >
        <input {...getInputProps()} />
        <div>
          <UploadCloud className="mx-auto text-primary" size={34} />
          <p className="mt-3 font-medium text-textPrimary">{isDragActive ? 'Drop to upload' : 'Upload a meeting'}</p>
          <p className="mt-1 text-sm text-textSecondary">Audio or video, up to 500MB</p>
        </div>
      </div>
      {file ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-lg border border-border bg-background p-4 text-sm text-textSecondary">
            <span className="text-textPrimary">{file.name}</span> / {formatFileSize(file.size)}
          </div>
          <input className="w-full rounded-lg border border-border bg-background px-4 py-3 text-textPrimary outline-none focus:border-primary" value={title} onChange={(e) => setTitle(e.target.value)} />
          {loading ? <div className="h-2 overflow-hidden rounded-full bg-surface2"><div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${progress}%` }} /></div> : null}
          <Button isLoading={loading} onClick={upload} type="button">Start Processing</Button>
        </div>
      ) : null}
    </section>
  )
}
