import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  CheckSquare,
  CircleDollarSign,
  CreditCard,
  FileText,
  FolderKanban,
  Plus,
  Search,
  Target,
  User,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatMoney } from '../../utils/format';

interface CommandItem {
  id: string;
  type: 'action' | 'task' | 'project' | 'goal' | 'person' | 'debt' | 'page';
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    closeCommandPalette,
    tasks,
    projects,
    goals,
    people,
    debts,
    openTaskModal,
    openTransactionModal,
    openDebtModal,
    openProjectModal,
    openGoalModal,
    openPersonModal,
  } = useApp();

  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isCommandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isCommandPaletteOpen]);

  const items: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [];

    // Quick Actions
    list.push({
      id: 'act-new-task',
      type: 'action',
      title: 'Создать задачу',
      subtitle: 'Быстрое добавление новой задачи',
      icon: <Plus size={16} className="text-indigo-400" />,
      onSelect: () => {
        closeCommandPalette();
        openTaskModal();
      },
    });

    list.push({
      id: 'act-new-expense',
      type: 'action',
      title: 'Записать расход',
      subtitle: 'Фиксация траты в финансах',
      icon: <CreditCard size={16} className="text-red-400" />,
      onSelect: () => {
        closeCommandPalette();
        openTransactionModal(null, 'expense');
      },
    });

    list.push({
      id: 'act-new-income',
      type: 'action',
      title: 'Записать доход',
      subtitle: 'Поступление средств',
      icon: <CircleDollarSign size={16} className="text-emerald-400" />,
      onSelect: () => {
        closeCommandPalette();
        openTransactionModal(null, 'income');
      },
    });

    list.push({
      id: 'act-new-debt',
      type: 'action',
      title: 'Добавить долг',
      subtitle: 'Мне должны или я должен',
      icon: <FileText size={16} className="text-amber-400" />,
      onSelect: () => {
        closeCommandPalette();
        openDebtModal();
      },
    });

    list.push({
      id: 'act-new-project',
      type: 'action',
      title: 'Создать проект',
      subtitle: 'Новая рабочая область',
      icon: <FolderKanban size={16} className="text-purple-400" />,
      onSelect: () => {
        closeCommandPalette();
        openProjectModal();
      },
    });

    list.push({
      id: 'act-new-goal',
      type: 'action',
      title: 'Поставить цель',
      subtitle: 'Метрика и контрольные этапы',
      icon: <Target size={16} className="text-sky-400" />,
      onSelect: () => {
        closeCommandPalette();
        openGoalModal();
      },
    });

    // Navigation Pages
    list.push({
      id: 'page-today',
      type: 'page',
      title: 'Перейти: Сегодня',
      subtitle: 'Фокус задач на текущий день',
      icon: <Calendar size={16} className="text-[#8B93A1]" />,
      onSelect: () => {
        closeCommandPalette();
        navigate('/today');
      },
    });

    list.push({
      id: 'page-calendar',
      type: 'page',
      title: 'Перейти: Календарь',
      subtitle: 'Сетка месяца, недели и расписание',
      icon: <Calendar size={16} className="text-[#8B93A1]" />,
      onSelect: () => {
        closeCommandPalette();
        navigate('/calendar');
      },
    });

    list.push({
      id: 'page-finance',
      type: 'page',
      title: 'Перейти: Финансы',
      subtitle: 'Баланс, доходы, расходы и аналитика',
      icon: <CircleDollarSign size={16} className="text-[#8B93A1]" />,
      onSelect: () => {
        closeCommandPalette();
        navigate('/finance');
      },
    });

    // Tasks
    tasks.forEach((t) => {
      list.push({
        id: `task-${t.id}`,
        type: 'task',
        title: t.title,
        subtitle: `Задача • ${t.dueDate || 'Без даты'} • ${t.category}`,
        icon: <CheckSquare size={16} className="text-indigo-400" />,
        onSelect: () => {
          closeCommandPalette();
          openTaskModal(t);
        },
      });
    });

    // Projects
    projects.forEach((p) => {
      list.push({
        id: `proj-${p.id}`,
        type: 'project',
        title: p.name,
        subtitle: `Проект • ${p.status}`,
        icon: <FolderKanban size={16} className="text-purple-400" />,
        onSelect: () => {
          closeCommandPalette();
          navigate(`/projects`);
        },
      });
    });

    // Goals
    goals.forEach((g) => {
      list.push({
        id: `goal-${g.id}`,
        type: 'goal',
        title: g.title,
        subtitle: `Цель • ${g.currentAmount} / ${g.targetAmount} ${g.unit}`,
        icon: <Target size={16} className="text-sky-400" />,
        onSelect: () => {
          closeCommandPalette();
          navigate('/goals');
        },
      });
    });

    // People
    people.forEach((person) => {
      list.push({
        id: `person-${person.id}`,
        type: 'person',
        title: person.name,
        subtitle: `Контакт • ${person.roleOrRelation || person.phone || 'Человек'}`,
        icon: <User size={16} className="text-pink-400" />,
        onSelect: () => {
          closeCommandPalette();
          navigate('/people');
        },
      });
    });

    // Debts
    debts.forEach((debt) => {
      list.push({
        id: `debt-${debt.id}`,
        type: 'debt',
        title: `${debt.type === 'they_owe' ? 'Мне должен' : 'Я должен'}: ${debt.personName}`,
        subtitle: `${formatMoney(debt.totalAmount, debt.currency)} • ${debt.reason}`,
        icon: <FileText size={16} className="text-amber-400" />,
        onSelect: () => {
          closeCommandPalette();
          navigate('/debts');
        },
      });
    });

    return list;
  }, [tasks, projects, goals, people, debts, navigate, closeCommandPalette, openTaskModal, openTransactionModal, openDebtModal, openProjectModal, openGoalModal]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) {
      return items.slice(0, 8); // show initial actions & shortcuts
    }
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.subtitle && item.subtitle.toLowerCase().includes(q))
    ).slice(0, 15);
  }, [items, query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredItems]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      closeCommandPalette();
    }
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/80 backdrop-blur-xs"
            onClick={closeCommandPalette}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl bg-[#151A21] border border-[#242A33] rounded-2xl shadow-2xl shadow-black/80 overflow-hidden z-10 text-left"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-[#242A33]">
              <Search size={18} className="text-[#8B93A1] mr-3 shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Поиск задач, проектов, людей, финансов или действий..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-sm text-[#F5F7FA] placeholder-[#576071] outline-none"
              />
              <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-[#8B93A1] bg-[#11151B] border border-[#242A33] rounded">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="p-2 max-h-[380px] overflow-y-auto custom-scrollbar">
              {filteredItems.length === 0 ? (
                <div className="py-8 text-center text-xs text-[#8B93A1]">
                  Ничего не найдено по запросу &quot;{query}&quot;
                </div>
              ) : (
                filteredItems.map((item, idx) => {
                  const isSelected = idx === selectedIndex;
                  return (
                    <div
                      key={item.id}
                      onClick={item.onSelect}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition ${
                        isSelected ? 'bg-[#1C232D] text-[#F5F7FA]' : 'text-[#8B93A1] hover:bg-[#11151B]'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-1.5 rounded-lg bg-[#11151B] border border-[#242A33] shrink-0">
                          {item.icon}
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-semibold text-[#F5F7FA] truncate">
                            {item.title}
                          </div>
                          {item.subtitle && (
                            <div className="text-[11px] text-[#8B93A1] truncate mt-0.5">
                              {item.subtitle}
                            </div>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <span className="text-[10px] text-indigo-400 font-medium tracking-wide shrink-0">
                          ↵ Выбрать
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer shortcuts */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#11151B] border-t border-[#242A33] text-[11px] text-[#576071]">
              <span>Используйте ↑ ↓ для навигации, Enter для выбора</span>
              <span>LifeOS Search</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
