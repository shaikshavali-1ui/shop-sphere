import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { label: string; value: string }[];
  error?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  className = '',
  id,
  ...props
}) => {
  const isCentered = className.includes('text-center');
  
  return (
    <div className={`w-full flex flex-col gap-1.5 mb-4 ${isCentered ? 'text-center items-center' : 'text-left'}`}>
      {label && (
        <label htmlFor={id} className="text-xs font-semibold text-slate-300 tracking-wide uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          className={`w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-3 text-slate-100 text-sm outline-none transition-all duration-200 focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/30 appearance-none ${
            error ? 'border-rose-500/50' : ''
          } ${className}`}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-slate-950 text-slate-200">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
          </svg>
        </div>
      </div>
      {error && (
        <span className="text-xs text-rose-500 font-medium">
          {error}
        </span>
      )}
    </div>
  );
};
