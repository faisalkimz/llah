import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

export default function Drawer({ open, onClose, title, description, children, className = '' }) {
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') onClose?.();
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  return (
    <>
      <div className="overlay-backdrop" onClick={onClose} />
      <aside className={`drawer-right ${className}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-line">
          <div>
            {title && <h2 className="text-section">{title}</h2>}
            {description && <p className="text-sm text-muted mt-1">{description}</p>}
          </div>
          {onClose && (
            <button onClick={onClose} className="btn-icon btn-sm -mt-1 -mr-1" aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="p-5 overflow-y-auto flex-1" style={{ maxHeight: 'calc(100vh - 73px)' }}>
          {children}
        </div>
      </aside>
    </>
  );
}
