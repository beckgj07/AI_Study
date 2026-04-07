'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: 'raised' | 'inset' | 'flat';
  onClick?: () => void;
}

export function ClayCard({ children, className = '', variant = 'raised', onClick }: CardProps) {
  const baseClasses = 'transition-all duration-200';
  const variantClasses = {
    raised: 'bg-white rounded-[32px] shadow-[8px_8px_16px_rgba(0,0,0,0.1),-8px_-8px_16px_rgba(255,255,255,0.8)] p-6 hover:-translate-y-0.5',
    inset: 'bg-white rounded-[20px] shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.8)] p-6',
    flat: 'bg-white rounded-[20px] p-6 border border-gray-100',
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

export function ClayButton({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  onClick,
  type = 'button',
}: ButtonProps) {
  const baseClasses =
    'font-semibold rounded-[20px] border-none cursor-pointer transition-all duration-200 inline-flex items-center justify-center gap-2';

  const variantClasses = {
    primary:
      'bg-gradient-to-b from-[#3B82F6] to-[#2563EB] text-white shadow-[4px_4px_8px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 hover:shadow-[6px_6px_12px_rgba(37,99,235,0.3)] active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.1)]',
    secondary:
      'bg-white text-gray-800 shadow-[4px_4px_8px_rgba(0,0,0,0.08),-4px_-4px_8px_rgba(255,255,255,0.7)] hover:bg-gray-50 active:shadow-[inset_2px_2px_4px_rgba(0,0,0,0.08)]',
    ghost: 'bg-transparent text-gray-600 hover:bg-gray-100',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      } ${className}`}
      disabled={disabled}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

interface InputProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  type?: string;
  disabled?: boolean;
}

export function ClayInput({
  placeholder,
  value,
  onChange,
  className = '',
  type = 'text',
  disabled = false,
}: InputProps) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={`w-full bg-white rounded-xl shadow-[inset_2px_2px_4px_rgba(0,0,0,0.08),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] px-4 py-3 text-base outline-none border-2 border-transparent focus:border-blue-400 transition-colors placeholder:text-gray-400 ${className}`}
    />
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: 'primary' | 'success' | 'error' | 'accent' | 'muted';
  className?: string;
}

export function Badge({ children, variant = 'primary', className = '' }: BadgeProps) {
  const variantClasses = {
    primary: 'bg-blue-100 text-blue-600',
    success: 'bg-green-100 text-green-600',
    error: 'bg-red-100 text-red-600',
    accent: 'bg-orange-100 text-orange-600',
    muted: 'bg-gray-100 text-gray-600',
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, max = 100, className = '', showLabel = false }: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>进度</span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="bg-white rounded-full shadow-[inset_2px_2px_4px_rgba(0,0,0,0.08),inset_-2px_-2px_4px_rgba(255,255,255,0.7)] h-2 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ name, size = 'md', className = '' }: AvatarProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
  };

  const initial = name.charAt(0);

  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-b from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-md ${className}`}
    >
      {initial}
    </div>
  );
}
