'use client';

import * as React from 'react';
import { cn } from '@/core/utils';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  error?: string;
  label?: string;
  inputSize?: 'default' | 'lg';
  description?: string;
  icon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, label, description, icon, inputSize = 'default', ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPasswordType = type === 'password';

    const sizeStyles = {
      default: 'h-11 px-5 py-3 text-sm',
      lg: 'h-14 px-6 py-4 text-base',
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="flex flex-col gap-1.5 w-full group">
        {label && (
          <label className="text-sm font-medium text-foreground/80 ml-1">
            {label}
          </label>
        )}
        {description && (
          <p className="text-xs text-muted ml-1 mb-1">{description}</p>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-accent-purple transition-colors pointer-events-none">
              {icon}
            </div>
          )}
          <input
            type={isPasswordType ? (showPassword ? 'text' : 'password') : type}
            className={cn(
              'block w-full rounded-full border border-white/10 bg-background',
              'text-foreground placeholder-muted',
              'transition-all duration-300',
              'focus:border-accent-purple focus:outline-none focus:ring-1 focus:ring-accent-purple/50 focus:shadow-glow-sm',
              'disabled:cursor-not-allowed disabled:opacity-50',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground',
              sizeStyles[inputSize],
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/50',
              isPasswordType && 'pr-12', // Add padding for the eye icon
              icon && 'pl-11', // Add padding if icon is present
              className
            )}
            ref={ref}
            {...props}
          />
          {isPasswordType && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          )}
        </div>
        {error && (
          <p className="mt-2 text-sm text-red-500 animate-fade-in">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
