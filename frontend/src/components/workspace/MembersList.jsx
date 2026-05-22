import { Trash2 } from 'lucide-react'

export default function MembersList({ members = [], canManage, onRoleChange, onRemove }) {
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <table className="w-full text-left text-sm">
        <thead className="bg-background text-textSecondary">
          <tr>
            <th className="p-4">Member</th>
            <th className="p-4">Email</th>
            <th className="p-4">Role</th>
            <th className="p-4"></th>
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <tr className="border-t border-border" key={member.id}>
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/20">{(member.user?.name || 'U').slice(0, 1)}</div>
                  <span className="text-textPrimary">{member.user?.name}</span>
                </div>
              </td>
              <td className="p-4 text-textSecondary">{member.user?.email}</td>
              <td className="p-4">
                <select className="rounded-lg border border-border bg-background px-3 py-2 text-textPrimary" disabled={!canManage || member.role === 'OWNER'} value={member.role} onChange={(event) => onRoleChange?.(member.userId, event.target.value)}>
                  <option value="OWNER">OWNER</option>
                  <option value="ADMIN">ADMIN</option>
                  <option value="MEMBER">MEMBER</option>
                  <option value="VIEWER">VIEWER</option>
                </select>
              </td>
              <td className="p-4 text-right">
                <button className="text-textSecondary hover:text-error disabled:opacity-40" disabled={!canManage || member.role === 'OWNER'} onClick={() => onRemove?.(member.userId)} type="button"><Trash2 size={18} /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
