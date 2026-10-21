import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';

const VARIANTS = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  ghost:     'btn-ghost',
  danger:    'btn-danger',
  icon:      'btn-icon',
};

const SIZES = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, children, className = '', disabled, ...props },
  ref
) {
  const base = variant === 'icon' ? VARIANTS.icon : VARIANTS[variant] || VARIANTS.primary;
  const sizeClass = SIZES[size] || '';

  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`${base} ${sizeClass} ${className}`}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  );
});

export default Button;
