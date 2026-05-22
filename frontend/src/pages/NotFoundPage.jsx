import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'

export default function NotFoundPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-background p-6 text-center text-textPrimary">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
        <p className="font-mono text-primary">404</p>
        <h1 className="mt-3 font-heading text-5xl font-bold">Page not found</h1>
        <p className="mx-auto mt-4 max-w-md text-textSecondary">The page you are looking for is not part of this workspace.</p>
        <Link className="mt-8 inline-block" to="/"><Button>Back Home</Button></Link>
      </motion.div>
    </main>
  )
}
