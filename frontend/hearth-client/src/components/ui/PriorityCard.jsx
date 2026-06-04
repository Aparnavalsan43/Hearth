import { motion } from 'framer-motion'

function PriorityCard({ isFeatured = false, item, onClick }) {
  const Icon = item.icon

  return (
    <motion.button
      className={isFeatured ? 'priority-row featured' : 'priority-row'}
      type="button"
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.005 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <i aria-hidden="true" />
      <span>{Icon && <Icon />}</span>
      <div>
        <div className="priority-title-row">
          <h4>{item.label}</h4>
          {item.badge && <b className={`priority-badge ${item.tone || 'primary'}`}>{item.badge}</b>}
        </div>
        <p>{item.meta}</p>
      </div>
      <small>{item.dueDate}</small>
    </motion.button>
  )
}

export default PriorityCard
