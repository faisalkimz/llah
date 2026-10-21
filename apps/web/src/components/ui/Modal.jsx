import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';

export default function Modal({ open, onClose, title, description, children, size = 'md', className = '' }) {
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

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={title}>
      <div className="overlay-backdrop" onClick={onClose} />
      <div className={`modal-content ${sizes[size] || sizes.md} ${className}`} style={{ position: 'relative', zIndex: 1 }}>
        {(title || onClose) && (
          <div className="flex items-start justify-between px-5 pt-5 pb-0">
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
        )}
        <div className="p-5">
          {children}
        </div>
      </div>
    </div>
  );
}

export function ModalFooter({ children, className = '' }) {
  return (
    <div className={`flex items-center justify-end gap-2 pt-4 border-t border-line -mx-5 px-5 -mb-5 pb-5 mt-4 ${className}`}>
      {children}
    </div>
  );
}
