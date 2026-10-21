export default function Card({ className = '', children, ...props }) {
  return (
    <div className={`card ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className = '', title, description, action, children }) {
  if (children) {
    return <div className={`card-header ${className}`}>{children}</div>;
  }
  return (
    <div className={`card-header flex items-center justify-between gap-4 ${className}`}>
      <div>
        {title && <h3 className="text-sm font-semibold text-ink">{title}</h3>}
        {description && <p className="text-xs text-muted mt-0.5">{description}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

export function CardBody({ className = '', children }) {
  return <div className={`card-body ${className}`}>{children}</div>;
}

export function CardFooter({ className = '', children }) {
  return <div className={`card-footer ${className}`}>{children}</div>;
}
