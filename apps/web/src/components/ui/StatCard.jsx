import { SkeletonCard } from './Skeleton.jsx';

export default function StatCard({ label, value, sub, loading = false }) {
  if (loading) return <SkeletonCard />;
  return (
    <div className="border border-line bg-surface px-5 py-4 rounded-lg">
      <div className="text-[13px] text-muted mb-1">{label}</div>
      <div className="text-[22px] font-semibold text-ink tracking-tight tabular-nums">{value ?? '—'}</div>
      {sub && <div className="text-xs text-muted mt-1">{sub}</div>}
    </div>
  );
}
