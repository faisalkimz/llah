export function formatMoney(minor, currency = 'USD') {
  const n = typeof minor === 'bigint' ? Number(minor) : Number(minor);
  if (!Number.isFinite(n)) return '—';
  try {
    return (n / 100).toLocaleString('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    });
  } catch {
    return (n / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' });
  }
}

export function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateTime(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatId(id, len = 12) {
  if (!id) return '—';
  return id.length > len ? `${id.slice(0, len)}…` : id;
}

export function titleCaseStatus(status) {
  if (!status) return '—';
  return String(status)
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase());
}
