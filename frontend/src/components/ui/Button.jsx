import { motion } from 'framer-motion'

export function Button({ children, className = '', variant = 'primary', isLoading = false, ...props }) {
  const styles =
    variant === 'ghost'
      ? 'border border-primary/70 bg-transparent text-primary hover:bg-primary/10'
      : variant === 'light'
        ? 'bg-white text-slate-950 hover:bg-slate-100'
        : 'bg-primary text-white shadow-[0_0_0_rgba(99,102,241,0)] hover:bg-primary-hover hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]'

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${styles} disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" /> : null}
      {children}
    </motion.button>
  )
}
