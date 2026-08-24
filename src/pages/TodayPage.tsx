import React, { useState } from 'react';
import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Plus,
  RotateCcw,
  Sparkles,
  Tag,
  Trash2,
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, ProgressBar } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import { formatDateReadable, getTodayDateString, WEEKDAYS_FULL_RU } from '../utils/date';
import { formatPercentage } from '../utils/format';

export const TodayPage: React.FC = () => {
  const {
    tasks,
    projects,
    toggleTaskStatus,
    toggleTaskSubtask,
    openTaskModal,
    deleteTask,
    rescheduleTask,
    addTask,
    getTodayTasks,
    getOverdueTasks,
  } = useApp();

  const [quickTitle, setQuickTitle] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [expandedTaskIds, setExpandedTaskIds] = useState<Record<string, boolean>>({});

  const todayStr = getTodayDateString();
  const todayTasks = getTodayTasks();
  const overdueTasks = getOverdueTasks();

  const completedToday = todayTasks.filter((t) => t.status === 'completed');
  const activeToday = todayTasks.filter((t) => t.status !== 'completed');
  const completionPercent = formatPercentage(completedToday.length, todayTasks.length);

  const todayDate = new Date();
  const dayOfWeek = (todayDate.getDay() + 6) % 7;
  const weekdayName = WEEKDAYS_FULL_RU[dayOfWeek];

  const categories = ['all', ...Array.from(new Set(todayTasks.map((t) => t.category)))];

  const filteredActive = activeToday.filter((t) =>
    filterCategory === 'all' ? true : t.category === filterCategory
  );

  const toggleExpand = (taskId: string) => {
    setExpandedTaskIds((prev) => ({
      ...prev,
      [taskId]: !prev[taskId],
    }));
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim()) return;
    addTask({
      title: quickTitle.trim(),
      status: 'planned',
      priority: 'medium',
      dueDate: todayStr,
      category: 'Работа',
      tags: ['сегодня'],
      subtasks: [],
    });
    setQuickTitle('');
  };

  const getProjectName = (projectId?: string) => {
    if (!projectId) return null;
    const p = projects.find((item) => item.id === projectId);
    return p ? p.name : null;
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner with Progress */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#151A21] via-[#1A212B] to-[#151A21] border border-[#242A33] shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
              <Sparkles size={14} />
              <span>{weekdayName}, {formatDateReadable(todayStr, false)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#F5F7FA] tracking-tight">
              Фокус дня
            </h1>
            <p className="text-xs sm:text-sm text-[#8B93A1] mt-1">
              Завершите намеченные дела сегодня, чтобы освободить вечер для отдыха
            </p>
          </div>

          {/* Daily Progress Gauge */}
          <div className="bg-[#11151B] border border-[#242A33] p-4 rounded-xl flex items-center gap-4 min-w-[240px]">
            <div className="w-12 h-12 rounded-full bg-indigo-500/10 border-2 border-indigo-500 flex items-center justify-center text-indigo-400 font-bold text-sm shrink-0">
              {completionPercent}%
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[#F5F7FA]">
                {completedToday.length} из {todayTasks.length} выполнено
              </div>
              <div className="text-[11px] text-[#8B93A1] mt-0.5">
                {activeToday.length} задач в фокусе
              </div>
              <ProgressBar value={completionPercent} size="sm" className="mt-2" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Bar */}
      <form
        onSubmit={handleQuickAdd}
        className="flex items-center gap-2 p-2 rounded-xl bg-[#151A21] border border-[#242A33] shadow-sm"
      >
        <input
          type="text"
          placeholder="+ Быстро добавить задачу на сегодня (нажмите Enter)..."
          value={quickTitle}
          onChange={(e) => setQuickTitle(e.target.value)}
          className="flex-1 bg-transparent text-sm text-[#F5F7FA] placeholder-[#576071] px-3 py-1.5 outline-none"
        />
        <Button
          type="submit"
          size="sm"
          variant="primary"
          disabled={!quickTitle.trim()}
          className="shrink-0"
        >
          <Plus size={14} /> Добавить
        </Button>
      </form>

      {/* Overdue alert banner if any */}
      {overdueTasks.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-amber-300 text-xs sm:text-sm">
            <AlertCircle size={18} className="shrink-0 text-amber-400" />
            <div>
              <span className="font-semibold">
                У вас {overdueTasks.length} {overdueTasks.length === 1 ? 'просроченная задача' : 'просроченных задач'} с прошлых дней.
              </span>
              <span className="text-amber-400/80 block sm:inline sm:ml-1 text-xs">
                Перенесите их на сегодня одним нажатием.
              </span>
            </div>
          </div>
          <Button
            size="sm"
            variant="warning"
            onClick={() => {
              overdueTasks.forEach((t) => rescheduleTask(t.id, todayStr));
            }}
            className="text-xs shrink-0"
          >
            <RotateCcw size={13} /> Все на сегодня
          </Button>
        </div>
      )}

      {/* Category Tabs */}
      {categories.length > 2 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-[#1C232D] text-[#F5F7FA] border border-[#242A33]'
                  : 'text-[#8B93A1] hover:text-[#F5F7FA] hover:bg-[#11151B]'
              }`}
            >
              {cat === 'all' ? 'Все категории' : cat}
            </button>
          ))}
        </div>
      )}

      {/* Active Today Tasks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold text-[#8B93A1] uppercase tracking-wider px-1">
          <span>К выполнению ({filteredActive.length})</span>
          <span>Приоритет / Проект</span>
        </div>

        {filteredActive.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title={activeToday.length === 0 && completedToday.length > 0 ? 'Все задачи на сегодня выполнены!' : 'Список задач на сегодня пуст'}
            description={
              activeToday.length === 0 && completedToday.length > 0
                ? 'Отличная продуктивность! Вы завершили все запланированные дела.'
                : 'Добавьте первую задачу в строке выше или выберите дату в календаре.'
            }
            actionText="+ Добавить задачу"
            onAction={() => openTaskModal(null, todayStr)}
          />
        ) : (
          <div className="space-y-3">
            {filteredActive.map((task: Task) => {
              const projectName = getProjectName(task.projectId);
              const subtasks = task.subtasks || [];
              const completedSubtasks = subtasks.filter((s) => s.completed).length;
              const isExpanded = expandedTaskIds[task.id] ?? (subtasks.length > 0);

              return (
                <div
                  key={task.id}
                  className="p-4 rounded-xl bg-[#151A21] border border-[#242A33] hover:border-[#353D4A] transition group shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={task.status === 'completed'}
                        onChange={() => toggleTaskStatus(task.id)}
                        className="mt-1 sm:mt-0 w-5 h-5 rounded border-[#242A33] text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600 shrink-0"
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            onClick={() => openTaskModal(task)}
                            className="text-sm font-semibold text-[#F5F7FA] hover:text-indigo-400 cursor-pointer transition"
                          >
                            {task.title}
                          </span>
                          <PriorityBadge priority={task.priority} />
                          {projectName && (
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#11151B] text-[#8B93A1] border border-[#242A33]">
                              {projectName}
                            </span>
                          )}
                        </div>

                        {task.description && (
                          <p className="text-xs text-[#8B93A1] line-clamp-2 mt-1">
                            {task.description}
                          </p>
                        )}

                        {/* Subtasks badge & tags */}
                        <div className="flex items-center gap-3 mt-2 text-[11px] text-[#8B93A1]">
                          {subtasks.length > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleExpand(task.id)}
                              className="flex items-center gap-1 font-mono text-indigo-400 hover:text-indigo-300 cursor-pointer"
                            >
                              <CheckCircle2 size={12} />
                              {completedSubtasks}/{subtasks.length} подзадач
                              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                            </button>
                          )}
                          {task.tags && task.tags.length > 0 && (
                            <span className="flex items-center gap-1">
                              <Tag size={11} />
                              {task.tags.map((t) => `#${t}`).join(' ')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Actions right */}
                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#242A33]/40">
                      {task.dueTime && (
                        <span className="text-xs font-mono text-[#8B93A1] flex items-center gap-1 bg-[#11151B] px-2.5 py-1 rounded-lg border border-[#242A33]">
                          <Clock size={12} className="text-indigo-400" />
                          {task.dueTime}
                        </span>
                      )}
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openTaskModal(task)}
                          className="text-xs py-1 px-2.5"
                        >
                          Правка
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteTask(task.id)}
                          className="text-xs py-1 px-2 text-[#8B93A1] hover:text-red-400"
                          title="Удалить"
                        >
                          <Trash2 size={13} />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Interactive Subtask Checklist */}
                  {subtasks.length > 0 && isExpanded && (
                    <div className="pt-2 border-t border-[#242A33]/60 pl-8 space-y-1.5">
                      {subtasks.map((st) => (
                        <label
                          key={st.id}
                          className="flex items-center gap-2.5 text-xs text-[#F5F7FA] hover:text-indigo-300 cursor-pointer select-none py-0.5"
                        >
                          <input
                            type="checkbox"
                            checked={st.completed}
                            onChange={() => toggleTaskSubtask(task.id, st.id)}
                            className="w-3.5 h-3.5 rounded border-[#242A33] text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                          />
                          <span className={st.completed ? 'line-through text-[#8B93A1]' : ''}>
                            {st.title}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Today Section */}
      {completedToday.length > 0 && (
        <div className="space-y-2 pt-4">
          <div className="flex items-center justify-between text-xs font-semibold text-[#8B93A1] uppercase tracking-wider px-1">
            <span>Выполнено сегодня ({completedToday.length})</span>
          </div>

          <div className="space-y-2 opacity-75">
            {completedToday.map((task: Task) => (
              <div
                key={task.id}
                className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#11151B] border border-[#242A33]/60"
              >
                <label className="flex items-center gap-3 min-w-0 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => toggleTaskStatus(task.id)}
                    className="w-4 h-4 rounded border-[#242A33] text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                  />
                  <span className="text-xs sm:text-sm line-through text-[#8B93A1] truncate">
                    {task.title}
                  </span>
                </label>
                <StatusBadge status="completed" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
