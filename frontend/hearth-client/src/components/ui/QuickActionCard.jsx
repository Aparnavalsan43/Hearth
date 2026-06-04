import { motion } from 'framer-motion'

function QuickActionCard({ accent = 'var(--brand)', icon: Icon, label, onClick }) {
  return (
    <motion.button
      className="quick-action-card"
      style={{ '--action-accent': accent }}
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <span>{Icon && <Icon />}</span>
      <strong>{label}</strong>
    </motion.button>
  )
}

export default QuickActionCard
