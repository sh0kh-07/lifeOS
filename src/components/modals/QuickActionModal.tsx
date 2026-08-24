import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CheckSquare,
  DollarSign,
  FileText,
  FolderPlus,
  Plus,
  Target,
  UserPlus,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QuickActionModal: React.FC = () => {
  const {
    isQuickActionOpen,
    closeQuickAction,
    openTaskModal,
    openTransactionModal,
    openDebtModal,
    openProjectModal,
    openGoalModal,
    openPersonModal,
  } = useApp();

  const actions = [
    {
      title: 'Новая задача',
      desc: 'Добавить в список дел или на сегодня',
      icon: <CheckSquare className="text-indigo-400" size={20} />,
      onClick: () => {
        closeQuickAction();
        openTaskModal();
      },
    },
    {
      title: 'Записать расход',
      desc: 'Учесть трату или оплату счета',
      icon: <DollarSign className="text-red-400" size={20} />,
      onClick: () => {
        closeQuickAction();
        openTransactionModal(null, 'expense');
      },
    },
    {
      title: 'Записать доход',
      desc: 'Поступление средств на баланс',
      icon: <DollarSign className="text-emerald-400" size={20} />,
      onClick: () => {
        closeQuickAction();
        openTransactionModal(null, 'income');
      },
    },
    {
      title: 'Добавить долг',
      desc: 'Мне должны или я должен',
      icon: <FileText className="text-amber-400" size={20} />,
      onClick: () => {
        closeQuickAction();
        openDebtModal();
      },
    },
    {
      title: 'Создать проект',
      desc: 'Новый рабочий трек и бюджет',
      icon: <FolderPlus className="text-purple-400" size={20} />,
      onClick: () => {
        closeQuickAction();
        openProjectModal();
      },
    },
    {
      title: 'Поставить цель',
      desc: 'Определить измеримую цель и этапы',
      icon: <Target className="text-sky-400" size={20} />,
      onClick: () => {
        closeQuickAction();
        openGoalModal();
      },
    },
    {
      title: 'Новый контакт',
      desc: 'Добавить человека в записную книжку',
      icon: <UserPlus className="text-pink-400" size={20} />,
      onClick: () => {
        closeQuickAction();
        openPersonModal();
      },
    },
  ];

  return (
    <AnimatePresence>
      {isQuickActionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            onClick={closeQuickAction}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md bg-[#151A21] border border-[#242A33] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-10 text-left p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242A33]">
              <div>
                <h3 className="text-base font-semibold text-[#F5F7FA]">Быстрое действие</h3>
                <p className="text-xs text-[#8B93A1]">Выберите действие для создания записи</p>
              </div>
              <button
                onClick={closeQuickAction}
                className="p-1.5 text-[#8B93A1] hover:text-[#F5F7FA] rounded-lg hover:bg-[#1C232D] transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {actions.map((act, index) => (
                <button
                  key={index}
                  onClick={act.onClick}
                  className="flex items-center gap-3.5 p-3 rounded-xl bg-[#11151B] border border-[#242A33] hover:bg-[#1C232D] hover:border-[#353D4A] transition text-left cursor-pointer group"
                >
                  <div className="p-2 rounded-lg bg-[#151A21] border border-[#242A33] group-hover:scale-105 transition-transform">
                    {act.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-[#F5F7FA] group-hover:text-indigo-400 transition-colors">
                      {act.title}
                    </div>
                    <div className="text-[11px] text-[#8B93A1] truncate mt-0.5">{act.desc}</div>
                  </div>
                  <Plus size={14} className="text-[#576071] group-hover:text-[#F5F7FA] transition" />
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
