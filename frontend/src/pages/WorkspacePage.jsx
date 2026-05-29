import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Button } from '../components/ui/Button'
import ConfirmModal from '../components/shared/ConfirmModal'
import InviteModal from '../components/workspace/InviteModal'
import MembersList from '../components/workspace/MembersList'
import { workspaceService } from '../services/workspaceService'
import { useWorkspaceStore } from '../store/workspaceStore'

export default function WorkspacePage() {
  const { activeWorkspaceId, setActiveWorkspaceId, setWorkspaces } = useWorkspaceStore()
  const queryClient = useQueryClient()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [logoInput, setLogoInput] = useState('')

  const workspaceQuery = useQuery({
    queryKey: ['workspace', activeWorkspaceId],
    queryFn: () => workspaceService.get(activeWorkspaceId),
    enabled: Boolean(activeWorkspaceId),
    onSuccess: (data) => {
      setNameInput(data?.data?.name || '')
      setLogoInput(data?.data?.logo || '')
    }
  })

  const workspace = workspaceQuery.data?.data
  const canManage = workspace?.members?.some((m) => ['OWNER', 'ADMIN'].includes(m.role))

  const update = useMutation({
    mutationFn: (payload) => workspaceService.update(activeWorkspaceId, payload),
    onSuccess: () => {
      toast.success('Workspace updated')
      queryClient.invalidateQueries({ queryKey: ['workspace', activeWorkspaceId] })
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
    },
    onError: () => toast.error('Failed to update workspace')
  })

  const handleSave = () => {
    if (!nameInput.trim()) return toast.error('Workspace name is required')
    update.mutate({ name: nameInput.trim(), logo: logoInput || undefined })
  }

  return (
    <DashboardLayout title="Workspace">
      <div className="space-y-5">

        {/* Workspace Info */}
        <section className="rounded-lg border border-border bg-surface p-5 space-y-4">
          <h2 className="font-heading text-xl font-semibold text-textPrimary">Workspace Info</h2>
          {workspaceQuery.isLoading ? (
            <div className="h-10 w-full animate-pulse rounded-lg bg-surface2" />
          ) : (
            <div className="flex gap-3">
              <input
                className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-textPrimary outline-none transition focus:border-primary"
                placeholder="Workspace name"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
              />
              <input
                className="flex-1 rounded-lg border border-border bg-background px-4 py-3 text-textPrimary outline-none transition focus:border-primary"
                placeholder="Logo URL (optional)"
                value={logoInput}
                onChange={(e) => setLogoInput(e.target.value)}
              />
              <Button onClick={handleSave} isLoading={update.isPending}>Save</Button>
            </div>
          )}
          {workspace && (
            <p className="text-sm text-textSecondary">
              Workspace ID: <span className="font-mono text-xs text-primary">{workspace.id}</span>
            </p>
          )}
        </section>

        {/* Members */}
        <section className="rounded-lg border border-border bg-surface p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-xl font-semibold text-textPrimary">Members</h2>
            <Button onClick={() => setInviteOpen(true)}>Send Invite</Button>
          </div>
          <MembersList
            members={workspace?.members || []}
            canManage={canManage}
            onRoleChange={(uid, role) =>
              workspaceService.updateMember(activeWorkspaceId, uid, role)
                .then(() => queryClient.invalidateQueries({ queryKey: ['workspace', activeWorkspaceId] }))
            }
            onRemove={(uid) =>
              workspaceService.removeMember(activeWorkspaceId, uid)
                .then(() => queryClient.invalidateQueries({ queryKey: ['workspace', activeWorkspaceId] }))
            }
          />
        </section>

        {/* Danger Zone */}
        <section className="rounded-lg border border-error/50 bg-error/5 p-5">
          <h2 className="font-heading text-xl font-semibold text-error">Danger Zone</h2>
          <p className="mt-1 text-sm text-textSecondary">Permanently delete this workspace and all its data.</p>
          <Button className="mt-4" type="button" onClick={() => setDeleteOpen(true)}>
            Delete Workspace
          </Button>
        </section>
      </div>

      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onInvite={(email) =>
          workspaceService.invite(activeWorkspaceId, email).then(() => {
            toast.success('Invite sent')
            setInviteOpen(false)
          })
        }
      />

      <ConfirmModal
        open={deleteOpen}
        title="Delete workspace"
        description={`This will permanently delete "${workspace?.name || 'this workspace'}" and all meetings, tasks, and data inside it.`}
        confirmLabel="Delete"
        onClose={() => setDeleteOpen(false)}
        onConfirm={() =>
          workspaceService.remove(activeWorkspaceId, workspace?.name).then(() => {
            toast.success('Workspace deleted')
            setActiveWorkspaceId(null)
            setWorkspaces([])
            setDeleteOpen(false)
            queryClient.invalidateQueries({ queryKey: ['workspaces'] })
          })
        }
      />
    </DashboardLayout>
  )
}
