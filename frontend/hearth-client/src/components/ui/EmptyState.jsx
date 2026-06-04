function EmptyState({ children, compact = false, icon: Icon }) {
  return (
    <div className={compact ? 'empty-state compact' : 'empty-state'}>
      {Icon && <span className="empty-icon"><Icon /></span>}
      <p>{children}</p>
    </div>
  )
}

export default EmptyState
