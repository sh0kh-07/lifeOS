import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  hoverEffect?: boolean;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  hoverEffect = false,
  noPadding = false,
  ...props
}) => {
  const hasPaddingClass = /\b(p|px|py|pt|pb|pl|pr)-\d+/.test(className) || noPadding;
  const paddingClass = hasPaddingClass ? '' : 'p-4 sm:p-5';

  return (
    <div
      className={`bg-[#11151B] border border-[#242A33] rounded-xl overflow-hidden transition-all ${paddingClass} ${
        hoverEffect ? 'hover:border-[#353D4A] hover:bg-[#141920]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, action, className = '' }) => {
  return (
    <div className={`p-4 border-b border-[#242A33] flex items-center justify-between gap-3 ${className}`}>
      <div>
        <h3 className="text-sm sm:text-base font-semibold text-[#F5F7FA] leading-tight">{title}</h3>
        {subtitle && <p className="text-xs text-[#8B93A1] mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};

export const CardContent: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return <div className={`p-4 sm:p-5 ${className}`}>{children}</div>;
};

interface ProgressBarProps {
  value: number; // 0 to 100
  color?: 'primary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  color = 'primary',
  size = 'md',
  showLabel = false,
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, Math.round(value)));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  };

  const colorClasses = {
    primary: 'bg-[#6366F1]',
    success: 'bg-[#22C55E]',
    warning: 'bg-[#F59E0B]',
    danger: 'bg-[#EF4444]',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-[#8B93A1] mb-1.5 font-medium">
          <span>Прогресс</span>
          <span className="text-[#F5F7FA] font-semibold">{clamped}%</span>
        </div>
      )}
      <div className={`w-full bg-[#242A33] rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorClasses[color]}`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  colorScheme?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subValue,
  icon,
  trend,
  colorScheme = 'default',
  onClick,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-[#151A21] border border-[#242A33] rounded-xl p-4 flex flex-col justify-between transition-all select-none ${
        onClick ? 'cursor-pointer hover:border-[#353D4A] hover:bg-[#181E27] active:scale-[0.99]' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="text-[#8B93A1] text-xs font-medium">{label}</span>
        {icon && (
          <div className="text-[#8B93A1]">
            {icon}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-[#F5F7FA] tracking-tight">{value}</span>
          {trend && (
            <span
              className={`text-xs font-semibold ${
                trend.isPositive ? 'text-[#22C55E]' : 'text-[#EF4444]'
              }`}
            >
              {trend.value}
            </span>
          )}
        </div>

        {subValue && !trend && (
          <div className="text-xs text-[#8B93A1] mt-1 truncate">
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
};
