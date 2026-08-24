import React, { useMemo, useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleDollarSign,
  CreditCard,
  Filter,
  PieChart as PieIcon,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, StatCard } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { useApp } from '../context/AppContext';
import { Currency, Transaction, TransactionType } from '../types';
import { formatDateReadable, formatRelativeDate } from '../utils/date';
import { formatMoney } from '../utils/format';

export const FinancePage: React.FC = () => {
  const {
    transactions,
    settings,
    openTransactionModal,
    deleteTransaction,
    getFinancialSummary,
  } = useApp();

  const [selectedCurrency, setSelectedCurrency] = useState<Currency>(settings.defaultCurrency);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const summary = getFinancialSummary(selectedCurrency);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (t.currency !== selectedCurrency) return false;
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchCat = t.category.toLowerCase().includes(q);
        if (!matchDesc && !matchCat) return false;
      }
      return true;
    });
  }, [transactions, selectedCurrency, typeFilter, categoryFilter, search]);

  // Unique categories for the current currency
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    transactions
      .filter((t) => t.currency === selectedCurrency)
      .forEach((t) => set.add(t.category));
    return ['all', ...Array.from(set)];
  }, [transactions, selectedCurrency]);

  // Cashflow timeline chart data
  const chartData = useMemo(() => {
    // Generate recent monthly / date aggregated buckets
    const map: Record<string, { date: string; income: number; expense: number }> = {};
    const sorted = [...transactions]
      .filter((t) => t.currency === selectedCurrency)
      .sort((a, b) => a.date.localeCompare(b.date));

    sorted.forEach((t) => {
      const label = t.date.slice(5); // MM-DD
      if (!map[label]) {
        map[label] = { date: label, income: 0, expense: 0 };
      }
      if (t.type === 'income') map[label].income += t.amount;
      if (t.type === 'expense') map[label].expense += t.amount;
    });

    const list = Object.values(map);
    return list.length > 0
      ? list
      : [
          { date: '08-18', income: 1200, expense: 350 },
          { date: '08-20', income: 500, expense: 120 },
          { date: '08-22', income: 2400, expense: 600 },
          { date: '08-24', income: 0, expense: 45 },
        ];
  }, [transactions, selectedCurrency]);

  // Expenses by Category for Pie Chart
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.currency === selectedCurrency && t.type === 'expense')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });

    const colors = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];
    return Object.entries(map).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length],
    }));
  }, [transactions, selectedCurrency]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">Финансы</h1>
          <p className="text-xs sm:text-sm text-[#8B93A1]">
            Учет баланса, доходов, расходов и аналитика денежных потоков
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Currency selector */}
          <select
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value as Currency)}
            className="bg-[#151A21] border border-[#242A33] text-xs font-semibold text-[#F5F7FA] rounded-xl px-3 py-2 outline-none cursor-pointer"
          >
            <option value="USD">USD ($)</option>
            <option value="UZS">UZS (сум)</option>
            <option value="EUR">EUR (€)</option>
            <option value="RUB">RUB (₽)</option>
          </select>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => openTransactionModal(null, 'income')}
            className="text-xs text-emerald-400 font-semibold"
          >
            <Plus size={14} /> Доход
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => openTransactionModal(null, 'expense')}
            className="text-xs font-semibold shadow-xs"
          >
            <Plus size={14} /> Расход
          </Button>
        </div>
      </div>

      {/* Financial KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Текущий баланс"
          value={formatMoney(summary.balance, selectedCurrency)}
          subValue="Свободные средства"
          icon={<Wallet size={16} />}
          colorScheme={summary.balance >= 0 ? 'primary' : 'danger'}
        />
        <StatCard
          label="Всего доходов"
          value={`+${formatMoney(summary.totalIncome, selectedCurrency)}`}
          subValue="Поступления"
          icon={<TrendingUp size={16} />}
          colorScheme="success"
        />
        <StatCard
          label="Всего расходов"
          value={`-${formatMoney(summary.totalExpenses, selectedCurrency)}`}
          subValue="Траты за период"
          icon={<TrendingDown size={16} />}
          colorScheme="danger"
        />
        <StatCard
          label="Чистая позиция (Net Worth)"
          value={formatMoney(summary.netWorth, selectedCurrency)}
          subValue={`Долги: +${formatMoney(summary.receivables, selectedCurrency)} / -${formatMoney(summary.payables, selectedCurrency)}`}
          icon={<CircleDollarSign size={16} />}
          colorScheme="default"
        />
      </div>

      {/* Charts Grid: Cashflow Timeline & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow Timeline */}
        <Card noPadding className="lg:col-span-2">
          <CardHeader
            title="Динамика доходов и расходов"
            subtitle={`Показатели в валюте ${selectedCurrency}`}
          />
          <CardContent>
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#576071" fontSize={11} tickLine={false} />
                  <YAxis stroke="#576071" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#151A21',
                      borderColor: '#242A33',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: '#F5F7FA',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    name="Доходы"
                    stroke="#10B981"
                    fillOpacity={1}
                    fill="url(#incomeGrad)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    name="Расходы"
                    stroke="#EF4444"
                    fillOpacity={1}
                    fill="url(#expenseGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card noPadding>
          <CardHeader
            title="Структура расходов"
            subtitle="Распределение по категориям"
          />
          <CardContent>
            {categoryData.length === 0 ? (
              <div className="py-16 text-center text-xs text-[#8B93A1]">
                Нет расходов в валюте {selectedCurrency}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="h-36 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={58}
                        paddingAngle={3}
                      >
                        {categoryData.map((entry, index) => (
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
                        formatter={(val: number) => formatMoney(val, selectedCurrency)}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend List */}
                <div className="space-y-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                  {categoryData.map((cat) => (
                    <div
                      key={cat.name}
                      className="flex items-center justify-between text-xs text-[#8B93A1]"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: cat.color }}
                        />
                        <span className="truncate max-w-[120px] text-[#F5F7FA]">{cat.name}</span>
                      </div>
                      <span className="font-semibold text-[#F5F7FA]">
                        {formatMoney(cat.value, selectedCurrency)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transactions Feed & Filter Table */}
      <Card noPadding>
        <CardHeader
          title="История операций"
          subtitle={`Записи (${filteredTransactions.length})`}
        />
        <CardContent>
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={14} className="absolute left-3 top-3 text-[#8B93A1]" />
              <input
                type="text"
                placeholder="Поиск по описанию или категории..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#11151B] border border-[#242A33] text-xs text-[#F5F7FA] placeholder-[#576071] rounded-lg pl-9 pr-3 py-2 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-[#11151B] border border-[#242A33] text-xs text-[#F5F7FA] rounded-lg px-3 py-2 outline-none cursor-pointer"
              >
                <option value="all">Все типы</option>
                <option value="expense">Расходы</option>
                <option value="income">Доходы</option>
              </select>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#11151B] border border-[#242A33] text-xs text-[#F5F7FA] rounded-lg px-3 py-2 outline-none cursor-pointer"
              >
                {availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c === 'all' ? 'Все категории' : c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          {filteredTransactions.length === 0 ? (
            <EmptyState
              icon={CreditCard}
              title="Операции не найдены"
              description="Запишите ваш первый доход или расход для отслеживания бюджета."
              actionText="+ Записать операцию"
              onAction={() => openTransactionModal(null, 'expense')}
            />
          ) : (
            <div className="divide-y divide-[#242A33]">
              {filteredTransactions.map((tx: Transaction) => {
                const isIncome = tx.type === 'income';

                return (
                  <div
                    key={tx.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#11151B]/60 p-2 rounded-xl transition group"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${
                          isIncome
                            ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/20'
                            : 'bg-red-950/30 text-red-400 border border-red-500/20'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownRight size={16} />
                        ) : (
                          <ArrowUpRight size={16} />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs sm:text-sm font-semibold text-[#F5F7FA] truncate">
                            {tx.description}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-[#11151B] text-[#8B93A1] border border-[#242A33]">
                            {tx.category}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#8B93A1] flex items-center gap-2 mt-0.5">
                          <span>{formatDateReadable(tx.date, false)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                      <div
                        className={`text-sm font-bold font-mono ${
                          isIncome ? 'text-emerald-400' : 'text-[#F5F7FA]'
                        }`}
                      >
                        {isIncome ? '+' : '-'}
                        {formatMoney(tx.amount, tx.currency)}
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={() => openTransactionModal(tx)}
                          className="text-xs text-[#8B93A1] hover:text-[#F5F7FA] p-1 rounded hover:bg-[#1C232D] transition cursor-pointer"
                        >
                          Правка
                        </button>
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="text-xs text-[#8B93A1] hover:text-red-400 p-1 rounded hover:bg-[#1C232D] transition cursor-pointer"
                        >
                          <Trash2 size={13} />
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
    </div>
  );
};
