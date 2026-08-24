import React, { useEffect, useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Currency, DebtType } from '../../types';
import { getTodayDateString } from '../../utils/date';
import { Button } from '../ui/Button';
import { Input, Select, Textarea } from '../ui/Input';
import { Modal } from '../ui/Modal';

export const DebtModal: React.FC = () => {
  const {
    isDebtModalOpen,
    closeDebtModal,
    editingDebt,
    defaultDebtType,
    addDebt,
    updateDebt,
    people,
    addPerson,
    settings,
  } = useApp();

  const [type, setType] = useState<DebtType>('they_owe');
  const [personId, setPersonId] = useState('');
  const [customPersonName, setCustomPersonName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [currency, setCurrency] = useState<Currency>(settings.defaultCurrency);
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState(getTodayDateString());
  const [deadlineDate, setDeadlineDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (editingDebt) {
      setType(editingDebt.type);
      setPersonId(editingDebt.personId || '');
      setCustomPersonName(editingDebt.personName || '');
      setTotalAmount(String(editingDebt.totalAmount));
      setCurrency(editingDebt.currency);
      setReason(editingDebt.reason);
      setStartDate(editingDebt.startDate);
      setDeadlineDate(editingDebt.deadlineDate);
      setNotes(editingDebt.notes || '');
    } else {
      setType(defaultDebtType);
      setPersonId('');
      setCustomPersonName('');
      setTotalAmount('');
      setCurrency(settings.defaultCurrency);
      setReason('');
      setStartDate(getTodayDateString());
      // Default deadline in 30 days
      const d = new Date();
      d.setDate(d.getDate() + 30);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      setDeadlineDate(`${year}-${month}-${day}`);
      setNotes('');
    }
    setError('');
  }, [editingDebt, defaultDebtType, isDebtModalOpen, settings.defaultCurrency]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(totalAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError('Укажите корректную сумму');
      return;
    }

    let finalPersonId = personId;
    let finalPersonName = '';

    if (personId) {
      const p = people.find((item) => item.id === personId);
      finalPersonName = p ? p.name : '';
    } else if (customPersonName.trim()) {
      // Auto-create person contact
      const created = addPerson({
        name: customPersonName.trim(),
        roleOrRelation: 'Контакт по долгу',
      });
      finalPersonId = created.id;
      finalPersonName = created.name;
    } else {
      setError('Выберите человека из списка или введите имя');
      return;
    }

    if (!reason.trim()) {
      setError('Укажите причину или основание долга');
      return;
    }
    if (!startDate || !deadlineDate) {
      setError('Укажите дату выдачи и срок возврата');
      return;
    }

    const payload = {
      type,
      personId: finalPersonId,
      personName: finalPersonName,
      totalAmount: amountNum,
      currency,
      reason: reason.trim(),
      startDate,
      deadlineDate,
      notes: notes.trim(),
    };

    if (editingDebt) {
      updateDebt(editingDebt.id, payload);
    } else {
      addDebt(payload);
    }

    closeDebtModal();
  };

  return (
    <Modal
      isOpen={isDebtModalOpen}
      onClose={closeDebtModal}
      title={editingDebt ? 'Редактировать запись о долге' : type === 'they_owe' ? 'Мне должны (Дебиторка)' : 'Я должен (Кредиторка)'}
      subtitle="Фиксация обязательств, сроков и условий погашения"
      maxWidth="md"
      footer={
        <>
          <Button variant="secondary" size="sm" type="button" onClick={closeDebtModal}>
            Отмена
          </Button>
          <Button variant="primary" size="sm" type="button" onClick={handleSubmit}>
            {editingDebt ? 'Сохранить изменения' : 'Создать запись'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Debt Type Selector */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-[#11151B] border border-[#242A33] rounded-lg">
          <button
            type="button"
            onClick={() => setType('they_owe')}
            className={`py-2 text-xs font-semibold rounded-md transition cursor-pointer ${
              type === 'they_owe'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-[#8B93A1] hover:text-[#F5F7FA]'
            }`}
          >
            Мне должны (+)
          </button>
          <button
            type="button"
            onClick={() => setType('i_owe')}
            className={`py-2 text-xs font-semibold rounded-md transition cursor-pointer ${
              type === 'i_owe'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'text-[#8B93A1] hover:text-[#F5F7FA]'
            }`}
          >
            Я должен (-)
          </button>
        </div>

        {/* Person selection */}
        <div className="space-y-2 text-left">
          <Select
            label="Человек / Контрагент"
            value={personId}
            onChange={(e) => {
              setPersonId(e.target.value);
              if (e.target.value) setCustomPersonName('');
            }}
          >
            <option value="">+ Ввести новое имя или выберите из контактов...</option>
            {people.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.roleOrRelation ? `(${p.roleOrRelation})` : ''}
              </option>
            ))}
          </Select>

          {!personId && (
            <Input
              placeholder="Имя человека (например: Иван Смирнов)"
              value={customPersonName}
              onChange={(e) => setCustomPersonName(e.target.value)}
              helperText="Новый контакт будет автоматически сохранен в раздел 'Люди'"
              required={!personId}
            />
          )}
        </div>

        {/* Amount & Currency */}
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <Input
              label="Сумма долга"
              type="number"
              step="0.01"
              min="0"
              placeholder="1000"
              value={totalAmount}
              onChange={(e) => {
                setTotalAmount(e.target.value);
                setError('');
              }}
              error={error}
              required
            />
          </div>
          <Select
            label="Валюта"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
          >
            <option value="USD">USD ($)</option>
            <option value="UZS">UZS (сум)</option>
            <option value="EUR">EUR (€)</option>
            <option value="RUB">RUB (₽)</option>
          </Select>
        </div>

        <Input
          label="Причина / Назначение"
          placeholder="Например: Личные деньги на закупку техники"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required
        />

        {/* Dates */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Дата возникновения"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
          />
          <Input
            label="Срок возврата (Дедлайн)"
            type="date"
            value={deadlineDate}
            onChange={(e) => setDeadlineDate(e.target.value)}
            required
          />
        </div>

        <Textarea
          label="Примечания / Договоренности"
          placeholder="Условия возврата, процентная ставка, график платежей..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
        />
      </form>
    </Modal>
  );
};
