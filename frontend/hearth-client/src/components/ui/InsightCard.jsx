import { motion } from 'framer-motion'

function InsightCard({ description, icon: Icon, label, value }) {
  const progress = Number.parseInt(value, 10) || 0

  return (
    <motion.article
      className="insight-card"
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
    >
      <span>{Icon && <Icon />}</span>
      <div>
        <p>{label}</p>
        <strong>{value}</strong>
        <small>{description}</small>
        <div className="insight-progress" aria-hidden="true">
          <i style={{ width: `${progress}%` }} />
        </div>
      </div>
    </motion.article>
  )
}

export default InsightCard
