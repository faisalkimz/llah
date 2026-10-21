import { SkeletonCard } from './Skeleton.jsx';

export default function StatCard({ label, value, sub, loading = false }) {
  if (loading) return <SkeletonCard />;
  return (
    <div className="card p-5">
      <div className="text-xs font-medium text-muted uppercase tracking-wide mb-2">{label}</div>
      <div className="text-2xl font-semibold text-ink tabular-nums">{value ?? '—'}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  );
}
