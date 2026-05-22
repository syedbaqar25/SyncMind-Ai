import { create } from 'zustand'

export const useMeetingStore = create((set) => ({
  meetings: [],
  activeMeeting: null,
  processing: {},
  setMeetings: (meetings) => set({ meetings }),
  setActiveMeeting: (activeMeeting) => set({ activeMeeting }),
  setProcessingStatus: (meetingId, status) =>
    set((state) => ({ processing: { ...state.processing, [meetingId]: status } })),
}))
