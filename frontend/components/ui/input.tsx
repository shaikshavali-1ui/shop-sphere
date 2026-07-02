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
        <label htmlFor={id} className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-3 text-slate-100 text-sm outline-none transition-all duration-200 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 placeholder-slate-500 ${
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
