import React, { useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Clock,
  FolderKanban,
  Plus,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { useApp } from '../context/AppContext';
import {
  formatDateReadable,
  formatRelativeDate,
  getMonthMatrix,
  getTodayDateString,
  MONTH_NAMES_RU,
  WEEKDAYS_FULL_RU,
  WEEKDAYS_RU,
} from '../utils/date';

export const CalendarPage: React.FC = () => {
  const { tasks, projects, debts, openTaskModal } = useApp();

  const todayStr = getTodayDateString();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const handlePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - 1);
      setCurrentDate(d);
    }
  };

  const handleNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    } else if (viewMode === 'week') {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 7);
      setCurrentDate(d);
    } else {
      const d = new Date(currentDate);
      d.setDate(d.getDate() + 1);
      setCurrentDate(d);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Month grid
  const monthMatrix = useMemo(() => {
    return getMonthMatrix(currentYear, currentMonth, true);
  }, [currentYear, currentMonth]);

  // Group events by date string (YYYY-MM-DD)
  const eventsByDate = useMemo(() => {
    const map: Record<
      string,
      {
        tasks: typeof tasks;
        projectDeadlines: typeof projects;
        debtDeadlines: typeof debts;
      }
    > = {};

    tasks.forEach((t) => {
      if (!t.dueDate) return;
      if (!map[t.dueDate]) {
        map[t.dueDate] = { tasks: [], projectDeadlines: [], debtDeadlines: [] };
      }
      map[t.dueDate].tasks.push(t);
    });

    projects.forEach((p) => {
      if (!p.deadline) return;
      if (!map[p.deadline]) {
        map[p.deadline] = { tasks: [], projectDeadlines: [], debtDeadlines: [] };
      }
      map[p.deadline].projectDeadlines.push(p);
    });

    debts.forEach((d) => {
      if (!d.deadlineDate) return;
      if (!map[d.deadlineDate]) {
        map[d.deadlineDate] = { tasks: [], projectDeadlines: [], debtDeadlines: [] };
      }
      map[d.deadlineDate].debtDeadlines.push(d);
    });

    return map;
  }, [tasks, projects, debts]);

  return (
    <div className="space-y-6">
      {/* Calendar Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">Календарь</h1>
          <p className="text-xs sm:text-sm text-[#8B93A1]">
            Планирование задач, дедлайнов проектов и финансовых обязательств
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-[#151A21] border border-[#242A33]">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition cursor-pointer ${
                viewMode === 'month'
                  ? 'bg-[#1C232D] text-[#F5F7FA]'
                  : 'text-[#8B93A1] hover:text-[#F5F7FA]'
              }`}
            >
              Месяц
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition cursor-pointer ${
                viewMode === 'week'
                  ? 'bg-[#1C232D] text-[#F5F7FA]'
                  : 'text-[#8B93A1] hover:text-[#F5F7FA]'
              }`}
            >
              Неделя
            </button>
            <button
              onClick={() => setViewMode('day')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition cursor-pointer ${
                viewMode === 'day'
                  ? 'bg-[#1C232D] text-[#F5F7FA]'
                  : 'text-[#8B93A1] hover:text-[#F5F7FA]'
              }`}
            >
              День
            </button>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={() => openTaskModal(null, todayStr)}
            className="font-semibold"
          >
            <Plus size={16} /> Создать
          </Button>
        </div>
      </div>

      {/* Navigation bar */}
      <div className="flex items-center justify-between p-3 bg-[#151A21] border border-[#242A33] rounded-xl">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrev}
            className="p-1.5 rounded-lg bg-[#11151B] border border-[#242A33] text-[#8B93A1] hover:text-[#F5F7FA] transition cursor-pointer"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNext}
            className="p-1.5 rounded-lg bg-[#11151B] border border-[#242A33] text-[#8B93A1] hover:text-[#F5F7FA] transition cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
          <button
            onClick={handleToday}
            className="px-2.5 py-1 text-xs font-medium rounded-lg bg-[#11151B] border border-[#242A33] text-[#8B93A1] hover:text-[#F5F7FA] transition cursor-pointer"
          >
            Сегодня
          </button>
        </div>

        <div className="text-sm font-bold text-[#F5F7FA]">
          {MONTH_NAMES_RU[currentMonth]} {currentYear}
        </div>

        {/* Legend */}
        <div className="hidden sm:flex items-center gap-3 text-[11px] text-[#8B93A1]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-indigo-500" /> Задачи
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-purple-500" /> Проекты
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Долги
          </span>
        </div>
      </div>

      {/* Month View Grid */}
      {viewMode === 'month' && (
        <Card className="p-2 sm:p-4">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-2 text-center text-xs font-semibold text-[#8B93A1] py-2 border-b border-[#242A33]">
            {WEEKDAYS_RU.map((day) => (
              <div key={day}>{day}</div>
            ))}
          </div>

          {/* Matrix days */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {monthMatrix.flat().map((cell, idx) => {
              const isToday = cell.dateStr === todayStr;
              const cellEvents = eventsByDate[cell.dateStr] || {
                tasks: [],
                projectDeadlines: [],
                debtDeadlines: [],
              };

              return (
                <div
                  key={idx}
                  onClick={() => openTaskModal(null, cell.dateStr)}
                  className={`min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 rounded-xl border flex flex-col justify-between transition cursor-pointer text-left group ${
                    isToday
                      ? 'bg-indigo-950/20 border-indigo-500/50'
                      : cell.isCurrentMonth
                      ? 'bg-[#11151B] border-[#242A33] hover:border-[#353D4A] hover:bg-[#151A21]'
                      : 'bg-[#0B0D10]/40 border-transparent opacity-40 hover:opacity-75'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-mono font-semibold rounded-md w-5 h-5 flex items-center justify-center ${
                        isToday
                          ? 'bg-indigo-600 text-white'
                          : 'text-[#F5F7FA]'
                      }`}
                    >
                      {cell.day}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openTaskModal(null, cell.dateStr);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 text-[#8B93A1] hover:text-[#F5F7FA] transition"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  {/* Badges / Items preview */}
                  <div className="space-y-1 mt-1 flex-1 overflow-hidden">
                    {/* Tasks */}
                    {cellEvents.tasks.slice(0, 2).map((t) => (
                      <div
                        key={t.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          openTaskModal(t);
                        }}
                        className={`text-[10px] truncate px-1.5 py-0.5 rounded border transition font-medium ${
                          t.status === 'completed'
                            ? 'bg-[#1C232D]/40 text-[#8B93A1] line-through border-transparent'
                            : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25'
                        }`}
                        title={t.title}
                      >
                        {t.title}
                      </div>
                    ))}

                    {/* Project deadlines */}
                    {cellEvents.projectDeadlines.map((p) => (
                      <div
                        key={p.id}
                        className="text-[10px] truncate px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30 font-medium"
                        title={`Дедлайн проекта: ${p.name}`}
                      >
                        🎯 {p.name}
                      </div>
                    ))}

                    {/* Debt deadlines */}
                    {cellEvents.debtDeadlines.map((d) => (
                      <div
                        key={d.id}
                        className="text-[10px] truncate px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium"
                        title={`Долг: ${d.personName}`}
                      >
                        💰 {d.personName}
                      </div>
                    ))}

                    {cellEvents.tasks.length > 2 && (
                      <div className="text-[9px] text-[#8B93A1] font-mono pl-1">
                        +{cellEvents.tasks.length - 2} еще
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Week / Day View Details */}
      {viewMode !== 'month' && (
        <Card className="space-y-4">
          <div className="text-sm font-semibold text-[#F5F7FA]">
            {viewMode === 'day'
              ? `Расписание на ${formatDateReadable(todayStr, true)}`
              : `События текущей недели`}
          </div>

          <div className="divide-y divide-[#242A33]">
            {tasks.map((task) => (
              <div
                key={task.id}
                onClick={() => openTaskModal(task)}
                className="py-3 flex items-center justify-between hover:bg-[#11151B] p-2 rounded-lg transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-[#8B93A1] w-20">
                    {task.dueTime || 'Весь день'}
                  </span>
                  <div>
                    <span className="text-sm font-semibold text-[#F5F7FA]">
                      {task.title}
                    </span>
                    <p className="text-xs text-[#8B93A1]">{task.category}</p>
                  </div>
                </div>
                <div className="text-xs text-[#8B93A1] font-mono">
                  {formatRelativeDate(task.dueDate)}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
