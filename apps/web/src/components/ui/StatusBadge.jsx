// Shared status badge using design-system badge classes
const STATUS_MAP = {
  // Subscription / generic
  ACTIVE:         'badge-success',
  PAUSED:         'badge-info',
  CANCELED:       'badge-neutral',
  PAST_DUE:       'badge-warning',
  // Invoice
  PAID:           'badge-success',
  OPEN:           'badge-info',
  DRAFT:          'badge-neutral',
  VOID:           'badge-neutral',
  UNCOLLECTIBLE:  'badge-danger',
  // Payment
  SUCCEEDED:      'badge-success',
  FAILED:         'badge-danger',
  PENDING:        'badge-warning',
  REFUNDED:       'badge-neutral',
  PARTIALLY_REFUNDED: 'badge-warning',
  // API key
  REVOKED:        'badge-danger',
  // Delivery
  // Jobs
  RUNNING:        'badge-info',
  COMPLETED:      'badge-success',
  ERRORED:        'badge-danger',
  // Feature flags
  ENABLED:        'badge-success',
  DISABLED:       'badge-neutral',
};

const DOT_COLORS = {
  'badge-success': 'bg-success',
  'badge-warning': 'bg-warning',
  'badge-danger':  'bg-danger',
  'badge-info':    'bg-info',
  'badge-neutral': 'bg-muted',
};

export default function StatusBadge({ status, variant }) {
  const cls = variant || STATUS_MAP[status] || 'badge-neutral';
  const dotColor = DOT_COLORS[cls] || 'bg-muted';
  const label = status ? String(status).replace(/_/g, ' ') : '—';
  return (
    <span className={`badge ${cls}`}>
      <span className={`badge-dot ${dotColor}`} />
      {label}
    </span>
  );
}
