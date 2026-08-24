import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightElement?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightElement, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label className="block text-xs font-medium text-[#8B93A1]">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-[#8B93A1]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            className={`w-full bg-[#11151B] border ${
              error ? 'border-red-500/50 focus:ring-red-500/30' : 'border-[#242A33] focus:border-indigo-500'
            } text-[#F5F7FA] placeholder-[#576071] text-sm rounded-lg px-3.5 py-2.5 outline-none transition focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:bg-[#0B0D10] ${
              leftIcon ? 'pl-9' : ''
            } ${rightElement ? 'pr-12' : ''} ${className}`}
            {...props}
          />
          {rightElement && (
            <div className="absolute right-3 flex items-center text-xs text-[#8B93A1]">
              {rightElement}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-red-400">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#576071]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label className="block text-xs font-medium text-[#8B93A1]">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          className={`w-full bg-[#11151B] border ${
            error ? 'border-red-500/50 focus:ring-red-500/30' : 'border-[#242A33] focus:border-indigo-500'
          } text-[#F5F7FA] placeholder-[#576071] text-sm rounded-lg px-3.5 py-2.5 outline-none transition focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 min-h-[80px] custom-scrollbar ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-xs text-red-400">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#576071]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options?: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, children, className = '', ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label className="block text-xs font-medium text-[#8B93A1]">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={`w-full bg-[#11151B] border ${
            error ? 'border-red-500/50' : 'border-[#242A33] focus:border-indigo-500'
          } text-[#F5F7FA] text-sm rounded-lg px-3.5 py-2.5 outline-none transition focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 cursor-pointer ${className}`}
          {...props}
        >
          {options
            ? options.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-[#151A21] text-[#F5F7FA]">
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        {error && <p className="text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
