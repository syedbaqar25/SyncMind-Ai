import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from '../ui/Button'

export default function ConfirmModal({ open, title, description, confirmLabel = 'Confirm', onConfirm, onClose, variant = 'primary' }) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-md rounded-lg border border-border bg-surface p-4 shadow-2xl sm:p-6"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-heading text-xl font-semibold text-textPrimary">{title}</h2>
                <div className="mt-2 text-sm text-textSecondary">{description}</div>
              </div>
              <button className="rounded-md p-1 text-textSecondary hover:bg-surface2" onClick={onClose} type="button">
                <X size={18} />
              </button>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
              <Button type="button" className={variant === 'danger' ? 'bg-error hover:bg-error' : ''} onClick={onConfirm}>{confirmLabel}</Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
