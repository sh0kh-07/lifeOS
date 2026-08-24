import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock,
  FileText,
  Plus,
  Target,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { PriorityBadge, StatusBadge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, ProgressBar, StatCard } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { useApp } from '../context/AppContext';
import { Task } from '../types';
import {
  formatDateReadable,
  formatRelativeDate,
  getTodayDateString,
  WEEKDAYS_FULL_RU,
} from '../utils/date';
import { formatMoney, formatPercentage } from '../utils/format';

export const DashboardPage: React.FC = () => {
  const {
    tasks,
    projects,
    goals,
    settings,
    toggleTaskStatus,
    openTaskModal,
    deleteTask,
    rescheduleTask,
    openGoalModal,
    openTransactionModal,
    openDebtModal,
    getFinancialSummary,
    getTodayTasks,
    getOverdueTasks,
  } = useApp();

  const navigate = useNavigate();

  const todayTasks = getTodayTasks();
  const completedTodayTasks = todayTasks.filter((t) => t.status === 'completed');
  const overdueTasks = getOverdueTasks();
  const finSummary = getFinancialSummary(settings.defaultCurrency);

  // Upcoming tasks (due after today)
  const todayStr = getTodayDateString();
  const upcomingTasks = tasks
    .filter((t) => t.dueDate > todayStr && t.status !== 'completed' && t.status !== 'cancelled')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4);

  // Productivity chart data (weekly)
  const productivityData = [
    { day: 'Пн', completed: 5 },
    { day: 'Вт', completed: 4 },
    { day: 'Ср', completed: 7 },
    { day: 'Чт', completed: 3 },
    { day: 'Пт', completed: 6 },
    { day: 'Сб', completed: 2 },
    { day: 'Вс', completed: 4 },
  ];

  const getProjectName = (projectId?: string) => {
    if (!projectId) return null;
    const p = projects.find((item) => item.id === projectId);
    return p ? p.name : null;
  };

  const todayDate = new Date();
  const dayOfWeek = (todayDate.getDay() + 6) % 7;
  const weekdayName = WEEKDAYS_FULL_RU[dayOfWeek];

  return (
    <div className="space-y-6">
      {/* Top Banner / Summary Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-[#151A21] via-[#11151B] to-[#151A21] border border-[#242A33] shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
            <Clock size={14} />
            <span>{weekdayName}, {formatDateReadable(todayStr, false)}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#F5F7FA] tracking-tight">
            Сегодня {todayTasks.length} {todayTasks.length === 1 ? 'задача' : todayTasks.length < 5 ? 'задачи' : 'задач'} и {overdueTasks.length > 0 ? `${overdueTasks.length} требует внимания` : 'день под контролем'}
          </h2>
          <p className="text-xs sm:text-sm text-[#8B93A1] mt-1">
            Выполнено {completedTodayTasks.length} из {todayTasks.length} запланированных дел • Баланс: {formatMoney(finSummary.balance, settings.defaultCurrency)}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => navigate('/today')}
            className="text-xs"
          >
            Режим &quot;Сегодня&quot; <ArrowRight size={14} />
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => openTaskModal(null, todayStr)}
            className="text-xs font-semibold"
          >
            <Plus size={14} /> Новая задача
          </Button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <StatCard
          label="Сегодня"
          value={`${todayTasks.length}`}
          subValue={`${completedTodayTasks.length} выполнено`}
          icon={<Clock size={16} />}
          colorScheme="primary"
          onClick={() => navigate('/today')}
        />
        <StatCard
          label="Выполнено"
          value={`${completedTodayTasks.length}`}
          subValue={todayTasks.length > 0 ? `${formatPercentage(completedTodayTasks.length, todayTasks.length)}% за день` : '100%'}
          icon={<CheckCircle2 size={16} />}
          colorScheme="success"
          onClick={() => navigate('/today')}
        />
        <StatCard
          label="Просрочено"
          value={`${overdueTasks.length}`}
          subValue={overdueTasks.length > 0 ? 'Требует переноса' : 'Все в графике'}
          icon={<AlertTriangle size={16} />}
          colorScheme={overdueTasks.length > 0 ? 'danger' : 'default'}
          onClick={() => navigate('/tasks')}
        />
        <StatCard
          label="Баланс"
          value={formatMoney(finSummary.balance, settings.defaultCurrency)}
          subValue={`Доход: +${formatMoney(finSummary.totalIncome, settings.defaultCurrency)}`}
          icon={<CircleDollarSign size={16} />}
          colorScheme="default"
          onClick={() => navigate('/finance')}
        />
        <StatCard
          label="Мне должны"
          value={formatMoney(finSummary.receivables, settings.defaultCurrency)}
          subValue="Дебиторка"
          icon={<ArrowDownRight size={16} />}
          colorScheme="success"
          onClick={() => navigate('/debts')}
        />
        <StatCard
          label="Я должен"
          value={formatMoney(finSummary.payables, settings.defaultCurrency)}
          subValue="Кредиторка"
          icon={<ArrowUpRight size={16} />}
          colorScheme={finSummary.payables > 0 ? 'warning' : 'default'}
          onClick={() => navigate('/debts')}
        />
      </div>

      {/* Main Grid: Today Tasks & Side Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 cols: Today Tasks & Upcoming */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today Tasks Section */}
          <Card>
            <CardHeader
              title="Задачи на сегодня"
              subtitle={`План на ${formatDateReadable(todayStr, false)}`}
              action={
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate('/tasks')}
                  className="text-xs"
                >
                  Все задачи <ChevronRight size={14} />
                </Button>
              }
            />

            <CardContent>
              {todayTasks.length === 0 ? (
                <EmptyState
                  icon={CalendarIcon}
                  title="На сегодня нет задач"
                  description="Отличный момент, чтобы запланировать ключевые дела или отдохнуть."
                  actionText="+ Добавить задачу"
                  onAction={() => openTaskModal(null, todayStr)}
                />
              ) : (
                <div className="space-y-2">
                  {todayTasks.map((task: Task) => {
                    const isCompleted = task.status === 'completed';
                    const projectName = getProjectName(task.projectId);
                    return (
                      <div
                        key={task.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition group ${
                          isCompleted
                            ? 'bg-[#151A21]/50 border-[#242A33]/50 opacity-70'
                            : 'bg-[#151A21] border-[#242A33] hover:border-[#353D4A]'
                        }`}
                      >
                        <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={isCompleted}
                            onChange={() => toggleTaskStatus(task.id)}
                            className="mt-0.5 sm:mt-0 w-4 h-4 rounded border-[#242A33] text-[#6366F1] focus:ring-[#6366F1] cursor-pointer accent-[#6366F1] shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                onClick={() => openTaskModal(task)}
                                className={`text-xs sm:text-sm font-medium cursor-pointer transition hover:text-indigo-400 ${
                                  isCompleted
                                    ? 'line-through text-[#8B93A1]'
                                    : 'text-[#F5F7FA]'
                                }`}
                              >
                                {task.title}
                              </span>
                              <PriorityBadge priority={task.priority} />
                              {projectName && (
                                <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#1C232D] text-[#8B93A1] border border-[#242A33]">
                                  {projectName}
                                </span>
                              )}
                            </div>
                            {task.description && (
                              <p className="text-xs text-[#8B93A1] truncate mt-0.5">
                                {task.description}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Right actions: time & action buttons */}
                        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#242A33]/40">
                          {task.dueTime && (
                            <span className="text-xs font-mono text-[#8B93A1] flex items-center gap-1">
                              <Clock size={12} className="text-[#6366F1]" />
                              {task.dueTime}
                            </span>
                          )}
                          <StatusBadge status={task.status} />
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={() => openTaskModal(task)}
                              className="p-1 rounded text-xs text-[#8B93A1] hover:text-[#F5F7FA] hover:bg-[#1C232D] transition cursor-pointer"
                              title="Редактировать"
                            >
                              Правка
                            </button>
                            <button
                              onClick={() => {
                                const d = new Date();
                                d.setDate(d.getDate() + 1);
                                const tomorrow = d.toISOString().split('T')[0];
                                rescheduleTask(task.id, tomorrow);
                              }}
                              className="p-1 rounded text-xs text-[#8B93A1] hover:text-indigo-400 hover:bg-[#1C232D] transition cursor-pointer"
                              title="Перенести на завтра"
                            >
                              Завтра
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Section */}
          <Card>
            <CardHeader
              title="Ближайшие дела и дедлайны"
              subtitle="Планы на следующие дни"
              action={
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate('/calendar')}
                  className="text-xs"
                >
                  Календарь <ChevronRight size={14} />
                </Button>
              }
            />

            <CardContent>
              {upcomingTasks.length === 0 ? (
                <p className="text-xs text-[#8B93A1] py-4 text-center">
                  Нет запланированных дел на ближайшие дни
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {upcomingTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => openTaskModal(task)}
                      className="p-3.5 rounded-xl bg-[#151A21] border border-[#242A33] hover:border-[#353D4A] transition cursor-pointer flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-xs font-semibold text-[#6366F1]">
                            {formatRelativeDate(task.dueDate, task.dueTime)}
                          </span>
                          <PriorityBadge priority={task.priority} />
                        </div>
                        <h4 className="text-xs sm:text-sm font-semibold text-[#F5F7FA] line-clamp-1">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-[#8B93A1] line-clamp-1 mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#242A33]/50 text-[11px] text-[#8B93A1]">
                        <span>{task.category}</span>
                        {getProjectName(task.projectId) && (
                          <span className="truncate max-w-[120px]">
                            {getProjectName(task.projectId)}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right 1 col: Finance Overview, Productivity, Goals */}
        <div className="space-y-6">
          {/* Finance Overview Widget */}
          <Card>
            <CardHeader
              title="Финансы"
              subtitle={`В валюте: ${settings.defaultCurrency}`}
              action={
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate('/finance')}
                  className="text-xs"
                >
                  Детали <ChevronRight size={14} />
                </Button>
              }
            />

            <CardContent className="space-y-3">
              <div className="p-3.5 rounded-xl bg-[#151A21] border border-[#242A33]">
                <div className="text-xs text-[#8B93A1]">Текущий баланс</div>
                <div className="text-xl font-bold text-[#F5F7FA] mt-0.5">
                  {formatMoney(finSummary.balance, settings.defaultCurrency)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/20">
                  <div className="text-[11px] text-[#22C55E] font-medium">Доходы</div>
                  <div className="text-sm font-bold text-[#F5F7FA] mt-0.5">
                    +{formatMoney(finSummary.totalIncome, settings.defaultCurrency)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20">
                  <div className="text-[11px] text-[#EF4444] font-medium">Расходы</div>
                  <div className="text-sm font-bold text-[#F5F7FA] mt-0.5">
                    -{formatMoney(finSummary.totalExpenses, settings.defaultCurrency)}
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#151A21] border border-[#242A33] flex justify-between items-center text-xs">
                <span className="text-[#8B93A1]">Чистая позиция (с долгами):</span>
                <span className="font-bold text-[#F5F7FA]">
                  {formatMoney(finSummary.netWorth, settings.defaultCurrency)}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Productivity Chart */}
          <Card>
            <CardHeader
              title="Продуктивность"
              subtitle="Выполненные задачи за неделю"
            />

            <CardContent>
              <div className="h-40 w-full pt-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productivityData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <XAxis dataKey="day" stroke="#576071" fontSize={11} tickLine={false} />
                    <YAxis stroke="#576071" fontSize={11} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#151A21',
                        borderColor: '#242A33',
                        borderRadius: '8px',
                        fontSize: '12px',
                        color: '#F5F7FA',
                      }}
                      cursor={{ fill: '#1C232D' }}
                    />
                    <Bar dataKey="completed" name="Выполнено" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Active Goals Widget */}
          <Card>
            <CardHeader
              title="Активные цели"
              subtitle="Прогресс ключевых ориентиров"
              action={
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate('/goals')}
                  className="text-xs"
                >
                  Все цели <ChevronRight size={14} />
                </Button>
              }
            />

            <CardContent className="space-y-3">
              {goals.slice(0, 3).map((goal) => {
                const percent = formatPercentage(goal.currentAmount, goal.targetAmount);
                return (
                  <div
                    key={goal.id}
                    onClick={() => openGoalModal(goal)}
                    className="p-3 rounded-xl bg-[#151A21] border border-[#242A33] hover:border-[#353D4A] transition cursor-pointer space-y-2"
                  >
                    <div className="flex justify-between items-start text-xs">
                      <span className="font-semibold text-[#F5F7FA] line-clamp-1">{goal.title}</span>
                      <span className="font-bold text-[#6366F1] shrink-0 ml-2">{percent}%</span>
                    </div>
                    <ProgressBar value={percent} color={percent >= 100 ? 'success' : 'primary'} size="sm" />
                    <div className="flex justify-between text-[11px] text-[#8B93A1]">
                      <span>{goal.category}</span>
                      <span>
                        {goal.currentAmount} / {goal.targetAmount} {goal.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
