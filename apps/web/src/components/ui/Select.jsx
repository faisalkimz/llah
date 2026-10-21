import { forwardRef } from 'react';

const Select = forwardRef(function Select(
  { label, caption, error, children, className = '', ...props },
  ref
) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="label">
          {label}
          {caption && <span className="label-caption"> {caption}</span>}
        </label>
      )}
      <select
        ref={ref}
        className={`select ${error ? 'input-error' : ''} ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
});

export default Select;
