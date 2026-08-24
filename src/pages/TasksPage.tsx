import React, { useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Filter,
  Kanban,
  List as ListIcon,
  Plus,
  Search,
  Tag,
  Trash2,
} from 'lucide-react';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { useApp } from '../context/AppContext';
import { Priority, Task, TaskStatus } from '../types';
import { formatDateReadable, formatRelativeDate, isDateOverdue } from '../utils/date';

export const TasksPage: React.FC = () => {
  const {
    tasks,
    projects,
    toggleTaskStatus,
    openTaskModal,
    deleteTask,
    updateTask,
  } = useApp();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');

  const statuses: { key: string; label: string }[] = [
    { key: 'all', label: 'Все задачи' },
    { key: 'inbox', label: 'Входящие' },
    { key: 'planned', label: 'Запланировано' },
    { key: 'in_progress', label: 'В работе' },
    { key: 'waiting', label: 'Ожидание' },
    { key: 'completed', label: 'Выполнено' },
  ];

  const kanbanColumns: { status: TaskStatus; label: string; color: string }[] = [
    { status: 'inbox', label: 'Входящие', color: 'border-slate-500' },
    { status: 'planned', label: 'Запланировано', color: 'border-sky-500' },
    { status: 'in_progress', label: 'В работе', color: 'border-indigo-500' },
    { status: 'completed', label: 'Выполнено', color: 'border-emerald-500' },
  ];

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        const matchTag = t.tags.some((tag) => tag.toLowerCase().includes(q));
        if (!matchTitle && !matchDesc && !matchTag) return false;
      }
      // Status
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      // Priority
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      // Project
      if (projectFilter !== 'all' && t.projectId !== projectFilter) return false;

      return true;
    });
  }, [tasks, search, statusFilter, priorityFilter, projectFilter]);

  const getProject = (projectId?: string) => {
    if (!projectId) return null;
    return projects.find((p) => p.id === projectId);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">Все задачи</h1>
          <p className="text-xs sm:text-sm text-[#8B93A1] mt-0.5">
            Управление текущими делами, проектами и дедлайнами ({filteredTasks.length} найдено)
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View mode switcher */}
          <div className="flex items-center p-1 rounded-xl bg-[#151A21] border border-[#242A33]">
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#1C232D] text-[#F5F7FA]'
                  : 'text-[#8B93A1] hover:text-[#F5F7FA]'
              }`}
              title="Список"
            >
              <ListIcon size={16} />
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-[#1C232D] text-[#F5F7FA]'
                  : 'text-[#8B93A1] hover:text-[#F5F7FA]'
              }`}
              title="Канбан доска"
            >
              <Kanban size={16} />
            </button>
          </div>

          <Button
            size="sm"
            variant="primary"
            onClick={() => openTaskModal()}
            className="font-semibold shadow-xs"
          >
            <Plus size={16} /> Новая задача
          </Button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-3 bg-[#151A21] border border-[#242A33] rounded-xl">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-3 text-[#8B93A1]" />
          <input
            type="text"
            placeholder="Поиск по названию, описанию или #тегу..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#11151B] border border-[#242A33] text-xs text-[#F5F7FA] placeholder-[#576071] rounded-lg pl-9 pr-3 py-2 outline-none focus:border-indigo-500"
          />
        </div>

        {/* Dropdown Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Status selector */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#11151B] border border-[#242A33] text-xs text-[#F5F7FA] rounded-lg px-2.5 py-2 outline-none cursor-pointer"
          >
            {statuses.map((s) => (
              <option key={s.key} value={s.key}>
                {s.label}
              </option>
            ))}
          </select>

          {/* Priority selector */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="bg-[#11151B] border border-[#242A33] text-xs text-[#F5F7FA] rounded-lg px-2.5 py-2 outline-none cursor-pointer"
          >
            <option value="all">Все приоритеты</option>
            <option value="urgent">⚡ Срочно</option>
            <option value="high">Высокий</option>
            <option value="medium">Средний</option>
            <option value="low">Низкий</option>
          </select>

          {/* Project selector */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-[#11151B] border border-[#242A33] text-xs text-[#F5F7FA] rounded-lg px-2.5 py-2 outline-none cursor-pointer"
          >
            <option value="all">Все проекты</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {(search || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setProjectFilter('all');
              }}
              className="text-xs text-indigo-400 hover:underline px-2 cursor-pointer"
            >
              Сброс
            </button>
          )}
        </div>
      </div>

      {/* Main Content: List or Kanban */}
      {viewMode === 'list' ? (
        filteredTasks.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            title="Задачи не найдены"
            description="Попробуйте изменить параметры поиска или фильтры."
            actionText="+ Создать новую задачу"
            onAction={() => openTaskModal()}
          />
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((task: Task) => {
              const isCompleted = task.status === 'completed';
              const isOverdue = isDateOverdue(task.dueDate) && !isCompleted;
              const project = getProject(task.projectId);
              const completedSubtasks = task.subtasks.filter((s) => s.completed).length;

              return (
                <div
                  key={task.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border transition group ${
                    isCompleted
                      ? 'bg-[#11151B]/60 border-[#242A33]/50 opacity-70'
                      : isOverdue
                      ? 'bg-[#151A21] border-red-500/30 hover:border-red-500/50'
                      : 'bg-[#151A21] border-[#242A33] hover:border-[#353D4A]'
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-3.5 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={isCompleted}
                      onChange={() => toggleTaskStatus(task.id)}
                      className="mt-1 sm:mt-0 w-4 h-4 rounded border-[#242A33] text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600 shrink-0"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          onClick={() => openTaskModal(task)}
                          className={`text-sm font-semibold cursor-pointer transition hover:text-indigo-400 ${
                            isCompleted ? 'line-through text-[#8B93A1]' : 'text-[#F5F7FA]'
                          }`}
                        >
                          {task.title}
                        </span>
                        <PriorityBadge priority={task.priority} />
                        {project && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#11151B] text-[#8B93A1] border border-[#242A33]">
                            {project.name}
                          </span>
                        )}
                        {isOverdue && (
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 font-bold">
                            Просрочено
                          </span>
                        )}
                      </div>

                      {task.description && (
                        <p className="text-xs text-[#8B93A1] line-clamp-1 mt-1">
                          {task.description}
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-[11px] text-[#8B93A1] flex-wrap">
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className={isOverdue ? 'text-red-400' : 'text-indigo-400'} />
                          {formatRelativeDate(task.dueDate, task.dueTime)}
                        </span>
                        {task.subtasks.length > 0 && (
                          <span className="flex items-center gap-1 font-mono">
                            <CheckCircle2 size={12} className="text-indigo-400" />
                            {completedSubtasks}/{task.subtasks.length}
                          </span>
                        )}
                        {task.tags.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Tag size={11} />
                            {task.tags.map((t) => `#${t}`).join(' ')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#242A33]/40">
                    <StatusBadge status={task.status} />
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
              );
            })}
          </div>
        )
      ) : (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kanbanColumns.map((col) => {
            const colTasks = filteredTasks.filter((t) => t.status === col.status);
            return (
              <div
                key={col.status}
                className="bg-[#11151B] border border-[#242A33] rounded-xl p-3.5 flex flex-col min-h-[500px]"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#242A33]">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#F5F7FA] uppercase tracking-wider">
                      {col.label}
                    </span>
                    <span className="text-[11px] font-mono px-1.5 py-0.2 rounded-md bg-[#1C232D] text-[#8B93A1]">
                      {colTasks.length}
                    </span>
                  </div>
                  <button
                    onClick={() => openTaskModal(null)}
                    className="p-1 rounded-md text-[#8B93A1] hover:text-[#F5F7FA] hover:bg-[#1C232D] transition"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <div className="flex-1 space-y-2.5 overflow-y-auto custom-scrollbar">
                  {colTasks.length === 0 ? (
                    <div className="py-12 text-center text-xs text-[#576071]">
                      Нет задач
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => openTaskModal(task)}
                        className="p-3 bg-[#151A21] border border-[#242A33] rounded-xl hover:border-[#353D4A] transition cursor-pointer space-y-2 text-left shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-xs font-semibold text-[#F5F7FA] line-clamp-2">
                            {task.title}
                          </span>
                          <PriorityBadge priority={task.priority} />
                        </div>

                        {task.description && (
                          <p className="text-[11px] text-[#8B93A1] line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between pt-2 border-t border-[#242A33]/50 text-[10px] text-[#8B93A1]">
                          <span className="flex items-center gap-1 font-mono">
                            <Clock size={10} />
                            {task.dueDate}
                          </span>
                          {getProject(task.projectId) && (
                            <span className="truncate max-w-[90px]">
                              {getProject(task.projectId)?.name}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
