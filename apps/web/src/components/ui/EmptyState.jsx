import Button from './Button.jsx';

export default function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className = '',
}) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}>
      {Icon && (
        <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-canvas-subtle mb-4">
          <Icon className="h-6 w-6 text-muted" />
        </div>
      )}
      {title && <h3 className="text-sm font-semibold text-ink mb-1">{title}</h3>}
      {description && <p className="text-sm text-muted max-w-sm">{description}</p>}
      {action && (
        <div className="mt-4">
          {typeof action === 'object' && action.label ? (
            <Button variant="primary" size="sm" onClick={action.onClick}>
              {action.label}
            </Button>
          ) : (
            action
          )}
        </div>
      )}
    </div>
  );
}
