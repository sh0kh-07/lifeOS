import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-xl border border-dashed border-[#242A33] bg-[#11151B]/40 ${className}`}
    >
      <div className="p-3.5 rounded-2xl bg-[#151A21] border border-[#242A33] text-[#8B93A1] mb-4">
        <Icon size={28} className="text-indigo-400" />
      </div>
      <h3 className="text-base font-semibold text-[#F5F7FA] mb-1.5">{title}</h3>
      <p className="text-sm text-[#8B93A1] max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} size="sm" variant="primary">
          {actionText}
        </Button>
      )}
    </div>
  );
};
