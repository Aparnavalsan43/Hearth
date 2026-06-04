import { motion } from 'framer-motion'

function StatCard({ accent = 'var(--brand)', chartValue = 64, className = '', description, icon: Icon, label, trend, value }) {
  return (
    <motion.article
      className={`summary-card premium-stat ${className}`.trim()}
      style={{ '--card-accent': accent }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div className="stat-icon">{Icon && <Icon />}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      {description && <p>{description}</p>}
      <div className="mini-chart" aria-hidden="true">
        <i style={{ height: `${Math.max(18, chartValue)}%` }} />
        <i style={{ height: `${Math.max(28, chartValue - 10)}%` }} />
        <i style={{ height: `${Math.max(36, chartValue + 8)}%` }} />
        <i style={{ height: `${Math.max(24, chartValue - 4)}%` }} />
      </div>
      {trend && <small>{trend}</small>}
    </motion.article>
  )
}

export default StatCard
