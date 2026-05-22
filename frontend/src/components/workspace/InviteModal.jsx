import { useState } from 'react'
import ConfirmModal from '../shared/ConfirmModal'

export default function InviteModal({ open, onClose, onInvite }) {
  const [email, setEmail] = useState('')

  return (
    <ConfirmModal
      open={open}
      title="Invite member"
      description={<input className="mt-4 w-full rounded-lg border border-border bg-background px-3 py-2 text-textPrimary" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="teammate@example.com" />}
      confirmLabel="Send Invite"
      onClose={onClose}
      onConfirm={() => onInvite?.(email)}
    />
  )
}
