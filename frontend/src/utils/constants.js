export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

export const MEETING_STATUSES = [
  'PENDING',
  'UPLOADING',
  'PROCESSING',
  'TRANSCRIBING',
  'ANALYZING',
  'COMPLETED',
  'FAILED',
]

export const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'DONE', 'CANCELLED']
export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT']
