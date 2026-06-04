import { motion } from 'framer-motion'

function SectionCard({ children, className = '', icon: Icon, kicker, title, description }) {
  return (
    <motion.section
      className={`list-card section-card ${className}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      {(title || description || kicker) && (
        <div className="section-card-heading">
          <div className="section-title-row">
            {Icon && <span className="section-icon"><Icon /></span>}
            <div>
              {kicker && <p className="section-label">{kicker}</p>}
              {title && <h3>{title}</h3>}
              {description && <p>{description}</p>}
            </div>
          </div>
        </div>
      )}
      {children}
    </motion.section>
  )
}

export default SectionCard
