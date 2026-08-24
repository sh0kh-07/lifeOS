import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  BarChart3,
  Calendar,
  CheckSquare,
  CircleDollarSign,
  Clock,
  FileText,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Settings,
  Target,
  Users,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const MobileNav: React.FC = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { getTodayTasks, getOverdueTasks, debts } = useApp();

  const todayCount = getTodayTasks().filter((t) => t.status !== 'completed').length;
  const overdueCount = getOverdueTasks().length;
  const activeDebtsCount = debts.filter((d) => d.status !== 'paid').length;

  const primaryItems = [
    { to: '/', label: 'Главная', icon: LayoutDashboard, exact: true },
    { to: '/today', label: 'Сегодня', icon: Clock, badge: todayCount > 0 ? todayCount : undefined },
    { to: '/tasks', label: 'Задачи', icon: CheckSquare, badge: overdueCount > 0 ? `${overdueCount}` : undefined },
    { to: '/finance', label: 'Финансы', icon: CircleDollarSign },
  ];

  const drawerItems = [
    { to: '/calendar', label: 'Календарь', icon: Calendar },
    { to: '/projects', label: 'Проекты', icon: FolderKanban },
    { to: '/goals', label: 'Цели', icon: Target },
    { to: '/debts', label: 'Долги', icon: FileText, badge: activeDebtsCount > 0 ? activeDebtsCount : undefined },
    { to: '/people', label: 'Люди', icon: Users },
    { to: '/reports', label: 'Отчёты', icon: BarChart3 },
    { to: '/settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <>
      {/* Bottom Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-[#11151B] border-t border-[#242A33] z-40 flex items-center justify-around px-2">
        {primaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium transition relative cursor-pointer ${
                  isActive ? 'text-[#6366F1]' : 'text-[#8B93A1] hover:text-[#F5F7FA]'
                }`
              }
            >
              <div className="relative mb-0.5">
                <Icon size={18} />
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-2 px-1 py-0.2 text-[9px] font-bold bg-[#6366F1] text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </NavLink>
          );
        })}

        {/* More Menu Drawer Trigger */}
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="flex flex-col items-center justify-center flex-1 py-1 text-[10px] font-medium text-[#8B93A1] hover:text-[#F5F7FA] transition cursor-pointer"
        >
          <div className="relative mb-0.5">
            <Menu size={18} />
            {activeDebtsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#F59E0B]" />
            )}
          </div>
          <span>Ещё</span>
        </button>
      </nav>

      {/* Slide-out Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex justify-end">
          <div
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative w-4/5 max-w-xs bg-[#11151B] border-l border-[#242A33] h-full shadow-2xl z-10 flex flex-col p-4 text-left animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#242A33] mb-4">
              <span className="font-semibold text-sm text-[#F5F7FA]">Разделы LifeOS</span>
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 rounded-lg text-[#8B93A1] hover:text-[#F5F7FA] cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-1.5 overflow-y-auto custom-scrollbar">
              {drawerItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setIsDrawerOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                        isActive
                          ? 'bg-[#151A21] text-[#F5F7FA] border border-[#242A33]'
                          : 'text-[#8B93A1] hover:bg-[#151A21]/60 hover:text-[#F5F7FA]'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Icon size={16} className="text-[#6366F1]" />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-[#F59E0B]/20 text-[#F59E0B]">
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
