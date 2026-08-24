import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Sidebar: React.FC = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { getTodayTasks, getOverdueTasks, debts, settings } = useApp();

  const todayCount = getTodayTasks().filter((t) => t.status !== 'completed').length;
  const overdueCount = getOverdueTasks().length;
  const activeDebtsCount = debts.filter((d) => d.status !== 'paid').length;

  const intelligenceGroup = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    {
      to: '/today',
      label: 'Сегодня',
      icon: Clock,
      badge: todayCount > 0 ? todayCount : undefined,
      badgeVariant: 'primary',
    },
    {
      to: '/tasks',
      label: 'Задачи',
      icon: CheckSquare,
      badge: overdueCount > 0 ? `${overdueCount}!` : undefined,
      badgeVariant: 'danger',
    },
    { to: '/calendar', label: 'Календарь', icon: Calendar },
    { to: '/reports', label: 'Отчёты', icon: BarChart3 },
  ];

  const resourcesGroup = [
    { to: '/projects', label: 'Проекты', icon: FolderKanban },
    { to: '/goals', label: 'Цели', icon: Target },
    { to: '/finance', label: 'Финансы', icon: CircleDollarSign },
    {
      to: '/debts',
      label: 'Долги',
      icon: FileText,
      badge: activeDebtsCount > 0 ? activeDebtsCount : undefined,
      badgeVariant: 'warning',
    },
    { to: '/people', label: 'Люди', icon: Users },
    { to: '/settings', label: 'Настройки', icon: Settings },
  ];

  const userInitial = settings.userName ? settings.userName.charAt(0).toUpperCase() : 'A';

  return (
    <aside
      className={`hidden md:flex flex-col border-r border-[#242A33] bg-[#11151B] h-screen sticky top-0 transition-all duration-300 z-30 select-none ${
        isCollapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Brand logo header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-[#242A33]">
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#6366F1] flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/25">
              Ω
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-base tracking-tight text-[#F5F7FA]">LifeOS</span>
              <span className="text-[10px] text-[#8B93A1] font-mono">Professional Suite</span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded bg-[#6366F1] flex items-center justify-center font-bold text-white mx-auto shadow-md shadow-indigo-500/25">
            Ω
          </div>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-md text-[#8B93A1] hover:text-[#F5F7FA] hover:bg-[#151A21] transition cursor-pointer ${
            isCollapsed ? 'mx-auto mt-1' : ''
          }`}
          title={isCollapsed ? 'Развернуть меню' : 'Свернуть меню'}
        >
          {isCollapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
        </button>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
        {/* Section 1: Intelligence */}
        {!isCollapsed && (
          <div className="text-[#8B93A1] text-[10px] uppercase font-bold tracking-wider px-3 pt-2 mb-1.5">
            Intelligence
          </div>
        )}

        {intelligenceGroup.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors group relative cursor-pointer ${
                  isActive
                    ? 'bg-[#151A21] text-[#F5F7FA] border border-[#242A33] shadow-xs'
                    : 'text-[#8B93A1] hover:text-[#F5F7FA] hover:bg-[#151A21]/60'
                } ${isCollapsed ? 'justify-center px-0 py-2.5' : ''}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                size={16}
                className="shrink-0 transition-transform group-hover:scale-105"
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}

              {!isCollapsed && item.badge !== undefined && (
                <span
                  className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold leading-none ${
                    item.badgeVariant === 'danger'
                      ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/25'
                      : item.badgeVariant === 'warning'
                      ? 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/25'
                      : 'bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/25'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {/* Floating dot if collapsed and has badge */}
              {isCollapsed && item.badge !== undefined && (
                <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-[#6366F1] ring-2 ring-[#11151B]" />
              )}
            </NavLink>
          );
        })}

        {/* Section 2: Resources & Strategy */}
        {!isCollapsed && (
          <div className="text-[#8B93A1] text-[10px] uppercase font-bold tracking-wider px-3 pt-5 mb-1.5">
            Resources & Control
          </div>
        )}

        {resourcesGroup.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors group relative cursor-pointer ${
                  isActive
                    ? 'bg-[#151A21] text-[#F5F7FA] border border-[#242A33] shadow-xs'
                    : 'text-[#8B93A1] hover:text-[#F5F7FA] hover:bg-[#151A21]/60'
                } ${isCollapsed ? 'justify-center px-0 py-2.5' : ''}`
              }
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                size={16}
                className="shrink-0 transition-transform group-hover:scale-105"
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}

              {!isCollapsed && item.badge !== undefined && (
                <span
                  className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold leading-none ${
                    item.badgeVariant === 'danger'
                      ? 'bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/25'
                      : item.badgeVariant === 'warning'
                      ? 'bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/25'
                      : 'bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/25'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {isCollapsed && item.badge !== undefined && (
                <span className="absolute top-1.5 right-2 w-2 h-2 rounded-full bg-[#F59E0B] ring-2 ring-[#11151B]" />
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Profile Pill at bottom */}
      <div className="p-3 border-t border-[#242A33]">
        {!isCollapsed ? (
          <div className="flex items-center gap-3 p-2 bg-[#151A21] rounded-lg border border-[#242A33]">
            <div className="w-8 h-8 rounded-full bg-[#242A33] border border-[#353D4A] flex items-center justify-center text-xs font-semibold text-[#F5F7FA]">
              {userInitial}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-semibold text-[#F5F7FA] truncate">
                {settings.userName || 'Александр'}
              </div>
              <div className="text-[10px] text-[#8B93A1] truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
                <span>LifeOS Active</span>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="w-8 h-8 rounded-full bg-[#242A33] border border-[#353D4A] flex items-center justify-center text-xs font-semibold text-[#F5F7FA] mx-auto"
            title={settings.userName || 'Александр'}
          >
            {userInitial}
          </div>
        )}
      </div>
    </aside>
  );
};
