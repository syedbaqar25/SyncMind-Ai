import { useEffect, useMemo } from 'react'
import { io } from 'socket.io-client'
import { SOCKET_URL } from '../utils/constants'
import { useAuthStore } from '../store/authStore'
import { useMeetingStore } from '../store/meetingStore'

export const useSocket = () => {
  const accessToken = useAuthStore((state) => state.accessToken)
  const setProcessingStatus = useMeetingStore((state) => state.setProcessingStatus)

  const socket = useMemo(() => {
    if (!accessToken) return null
    return io(SOCKET_URL, {
      auth: { token: accessToken },
      autoConnect: false,
    })
  }, [accessToken])

  useEffect(() => {
    if (!socket) return undefined

    socket.connect()
    socket.on('meeting:processing', ({ meetingId, status }) => setProcessingStatus(meetingId, status))
    socket.on('meeting:completed', ({ meetingId }) => setProcessingStatus(meetingId, 'COMPLETED'))
    socket.on('meeting:failed', ({ meetingId }) => setProcessingStatus(meetingId, 'FAILED'))

    return () => {
      socket.disconnect()
    }
  }, [setProcessingStatus, socket])

  return socket
}
