import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className = '',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-[#6366F1]/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-xs sm:text-sm gap-2',
    lg: 'px-5 py-2.5 text-sm gap-2.5',
    icon: 'p-2 text-xs h-8 w-8',
  };

  const variantClasses = {
    primary: 'bg-[#6366F1] hover:bg-indigo-500 text-white shadow-md shadow-[#6366F1]/20 active:bg-indigo-700',
    secondary: 'bg-[#151A21] hover:bg-[#1C232D] text-[#F5F7FA] border border-[#242A33] active:bg-[#11151B]',
    outline: 'bg-transparent hover:bg-[#151A21] text-[#F5F7FA] border border-[#242A33] active:bg-[#11151B]',
    ghost: 'bg-transparent hover:bg-[#151A21] text-[#8B93A1] hover:text-[#F5F7FA] active:bg-[#11151B]',
    danger: 'bg-[#EF4444]/15 hover:bg-[#EF4444]/25 text-[#EF4444] border border-[#EF4444]/25 active:bg-[#EF4444]/35',
    success: 'bg-[#22C55E]/15 hover:bg-[#22C55E]/25 text-[#22C55E] border border-[#22C55E]/25 active:bg-[#22C55E]/35',
  };

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </button>
  );
};
