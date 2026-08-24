import React from 'react';
import { Priority, TaskStatus } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
  };

  const variantClasses = {
    default: 'bg-[#1C232D] text-[#8B93A1] border border-[#242A33]',
    primary: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20',
    success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    danger: 'bg-red-500/10 text-red-400 border border-red-500/20',
    info: 'bg-sky-500/10 text-sky-400 border border-sky-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium rounded-md whitespace-nowrap ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  switch (priority) {
    case 'urgent':
      return <Badge variant="danger">⚡ Срочно</Badge>;
    case 'high':
      return <Badge variant="warning">Высокий</Badge>;
    case 'medium':
      return <Badge variant="primary">Средний</Badge>;
    case 'low':
      return <Badge variant="default">Низкий</Badge>;
    default:
      return <Badge>{priority}</Badge>;
  }
};

export const StatusBadge: React.FC<{ status: TaskStatus }> = ({ status }) => {
  switch (status) {
    case 'inbox':
      return <Badge variant="default">Входящие</Badge>;
    case 'planned':
      return <Badge variant="info">Запланировано</Badge>;
    case 'in_progress':
      return <Badge variant="primary">В работе</Badge>;
    case 'waiting':
      return <Badge variant="warning">Ожидание</Badge>;
    case 'completed':
      return <Badge variant="success">Выполнено</Badge>;
    case 'cancelled':
      return <Badge variant="danger">Отменено</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
};
