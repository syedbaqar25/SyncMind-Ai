import { useState } from 'react'
import { Button } from '../ui/Button'

export default function WorkspaceSettings({ workspace, onSave }) {
  const [name, setName] = useState(workspace?.name || '')
  const [logo, setLogo] = useState(workspace?.logo || '')

  return (
    <section className="rounded-lg border border-border bg-surface p-5">
      <h2 className="font-heading text-xl font-semibold">Workspace info</h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <input className="rounded-lg border border-border bg-background px-3 py-2 text-textPrimary" value={name} onChange={(event) => setName(event.target.value)} placeholder="Workspace name" />
        <input className="rounded-lg border border-border bg-background px-3 py-2 text-textPrimary" value={logo} onChange={(event) => setLogo(event.target.value)} placeholder="Logo URL" />
      </div>
      <Button className="mt-4" type="button" onClick={() => onSave?.({ name, logo })}>Save</Button>
    </section>
  )
}
