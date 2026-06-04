function StatusBadge({ children, tone = 'neutral' }) {
  return <span className={`status ${tone}`}>{children}</span>
}

export default StatusBadge
