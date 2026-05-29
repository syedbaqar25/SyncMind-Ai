import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useWorkspaceStore = create(
  persist(
    (set) => ({
      workspaces: [],
      activeWorkspaceId: null,
      setWorkspaces: (workspaces) => set({ workspaces }),
      setActiveWorkspaceId: (activeWorkspaceId) => set({ activeWorkspaceId }),
    }),
    {
      name: 'syncmind-workspace',
      partialize: (state) => ({
        workspaces: state.workspaces,
        activeWorkspaceId: state.activeWorkspaceId,
      }),
    },
  ),
)
