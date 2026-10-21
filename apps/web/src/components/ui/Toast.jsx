import { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
  success: CheckCircle2,
  warning: AlertTriangle,
  error:   AlertCircle,
  info:    Info,
};

const ICON_COLORS = {
  success: 'text-success',
  warning: 'text-warning',
  error:   'text-danger',
  info:    'text-info',
};

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback(({ title, description, variant = 'info', duration = 4000 }) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, title, description, variant }]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((titleOrOptions, description) => {
    if (typeof titleOrOptions === 'string') {
      return addToast({ title: titleOrOptions, description });
    }
    return addToast(titleOrOptions);
  }, [addToast]);

  toast.success = (title, description) => addToast({ title, description, variant: 'success' });
  toast.error   = (title, description) => addToast({ title, description, variant: 'error' });
  toast.warning = (title, description) => addToast({ title, description, variant: 'warning' });
  toast.info    = (title, description) => addToast({ title, description, variant: 'info' });

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Toast container */}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2"
        role="region"
        aria-label="Notifications"
      >
        {toasts.map(t => {
          const Icon = ICONS[t.variant] || ICONS.info;
          return (
            <div key={t.id} className="toast">
              <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${ICON_COLORS[t.variant]}`} />
              <div className="flex-1 min-w-0">
                {t.title && <p className="text-sm font-medium text-ink">{t.title}</p>}
                {t.description && <p className="text-xs text-muted mt-0.5">{t.description}</p>}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="btn-icon btn-sm flex-shrink-0 -mt-1 -mr-1"
                aria-label="Dismiss"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
