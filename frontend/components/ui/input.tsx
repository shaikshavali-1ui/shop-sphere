import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  className = '',
  id,
  ...props
}) => {
  return (
    <div className="w-full flex flex-col gap-1.5 text-left mb-4">
      {label && (
        <label htmlFor={id} className="text-xs font-bold text-slate-600 tracking-wide uppercase">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full bg-white border border-slate-200 rounded-lg py-2.5 px-3 text-slate-800 text-sm outline-none transition-all duration-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 placeholder-slate-400 ${
          error ? 'border-rose-500/50 focus:border-rose-500' : ''
        } ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-rose-500 font-medium">
          {error}
        </span>
      )}
    </div>
  );
};
