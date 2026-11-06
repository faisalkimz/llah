import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function PageHeader({ title, description, action, breadcrumbs, className = '' }) {
  return (
    <div className={`mb-6 ${className}`}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-2">
          <ol className="flex items-center gap-1 text-[13px]">
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <li key={i} className="flex items-center gap-1 min-w-0">
                  {i > 0 && <ChevronRight className="h-3 w-3 text-muted flex-shrink-0" />}
                  {isLast || !crumb.to ? (
                    <span className={`truncate ${isLast ? 'text-ink' : 'text-muted'}`}>{crumb.label}</span>
                  ) : (
                    <Link to={crumb.to} className="text-muted hover:text-ink transition-colors truncate">{crumb.label}</Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-page-title text-ink">{title}</h1>
          {description && <p className="text-sm text-muted mt-1 max-w-2xl">{description}</p>}
        </div>
        {action && <div className="flex-shrink-0 flex items-center gap-2">{action}</div>}
      </div>
    </div>
  );
}
