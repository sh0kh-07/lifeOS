import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { getTodayDateString } from '../../utils/date';
import { formatMoney } from '../../utils/format';
import { Button } from '../ui/Button';
import { AmountInput, Input, Textarea } from '../ui/Input';
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
  const enteredAmount = parseFloat(amount.replace(/\s+/g, '')) || 0;
  const newRemaining = Math.max(0, remaining - enteredAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (enteredAmount <= 0) {
      setError('Укажите корректную сумму платежа');
      return;
    }
    if (enteredAmount > remaining) {
      setError(`Сумма платежа не может превышать остаток (${formatMoney(remaining, 'UZS')})`);
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
      maxWidth="md"
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
        <div className="p-4 bg-[#11151B] border border-[#242A33] rounded-xl space-y-2 text-xs">
          <div className="flex justify-between text-[#8B93A1]">
            <span>Общая сумма долга:</span>
            <span className="font-semibold text-[#F5F7FA]">
              {formatMoney(paymentTargetDebt.totalAmount, 'UZS')}
            </span>
          </div>
          <div className="flex justify-between text-[#8B93A1]">
            <span>Уже выплачено:</span>
            <span className="text-emerald-400 font-medium">
              {formatMoney(paidAmount, 'UZS')}
            </span>
          </div>
          <div className="flex justify-between text-[#8B93A1] pt-2 border-t border-[#242A33]">
            <span className="font-medium">Текущий остаток к погашению:</span>
            <span className="font-bold text-[#F5F7FA] text-sm">
              {formatMoney(remaining, 'UZS')}
            </span>
          </div>
        </div>

        <AmountInput
          label="Сумма платежа (сум)"
          placeholder="50 000"
          value={amount}
          onChange={(val) => {
            setAmount(val);
            setError('');
          }}
          error={error}
          required
          autoFocus
          rightElement={
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setAmount(String(remaining))}
                className="text-xs text-indigo-400 hover:text-indigo-300 underline font-medium cursor-pointer"
              >
                Вся сумма
              </button>
              <span className="font-semibold text-indigo-400">сум</span>
            </div>
          }
        />

        {enteredAmount > 0 && enteredAmount <= remaining && (
          <div className="p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs flex justify-between items-center text-indigo-300">
            <span>Останется после платежа:</span>
            <span className="font-bold">
              {formatMoney(newRemaining, 'UZS')}
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
          placeholder="Номер транзакции, способ перевода..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
      </form>
    </Modal>
  );
};

