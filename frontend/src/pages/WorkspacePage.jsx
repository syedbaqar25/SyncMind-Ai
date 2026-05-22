import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import DashboardLayout from '../components/layout/DashboardLayout'
import { Button } from '../components/ui/Button'
import ConfirmModal from '../components/shared/ConfirmModal'
import InviteModal from '../components/workspace/InviteModal'
import MembersList from '../components/workspace/MembersList'
import WorkspaceSettings from '../components/workspace/WorkspaceSettings'
import { workspaceService } from '../services/workspaceService'
import { useWorkspaceStore } from '../store/workspaceStore'

export default function WorkspacePage() {
  const workspaceId = useWorkspaceStore((state) => state.activeWorkspaceId)
  const queryClient = useQueryClient()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const workspaceQuery = useQuery({ queryKey: ['workspace', workspaceId], queryFn: () => workspaceService.get(workspaceId), enabled: Boolean(workspaceId) })
  const workspace = workspaceQuery.data?.data
  const canManage = workspace?.members?.some((member) => member.userId && ['OWNER', 'ADMIN'].includes(member.role))
  const update = useMutation({ mutationFn: (payload) => workspaceService.update(workspaceId, payload), onSuccess: () => queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] }) })

  return (
    <DashboardLayout title="Workspace">
      <div className="space-y-5">
        <WorkspaceSettings workspace={workspace} onSave={(payload) => update.mutate(payload)} />
        <div className="flex justify-end"><Button type="button" onClick={() => setInviteOpen(true)}>Send Invite</Button></div>
        <MembersList members={workspace?.members || []} canManage={canManage} onRoleChange={(uid, role) => workspaceService.updateMember(workspaceId, uid, role).then(() => queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] }))} onRemove={(uid) => workspaceService.removeMember(workspaceId, uid).then(() => queryClient.invalidateQueries({ queryKey: ['workspace', workspaceId] }))} />
        <section className="rounded-lg border border-error/50 bg-error/5 p-5">
          <h2 className="font-heading text-xl font-semibold text-error">Danger Zone</h2>
          <Button className="mt-4" type="button" onClick={() => setDeleteOpen(true)}>Delete Workspace</Button>
        </section>
      </div>
      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} onInvite={(email) => workspaceService.invite(workspaceId, email).then(() => { toast.success('Invite sent'); setInviteOpen(false) })} />
      <ConfirmModal open={deleteOpen} title="Delete workspace" description={`Type ${workspace?.name || 'workspace'} in the next confirmation step before deleting from the API.`} confirmLabel="Delete" onClose={() => setDeleteOpen(false)} onConfirm={() => workspaceService.remove(workspaceId, workspace?.name).then(() => toast.success('Workspace deleted'))} />
    </DashboardLayout>
  )
}
