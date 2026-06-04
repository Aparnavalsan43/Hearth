import { motion } from 'framer-motion'
import EmptyState from './EmptyState'

function ActivityFeed({ emptyIcon, items }) {
  if (items.length === 0) {
    return <EmptyState compact icon={emptyIcon}>Activity will appear as you use Hearth.</EmptyState>
  }

  return (
    <div className="activity-feed">
      {items.map((activity, index) => {
        const Icon = activity.icon

        return (
          <motion.article
            className="activity-row"
            key={`${activity.title}-${activity.detail}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <span>{Icon && <Icon />}</span>
            <div>
              <h4>{activity.title}</h4>
              <p>{activity.detail}</p>
              <small>{activity.time || 'Just now'}</small>
            </div>
          </motion.article>
        )
      })}
    </div>
  )
}

export default ActivityFeed
