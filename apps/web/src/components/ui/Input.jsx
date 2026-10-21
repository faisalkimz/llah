import { forwardRef } from 'react';

const Input = forwardRef(function Input(
  { label, caption, error, className = '', ...props },
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
      <input
        ref={ref}
        className={`input ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-danger mt-1">{error}</p>}
    </div>
  );
});

export default Input;
