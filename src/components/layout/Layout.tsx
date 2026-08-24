import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckSquare,
  Clock,
  Plus,
  Search,
  Settings,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CommandPalette } from '../modals/CommandPalette';
import { DebtModal } from '../modals/DebtModal';
import { DebtPaymentModal } from '../modals/DebtPaymentModal';
import { GoalModal } from '../modals/GoalModal';
import { PersonModal } from '../modals/PersonModal';
import { ProjectModal } from '../modals/ProjectModal';
import { QuickActionModal } from '../modals/QuickActionModal';
import { TaskModal } from '../modals/TaskModal';
import { TransactionModal } from '../modals/TransactionModal';
import { ToastContainer } from '../ui/ToastContainer';
import { MobileNav } from './MobileNav';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';

export const Layout: React.FC = () => {
  const { openQuickAction, openCommandPalette } = useApp();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0B0D10] text-[#F5F7FA] flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 md:pb-0">
        <TopBar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
          <Outlet />
        </main>
      </div>

      {/* Right Action Bar (Compact) matching design spec */}
      <div className="hidden xl:flex w-12 bg-[#11151B] border-l border-[#242A33] flex-col items-center py-6 gap-5 shrink-0 sticky top-0 h-screen select-none">
        <button
          onClick={openQuickAction}
          className="w-8 h-8 rounded-full bg-[#6366F1]/15 hover:bg-[#6366F1]/25 flex items-center justify-center text-[#6366F1] cursor-pointer transition-colors"
          title="Быстрое создание (+)"
        >
          <Plus size={16} />
        </button>

        <button
          onClick={openCommandPalette}
          className="w-8 h-8 rounded-full hover:bg-[#151A21] flex items-center justify-center text-[#8B93A1] hover:text-[#F5F7FA] cursor-pointer transition-colors"
          title="Командная строка (⌘K)"
        >
          <Search size={15} />
        </button>

        <button
          onClick={() => navigate('/today')}
          className="w-8 h-8 rounded-full hover:bg-[#151A21] flex items-center justify-center text-[#8B93A1] hover:text-[#F5F7FA] cursor-pointer transition-colors"
          title="Сегодня"
        >
          <Clock size={15} />
        </button>

        <button
          onClick={() => navigate('/tasks')}
          className="w-8 h-8 rounded-full hover:bg-[#151A21] flex items-center justify-center text-[#8B93A1] hover:text-[#F5F7FA] cursor-pointer transition-colors"
          title="Задачи"
        >
          <CheckSquare size={15} />
        </button>

        <button
          onClick={() => navigate('/calendar')}
          className="w-8 h-8 rounded-full hover:bg-[#151A21] flex items-center justify-center text-[#8B93A1] hover:text-[#F5F7FA] cursor-pointer transition-colors"
          title="Календарь"
        >
          <Calendar size={15} />
        </button>

        <div className="mt-auto">
          <button
            onClick={() => navigate('/settings')}
            className="w-8 h-8 rounded-full hover:bg-[#151A21] flex items-center justify-center text-[#8B93A1] hover:text-[#F5F7FA] cursor-pointer transition-colors"
            title="Настройки"
          >
            <Settings size={15} />
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileNav />

      {/* Global Modals & Notifications */}
      <TaskModal />
      <TransactionModal />
      <DebtModal />
      <DebtPaymentModal />
      <ProjectModal />
      <GoalModal />
      <PersonModal />
      <CommandPalette />
      <QuickActionModal />
      <ToastContainer />
    </div>
  );
};
