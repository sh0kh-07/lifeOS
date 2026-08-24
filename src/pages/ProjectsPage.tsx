import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  CircleDollarSign,
  FolderKanban,
  Plus,
  Trash2,
} from 'lucide-react';
import { StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, ProgressBar } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { useApp } from '../context/AppContext';
import { Project, ProjectStatus } from '../types';
import { formatDateReadable } from '../utils/date';
import { formatMoney, formatPercentage } from '../utils/format';

export const ProjectsPage: React.FC = () => {
  const {
    projects,
    tasks,
    openProjectModal,
    deleteProject,
    openTaskModal,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const filteredProjects = projects.filter((p) =>
    statusFilter === 'all' ? true : p.status === statusFilter
  );

  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    const completed = projectTasks.filter((t) => t.status === 'completed').length;
    const total = projectTasks.length;
    const percent = formatPercentage(completed, total);
    return { total, completed, percent, tasks: projectTasks };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">Проекты</h1>
          <p className="text-xs sm:text-sm text-[#8B93A1]">
            Стратегические направления, дедлайны и выполнение проектных задач
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => openProjectModal()}
          className="font-semibold shadow-xs"
        >
          <Plus size={16} /> Создать проект
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
        {[
          { key: 'all', label: 'Все проекты' },
          { key: 'in_progress', label: 'В работе' },
          { key: 'planning', label: 'Планирование' },
          { key: 'on_hold', label: 'На паузе' },
          { key: 'completed', label: 'Завершенные' },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setStatusFilter(item.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              statusFilter === item.key
                ? 'bg-[#1C232D] text-[#F5F7FA] border border-[#242A33]'
                : 'text-[#8B93A1] hover:text-[#F5F7FA] hover:bg-[#11151B]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title="Нет проектов в этой категории"
          description="Создайте проект для объединения задач, контроля бюджета и сроков."
          actionText="+ Создать проект"
          onAction={() => openProjectModal()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project: Project) => {
            const stats = getProjectStats(project.id);
            return (
              <Card
                key={project.id}
                className="flex flex-col justify-between hover:border-[#353D4A] transition"
              >
                <div>
                  {/* Top Bar: Color tag & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: project.color || '#6366F1' }}
                      />
                      <StatusBadge status={project.status} />
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openProjectModal(project)}
                        className="text-xs text-[#8B93A1] hover:text-[#F5F7FA] p-1 rounded hover:bg-[#1C232D] transition cursor-pointer"
                      >
                        Правка
                      </button>
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="text-xs text-[#8B93A1] hover:text-red-400 p-1 rounded hover:bg-[#1C232D] transition cursor-pointer"
                        title="Удалить проект"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <h3
                    onClick={() => openProjectModal(project)}
                    className="text-base font-bold text-[#F5F7FA] hover:text-indigo-400 transition cursor-pointer"
                  >
                    {project.name}
                  </h3>

                  {project.description && (
                    <p className="text-xs text-[#8B93A1] line-clamp-2 mt-1">
                      {project.description}
                    </p>
                  )}

                  {/* Progress */}
                  <div className="space-y-1.5 my-4">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#8B93A1]">Прогресс задач:</span>
                      <span className="font-semibold text-[#F5F7FA]">
                        {stats.completed} / {stats.total} ({stats.percent}%)
                      </span>
                    </div>
                    <ProgressBar
                      value={stats.percent}
                      color={stats.percent === 100 ? 'success' : 'primary'}
                      size="sm"
                    />
                  </div>
                </div>

                {/* Bottom Meta */}
                <div className="pt-3 border-t border-[#242A33] flex items-center justify-between text-[11px] text-[#8B93A1]">
                  {project.deadline ? (
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar size={12} className="text-indigo-400" />
                      {formatDateReadable(project.deadline, false)}
                    </span>
                  ) : (
                    <span>Без дедлайна</span>
                  )}

                  {project.budget ? (
                    <span className="flex items-center gap-1 font-semibold text-[#F5F7FA]">
                      <CircleDollarSign size={12} className="text-emerald-400" />
                      {formatMoney(project.budget, project.currency)}
                    </span>
                  ) : (
                    <span
                      onClick={() => openTaskModal(null, undefined, project.id)}
                      className="text-indigo-400 hover:underline cursor-pointer"
                    >
                      + Добавить задачу
                    </span>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
