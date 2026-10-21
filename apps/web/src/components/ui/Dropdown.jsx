import { useState, useRef, useEffect } from 'react';

export default function Dropdown({ trigger, align = 'left', children, className = '' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <div onClick={() => setOpen(v => !v)}>{trigger}</div>
      {open && (
        <div
          className={`dropdown ${align === 'right' ? 'right-0' : 'left-0'} mt-1 ${className}`}
          onClick={() => setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ icon: Icon, children, danger = false, ...props }) {
  return (
    <button
      className={`dropdown-item ${danger ? 'text-danger hover:bg-danger-muted' : ''}`}
      {...props}
    >
      {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="dropdown-separator" />;
}
