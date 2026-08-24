import React from 'react';
import {
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  Clock,
  PieChart as PieIcon,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, StatCard } from '../components/ui/Card';
import { useApp } from '../context/AppContext';
import { formatMoney, formatPercentage } from '../utils/format';

export const ReportsPage: React.FC = () => {
  const { tasks, projects, goals, transactions, settings, getFinancialSummary } = useApp();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'completed').length;
  const overdueTasks = tasks.filter((t) => t.status !== 'completed' && t.dueDate < new Date().toISOString().split('T')[0]).length;
  const taskCompletionRate = formatPercentage(completedTasks, totalTasks);

  const finSummary = getFinancialSummary(settings.defaultCurrency);

  // Category breakdown for tasks
  const categoryMap: Record<string, { total: number; completed: number }> = {};
  tasks.forEach((t) => {
    if (!categoryMap[t.category]) {
      categoryMap[t.category] = { total: 0, completed: 0 };
    }
    categoryMap[t.category].total += 1;
    if (t.status === 'completed') categoryMap[t.category].completed += 1;
  });

  const taskCategoryData = Object.entries(categoryMap).map(([category, val]) => ({
    category,
    total: val.total,
    completed: val.completed,
  }));

  // Weekly productivity trend
  const weeklyProductivity = [
    { day: 'Пн', tasksDone: 5, hours: 6.5 },
    { day: 'Вт', tasksDone: 4, hours: 5.0 },
    { day: 'Ср', tasksDone: 7, hours: 7.2 },
    { day: 'Чт', tasksDone: 3, hours: 4.0 },
    { day: 'Пт', tasksDone: 6, hours: 6.8 },
    { day: 'Сб', tasksDone: 2, hours: 2.5 },
    { day: 'Вс', tasksDone: 4, hours: 3.5 },
  ];

  // Priority distribution
  const priorityMap: Record<string, number> = {
    Срочно: tasks.filter((t) => t.priority === 'urgent').length,
    Высокий: tasks.filter((t) => t.priority === 'high').length,
    Средний: tasks.filter((t) => t.priority === 'medium').length,
    Низкий: tasks.filter((t) => t.priority === 'low').length,
  };

  const priorityData = Object.entries(priorityMap).map(([name, value], i) => {
    const colors = ['#EF4444', '#F59E0B', '#6366F1', '#10B981'];
    return { name, value, color: colors[i % colors.length] };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">Отчёты и аналитика</h1>
        <p className="text-xs sm:text-sm text-[#8B93A1]">
          Сводная статистика продуктивности, распределения времени и финансовой эффективности
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Общая завершенность"
          value={`${taskCompletionRate}%`}
          subValue={`${completedTasks} из ${totalTasks} задач`}
          icon={<CheckCircle2 size={16} />}
          colorScheme="primary"
        />
        <StatCard
          label="Просроченные дела"
          value={`${overdueTasks}`}
          subValue="Требуют внимания"
          icon={<Clock size={16} />}
          colorScheme={overdueTasks > 0 ? 'danger' : 'default'}
        />
        <StatCard
          label="Чистый баланс"
          value={formatMoney(finSummary.balance, settings.defaultCurrency)}
          subValue={`Доходы / Расходы`}
          icon={<CircleDollarSign size={16} />}
          colorScheme="success"
        />
        <StatCard
          label="Активные цели"
          value={`${goals.length}`}
          subValue={`${goals.filter((g) => g.status === 'achieved').length} достигнуто`}
          icon={<Target size={16} />}
          colorScheme="default"
        />
      </div>

      {/* Productivity Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly tasks vs hours */}
        <Card noPadding>
          <CardHeader
            title="Динамика выполнения задач"
            subtitle="Количество завершенных дел по дням недели"
          />
          <CardContent>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyProductivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  />
                  <Bar dataKey="tasksDone" name="Выполнено задач" fill="#6366F1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Tasks by Category */}
        <Card noPadding>
          <CardHeader
            title="Задачи по категориям"
            subtitle="Соотношение запланированных и выполненных"
          />
          <CardContent>
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskCategoryData} layout="vertical" margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
                  <XAxis type="number" stroke="#576071" fontSize={11} tickLine={false} />
                  <YAxis dataKey="category" type="category" stroke="#8B93A1" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151A21',
                      borderColor: '#242A33',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#F5F7FA',
                    }}
                  />
                  <Bar dataKey="total" name="Всего" fill="#242A33" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="completed" name="Выполнено" fill="#10B981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Priority & Goals Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card noPadding>
          <CardHeader
            title="Распределение по приоритетам"
            subtitle="Срочность текущего бэклога"
          />
          <CardContent>
            <div className="h-48 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={priorityData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={65}
                    paddingAngle={3}
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151A21',
                      borderColor: '#242A33',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#F5F7FA',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 text-xs text-[#8B93A1] pt-2">
              {priorityData.map((p) => (
                <div key={p.name} className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span>
                    {p.name}: <strong className="text-[#F5F7FA]">{p.value}</strong>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card noPadding>
          <CardHeader
            title="Прогресс стратегических целей"
            subtitle="Текущее выполнение ключевых результатов"
          />
          <CardContent>
            <div className="space-y-3 pt-2">
              {goals.map((g) => {
                const percent = formatPercentage(g.currentAmount, g.targetAmount);
                return (
                  <div key={g.id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#F5F7FA] font-medium">{g.title}</span>
                      <span className="font-mono text-indigo-400 font-bold">{percent}%</span>
                    </div>
                    <div className="w-full bg-[#11151B] h-2 rounded-full overflow-hidden border border-[#242A33]">
                      <div
                        className="bg-indigo-500 h-full rounded-full transition-all"
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
