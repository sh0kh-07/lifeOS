import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  FileText,
  History,
  Plus,
  Trash2,
  User,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, ProgressBar, StatCard } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { useApp } from '../context/AppContext';
import { Currency, Debt, DebtType } from '../types';
import { formatDateReadable, isDateOverdue } from '../utils/date';
import { formatMoney, formatPercentage } from '../utils/format';

export const DebtsPage: React.FC = () => {
  const {
    debts = [],
    debtPayments = [],
    settings,
    openDebtModal,
    openPaymentModal,
    deleteDebt,
    settleDebtFull,
    getDebtRemaining,
    getDebtPaidAmount,
    getFinancialSummary,
  } = useApp();

  const [activeTab, setActiveTab] = useState<DebtType | 'history'>('they_owe');
  const [selectedCurrency] = useState<Currency>(settings?.defaultCurrency || 'USD');

  const summary = getFinancialSummary(selectedCurrency) || {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    receivables: 0,
    payables: 0,
    netWorth: 0,
  };

  const safeDebts = Array.isArray(debts) ? debts : [];
  const safePayments = Array.isArray(debtPayments) ? debtPayments : [];

  const filteredDebts = safeDebts.filter((d) => {
    if (!d) return false;
    if (activeTab === 'history') {
      return d.status === 'paid';
    }
    return d.type === activeTab && d.status !== 'paid';
  });

  const theyOweCount = safeDebts.filter((d) => d && d.type === 'they_owe' && d.status !== 'paid').length;
  const iOweCount = safeDebts.filter((d) => d && d.type === 'i_owe' && d.status !== 'paid').length;
  const paidCount = safeDebts.filter((d) => d && d.status === 'paid').length;

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">Долги и обязательства</h1>
          <p className="text-xs sm:text-sm text-[#8B93A1]">
            Фиксация займов, контроль дебиторской и кредиторской задолженности, история платежей
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="primary"
            onClick={() => openDebtModal()}
            className="font-semibold shadow-xs"
          >
            <Plus size={16} /> Добавить долг
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Мне должны (Дебиторка)"
          value={formatMoney(summary.receivables || 0, selectedCurrency)}
          subValue={`${theyOweCount} активных записей`}
          icon={<ArrowDownRight size={16} />}
          colorScheme="success"
          onClick={() => setActiveTab('they_owe')}
        />
        <StatCard
          label="Я должен (Кредиторка)"
          value={formatMoney(summary.payables || 0, selectedCurrency)}
          subValue={`${iOweCount} активных обязательств`}
          icon={<ArrowUpRight size={16} />}
          colorScheme={(summary.payables || 0) > 0 ? 'warning' : 'default'}
          onClick={() => setActiveTab('i_owe')}
        />
        <StatCard
          label="Сальдо по долгам"
          value={formatMoney((summary.receivables || 0) - (summary.payables || 0), selectedCurrency)}
          subValue="Разница требований и долгов"
          icon={<CreditCard size={16} />}
          colorScheme={(summary.receivables || 0) >= (summary.payables || 0) ? 'primary' : 'danger'}
        />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#242A33] pb-3">
        <button
          onClick={() => setActiveTab('they_owe')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'they_owe'
              ? 'bg-[#1C232D] text-emerald-400 border border-[#242A33]'
              : 'text-[#8B93A1] hover:text-[#F5F7FA] hover:bg-[#11151B]'
          }`}
        >
          <ArrowDownRight size={15} />
          Мне должны ({theyOweCount})
        </button>

        <button
          onClick={() => setActiveTab('i_owe')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'i_owe'
              ? 'bg-[#1C232D] text-amber-400 border border-[#242A33]'
              : 'text-[#8B93A1] hover:text-[#F5F7FA] hover:bg-[#11151B]'
          }`}
        >
          <ArrowUpRight size={15} />
          Я должен ({iOweCount})
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-[#1C232D] text-indigo-400 border border-[#242A33]'
              : 'text-[#8B93A1] hover:text-[#F5F7FA] hover:bg-[#11151B]'
          }`}
        >
          <History size={15} />
          Погашенные ({paidCount})
        </button>
      </div>

      {/* Debt Cards Grid */}
      {filteredDebts.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={
            activeTab === 'they_owe'
              ? 'Вам никто ничего не должен'
              : activeTab === 'i_owe'
              ? 'У вас нет непогашенных долгов'
              : 'Нет истории закрытых долгов'
          }
          description="Все обязательства закрыты или еще не зафиксированы в системе."
          actionText="+ Зафиксировать долг"
          onAction={() => openDebtModal(null, activeTab === 'i_owe' ? 'i_owe' : 'they_owe')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDebts.map((debt: Debt) => {
            const paid = getDebtPaidAmount ? getDebtPaidAmount(debt.id) : 0;
            const remaining = getDebtRemaining ? getDebtRemaining(debt) : debt.totalAmount;
            const percent = formatPercentage(paid, debt.totalAmount);
            const isOverdue = debt.deadlineDate && isDateOverdue(debt.deadlineDate) && debt.status !== 'paid';
            const isTheyOwe = debt.type === 'they_owe';

            return (
              <Card
                key={debt.id}
                className={`flex flex-col justify-between transition-all border ${
                  debt.status === 'paid'
                    ? 'border-[#242A33] opacity-80'
                    : isOverdue
                    ? 'border-[#EF4444]/50 bg-[#EF4444]/5'
                    : isTheyOwe
                    ? 'border-[#242A33] hover:border-[#22C55E]/40'
                    : 'border-[#242A33] hover:border-[#F59E0B]/40'
                }`}
              >
                <div>
                  {/* Top Bar: Contact and Type Tag */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                          debt.status === 'paid'
                            ? 'bg-[#151A21] border border-[#242A33] text-[#8B93A1]'
                            : isTheyOwe
                            ? 'bg-[#22C55E]/10 border border-[#22C55E]/25 text-[#22C55E]'
                            : 'bg-[#F59E0B]/10 border border-[#F59E0B]/25 text-[#F59E0B]'
                        }`}
                      >
                        <User size={16} />
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-sm font-bold text-[#F5F7FA] truncate">
                          {debt.personName}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span
                            className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              debt.status === 'paid'
                                ? 'bg-[#151A21] text-[#8B93A1] border border-[#242A33]'
                                : isTheyOwe
                                ? 'bg-[#22C55E]/15 text-[#22C55E]'
                                : 'bg-[#F59E0B]/15 text-[#F59E0B]'
                            }`}
                          >
                            {debt.status === 'paid' ? 'Погашен' : isTheyOwe ? 'Мне должны' : 'Я должен'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openDebtModal(debt)}
                        className="text-xs text-[#8B93A1] hover:text-[#F5F7FA] p-1.5 rounded-lg hover:bg-[#151A21] transition cursor-pointer"
                        title="Редактировать"
                      >
                        Правка
                      </button>
                      <button
                        onClick={() => deleteDebt(debt.id)}
                        className="text-xs text-[#8B93A1] hover:text-[#EF4444] p-1.5 rounded-lg hover:bg-[#151A21] transition cursor-pointer"
                        title="Удалить"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Reason & Amount Box with High Contrast */}
                  <div className="p-3.5 rounded-xl bg-[#151A21] border border-[#242A33] space-y-2 mb-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-[#8B93A1]">
                        {debt.status === 'paid' ? 'Сумма долга:' : 'Остаток к возврату:'}
                      </span>
                      <span
                        className={`text-lg font-bold font-mono ${
                          debt.status === 'paid'
                            ? 'text-[#8B93A1] line-through'
                            : isTheyOwe
                            ? 'text-[#22C55E]'
                            : 'text-[#F59E0B]'
                        }`}
                      >
                        {formatMoney(debt.status === 'paid' ? debt.totalAmount : remaining, debt.currency)}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs text-[#8B93A1]">
                      <span>Общая сумма:</span>
                      <span className="text-[#F5F7FA] font-medium font-mono">
                        {formatMoney(debt.totalAmount, debt.currency)}
                      </span>
                    </div>

                    {paid > 0 && debt.status !== 'paid' && (
                      <div className="space-y-1 pt-1.5 border-t border-[#242A33]/60">
                        <div className="flex justify-between text-[11px] text-[#8B93A1]">
                          <span>Выплачено:</span>
                          <span className="text-[#22C55E] font-medium font-mono">
                            {formatMoney(paid, debt.currency)} ({percent}%)
                          </span>
                        </div>
                        <ProgressBar value={percent} color="success" size="sm" />
                      </div>
                    )}
                  </div>

                  {debt.reason && (
                    <p className="text-xs text-[#8B93A1] line-clamp-2 mb-3 bg-[#151A21]/40 px-2.5 py-1.5 rounded-lg border border-[#242A33]/40">
                      {debt.reason}
                    </p>
                  )}

                  {/* Payment History preview if any */}
                  {(() => {
                    const payments = safePayments.filter((p) => p && p.debtId === debt.id);
                    if (payments.length === 0) return null;
                    return (
                      <div className="mb-3 p-2.5 rounded-lg bg-[#151A21] border border-[#242A33] text-[11px] text-[#8B93A1] space-y-1">
                        <div className="font-semibold text-[#F5F7FA]">История выплат:</div>
                        {payments.slice(-2).map((p) => (
                          <div key={p.id} className="flex justify-between">
                            <span>{p.date ? formatDateReadable(p.date, false) : ''}</span>
                            <span className="font-mono text-[#22C55E] font-medium">
                              +{formatMoney(p.amount, debt.currency)}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Bottom Actions & Dates */}
                <div className="pt-3 border-t border-[#242A33] space-y-3">
                  <div className="flex items-center justify-between text-[11px] text-[#8B93A1]">
                    <span>Выдан: {debt.startDate ? formatDateReadable(debt.startDate, false) : '—'}</span>
                    {debt.deadlineDate && (
                      <span
                        className={`flex items-center gap-1 font-medium ${
                          isOverdue ? 'text-[#EF4444]' : 'text-[#8B93A1]'
                        }`}
                      >
                        {isOverdue && <AlertTriangle size={12} />}
                        До: {formatDateReadable(debt.deadlineDate, false)}
                      </span>
                    )}
                  </div>

                  {debt.status !== 'paid' && (
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openPaymentModal(debt)}
                        className="text-xs py-1.5 font-medium"
                      >
                        Внести платеж
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => settleDebtFull && settleDebtFull(debt.id)}
                        className="text-xs py-1.5 font-medium"
                      >
                        Закрыть весь
                      </Button>
                    </div>
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
