const VARIANT_CLASSES = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger:  'badge-danger',
  info:    'badge-info',
  neutral: 'badge-neutral',
};

export default function Badge({ variant = 'neutral', dot = false, children, className = '' }) {
  return (
    <span className={`badge ${VARIANT_CLASSES[variant] || VARIANT_CLASSES.neutral} ${className}`}>
      {dot && <span className="badge-dot bg-current" />}
      {children}
    </span>
  );
}
