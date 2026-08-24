import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getTodayDateString } from '../../utils/date';
import { formatMoney } from '../../utils/format';
import { Button } from '../ui/Button';
import { Input, Textarea } from '../ui/Input';
import { Modal } from '../ui/Modal';

export const DebtPaymentModal: React.FC = () => {
  const {
    isPaymentModalOpen,
    closePaymentModal,
    paymentTargetDebt,
    addDebtPayment,
    getDebtRemaining,
    getDebtPaidAmount,
  } = useApp();

  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(getTodayDateString());
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setAmount('');
    setDate(getTodayDateString());
    setNote('');
    setError('');
  }, [isPaymentModalOpen, paymentTargetDebt]);

  if (!paymentTargetDebt) return null;

  const paidAmount = getDebtPaidAmount(paymentTargetDebt.id);
  const remaining = getDebtRemaining(paymentTargetDebt);
  const enteredAmount = parseFloat(amount) || 0;
  const newRemaining = Math.max(0, remaining - enteredAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredAmount <= 0) {
      setError('Укажите корректную сумму платежа');
      return;
    }
    if (enteredAmount > remaining) {
      setError(`Сумма платежа не может превышать остаток (${formatMoney(remaining, paymentTargetDebt.currency)})`);
      return;
    }
    if (!date) {
      setError('Укажите дату платежа');
      return;
    }

    addDebtPayment(paymentTargetDebt.id, enteredAmount, date, note.trim() || undefined);
    closePaymentModal();
  };

  return (
    <Modal
      isOpen={isPaymentModalOpen}
      onClose={closePaymentModal}
      title="Внести платеж по долгу"
      subtitle={`Контрагент: ${paymentTargetDebt.personName}`}
      maxWidth="sm"
      footer={
        <>
          <Button variant="secondary" size="sm" type="button" onClick={closePaymentModal}>
            Отмена
          </Button>
          <Button variant="primary" size="sm" type="button" onClick={handleSubmit}>
            Подтвердить платеж
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Debt state overview card */}
        <div className="p-3.5 bg-[#11151B] border border-[#242A33] rounded-xl space-y-2 text-xs">
          <div className="flex justify-between text-[#8B93A1]">
            <span>Общая сумма долга:</span>
            <span className="font-semibold text-[#F5F7FA]">
              {formatMoney(paymentTargetDebt.totalAmount, paymentTargetDebt.currency)}
            </span>
          </div>
          <div className="flex justify-between text-[#8B93A1]">
            <span>Уже выплачено:</span>
            <span className="text-emerald-400 font-medium">
              {formatMoney(paidAmount, paymentTargetDebt.currency)}
            </span>
          </div>
          <div className="flex justify-between text-[#8B93A1] pt-1.5 border-t border-[#242A33]">
            <span>Текущий остаток:</span>
            <span className="font-bold text-[#F5F7FA] text-sm">
              {formatMoney(remaining, paymentTargetDebt.currency)}
            </span>
          </div>
        </div>

        <Input
          label={`Сумма платежа (${paymentTargetDebt.currency})`}
          type="number"
          step="0.01"
          min="0.01"
          max={remaining}
          placeholder="0.00"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError('');
          }}
          error={error}
          required
          autoFocus
          rightElement={
            <button
              type="button"
              onClick={() => setAmount(String(remaining))}
              className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
            >
              Вся сумма
            </button>
          }
        />

        {enteredAmount > 0 && enteredAmount <= remaining && (
          <div className="p-2.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs flex justify-between items-center text-indigo-300">
            <span>Останется после платежа:</span>
            <span className="font-bold">
              {formatMoney(newRemaining, paymentTargetDebt.currency)}
            </span>
          </div>
        )}

        <Input
          label="Дата платежа"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <Textarea
          label="Комментарий (опционально)"
          placeholder="Номер транзакции, чек, способ перевода..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
      </form>
    </Modal>
  );
};
