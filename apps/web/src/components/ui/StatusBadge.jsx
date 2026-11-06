const STATUS_MAP = {
  ACTIVE:         'badge-success',
  PAUSED:         'badge-info',
  CANCELED:       'badge-neutral',
  CANCELLED:      'badge-neutral',
  PAST_DUE:       'badge-warning',
  PAID:           'badge-success',
  OPEN:           'badge-info',
  DRAFT:          'badge-neutral',
  VOID:           'badge-neutral',
  UNCOLLECTIBLE:  'badge-danger',
  SUCCEEDED:      'badge-success',
  SUCCESSFUL:     'badge-success',
  FAILED:         'badge-danger',
  PENDING:        'badge-warning',
  PROCESSING:     'badge-info',
  REFUNDED:       'badge-neutral',
  PARTIALLY_REFUNDED: 'badge-warning',
  REVOKED:        'badge-danger',
  RUNNING:        'badge-info',
  COMPLETED:      'badge-success',
  ERRORED:        'badge-danger',
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

function humanize(status) {
  if (!status) return '—';
  return String(status)
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}

export default function StatusBadge({ status, variant }) {
  const cls = variant || STATUS_MAP[status] || 'badge-neutral';
  const dotColor = DOT_COLORS[cls] || 'bg-muted';
  return (
    <span className={`badge ${cls}`}>
      <span className={`badge-dot ${dotColor}`} />
      {humanize(status)}
    </span>
  );
}
