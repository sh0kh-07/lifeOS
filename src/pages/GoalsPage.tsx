import React, { useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Plus,
  Sparkles,
  Target,
  Trash2,
  Trophy,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, ProgressBar } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { useApp } from '../context/AppContext';
import { Goal } from '../types';
import { formatDateReadable, formatRelativeDate } from '../utils/date';
import { formatPercentage } from '../utils/format';

export const GoalsPage: React.FC = () => {
  const {
    goals,
    openGoalModal,
    deleteGoal,
    updateGoal,
    toggleMilestone,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'achieved'>('all');
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  const filteredGoals = goals.filter((g) => {
    if (filterStatus === 'all') return true;
    return g.status === filterStatus;
  });

  const activeGoalsCount = goals.filter((g) => g.status === 'active').length;
  const achievedGoalsCount = goals.filter((g) => g.status === 'achieved').length;

  const handleQuickIncrement = (goal: Goal, delta: number) => {
    const nextAmount = Math.max(0, goal.currentAmount + delta);
    const isCompleted = nextAmount >= goal.targetAmount;
    updateGoal(goal.id, {
      currentAmount: nextAmount,
      status: isCompleted ? 'achieved' : goal.status,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">Цели и ориентиры</h1>
          <p className="text-xs sm:text-sm text-[#8B93A1]">
            Стратегические цели с измеримыми метриками и этапами ({activeGoalsCount} активных, {achievedGoalsCount} достигнуто)
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          onClick={() => openGoalModal()}
          className="font-semibold shadow-xs"
        >
          <Plus size={16} /> Поставить цель
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {[
          { key: 'all', label: `Все цели (${goals.length})` },
          { key: 'active', label: `В процессе (${activeGoalsCount})` },
          { key: 'achieved', label: `Достигнутые 🏆 (${achievedGoalsCount})` },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setFilterStatus(item.key as any)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              filterStatus === item.key
                ? 'bg-[#1C232D] text-[#F5F7FA] border border-[#242A33]'
                : 'text-[#8B93A1] hover:text-[#F5F7FA] hover:bg-[#11151B]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <EmptyState
          icon={Target}
          title="Нет целей в этом списке"
          description="Поставьте перед собой амбициозную измеримую цель и разбейте ее на этапы."
          actionText="+ Поставить первую цель"
          onAction={() => openGoalModal()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal: Goal) => {
            const percent = formatPercentage(goal.currentAmount, goal.targetAmount);
            const isAchieved = goal.status === 'achieved' || percent >= 100;
            const isExpanded = expandedGoalId === goal.id;
            const completedMilestones = goal.milestones.filter((m) => m.completed).length;

            return (
              <Card
                key={goal.id}
                className={`flex flex-col justify-between transition border ${
                  isAchieved
                    ? 'border-emerald-500/40 bg-gradient-to-b from-[#151A21] to-emerald-950/10'
                    : 'border-[#242A33] hover:border-[#353D4A]'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-[#11151B] text-[#8B93A1] border border-[#242A33]">
                        {goal.category}
                      </span>
                      {isAchieved && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <Trophy size={11} /> Достигнута!
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openGoalModal(goal)}
                        className="text-xs text-[#8B93A1] hover:text-[#F5F7FA] p-1 rounded hover:bg-[#1C232D] transition cursor-pointer"
                      >
                        Правка
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="text-xs text-[#8B93A1] hover:text-red-400 p-1 rounded hover:bg-[#1C232D] transition cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <h3
                    onClick={() => openGoalModal(goal)}
                    className="text-base font-bold text-[#F5F7FA] hover:text-indigo-400 transition cursor-pointer"
                  >
                    {goal.title}
                  </h3>

                  {goal.description && (
                    <p className="text-xs text-[#8B93A1] mt-1 line-clamp-2">
                      {goal.description}
                    </p>
                  )}

                  {/* Progress Gauge */}
                  <div className="space-y-2 my-4 p-3 rounded-xl bg-[#11151B] border border-[#242A33]">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[#8B93A1]">Прогресс:</span>
                      <div className="text-right">
                        <span className="text-sm font-bold text-[#F5F7FA]">
                          {goal.currentAmount}
                        </span>
                        <span className="text-xs text-[#8B93A1] ml-1">
                          / {goal.targetAmount} {goal.unit}
                        </span>
                        <span className="text-xs font-bold text-indigo-400 ml-2">
                          ({percent}%)
                        </span>
                      </div>
                    </div>
                    <ProgressBar
                      value={percent}
                      color={isAchieved ? 'success' : 'primary'}
                      size="md"
                    />

                    {/* Quick increment buttons */}
                    <div className="flex items-center justify-between pt-2 border-t border-[#242A33]/60 text-xs">
                      <span className="text-[11px] text-[#576071]">Быстрый ввод:</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleQuickIncrement(goal, 1)}
                          className="px-2 py-0.5 rounded bg-[#1C232D] text-[#F5F7FA] hover:bg-indigo-600 transition cursor-pointer font-mono"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleQuickIncrement(goal, 5)}
                          className="px-2 py-0.5 rounded bg-[#1C232D] text-[#F5F7FA] hover:bg-indigo-600 transition cursor-pointer font-mono"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleQuickIncrement(goal, 10)}
                          className="px-2 py-0.5 rounded bg-[#1C232D] text-[#F5F7FA] hover:bg-indigo-600 transition cursor-pointer font-mono"
                        >
                          +10
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Milestones toggle */}
                  {goal.milestones.length > 0 && (
                    <div className="pt-1">
                      <button
                        onClick={() => setExpandedGoalId(isExpanded ? null : goal.id)}
                        className="w-full flex items-center justify-between text-xs text-[#8B93A1] hover:text-[#F5F7FA] py-1 cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 size={13} className="text-indigo-400" />
                          Контрольные этапы ({completedMilestones}/{goal.milestones.length})
                        </span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      {isExpanded && (
                        <div className="space-y-1.5 mt-2 pt-2 border-t border-[#242A33]">
                          {goal.milestones.map((m) => (
                            <label
                              key={m.id}
                              className="flex items-center justify-between p-2 rounded-lg bg-[#11151B] text-xs hover:bg-[#1C232D] transition cursor-pointer select-none"
                            >
                              <div className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={m.completed}
                                  onChange={() => toggleMilestone(goal.id, m.id)}
                                  className="w-3.5 h-3.5 rounded border-[#242A33] text-indigo-600 focus:ring-indigo-500 cursor-pointer accent-indigo-600"
                                />
                                <span
                                  className={
                                    m.completed
                                      ? 'line-through text-[#8B93A1]'
                                      : 'text-[#F5F7FA]'
                                  }
                                >
                                  {m.title}
                                </span>
                              </div>
                              {m.target > 0 && (
                                <span className="text-[11px] text-[#8B93A1] font-mono">
                                  {m.target} {goal.unit}
                                </span>
                              )}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Deadline */}
                <div className="pt-3 mt-3 border-t border-[#242A33] flex items-center justify-between text-[11px] text-[#8B93A1]">
                  {goal.deadline ? (
                    <span className="flex items-center gap-1">
                      <Clock size={12} className="text-indigo-400" />
                      Дедлайн: {formatDateReadable(goal.deadline, false)}
                    </span>
                  ) : (
                    <span>Срок не ограничен</span>
                  )}

                  <span className="text-[10px] text-[#576071] font-mono">
                    {goal.status === 'achieved' ? 'Завершена' : 'В фокусе'}
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
